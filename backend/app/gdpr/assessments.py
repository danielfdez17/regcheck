"""Compliance assessment persistence helpers."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import desc
from sqlmodel import Session, select

from app.db.models import ComplianceAssessmentModel, RuleOptionModel
from app.gdpr.catalog import build_gdpr_checklist, build_or_filter, load_domain_mode
from app.gdpr.schemas import (
    AssessmentHistoryItem,
    AssessmentHistoryResponse,
    AssessmentSummary,
    ChecklistItemUpdateRequest,
    ChecklistItem,
    GDPRAssessmentResponse,
    GDPRChecklistRequest,
    RuleOption,
)


@dataclass(frozen=True)
class AssessmentOwner:
    """Authenticated ownership scope for persisted assessments."""

    tenant_id: str
    user_id: str


def create_assessment(
    session: Session,
    request: GDPRChecklistRequest,
    owner: AssessmentOwner,
) -> GDPRAssessmentResponse:
    """Generate, persist, and return a GDPR assessment snapshot."""

    checklist = build_gdpr_checklist(session, request)
    summary = build_assessment_summary(checklist.checklist_items, checklist.recommended_rule_ids)
    assessment_row = ComplianceAssessmentModel(
        id=uuid4().hex,
        created_at=datetime.now(timezone.utc),
        tenant_id=owner.tenant_id,
        created_by_user_id=owner.user_id,
        domain_mode_id=checklist.domain_mode.id,
        company_profile=request.company_profile.model_dump() if request.company_profile else {},
        selected_rule_ids=[rule.id for rule in checklist.selected_rules],
        recommended_rule_ids=checklist.recommended_rule_ids,
        checklist_items=[item.model_dump(mode="json") for item in checklist.checklist_items],
        total_items=summary.total_items,
        high_priority_items=summary.high_priority_items,
        medium_priority_items=summary.medium_priority_items,
        low_priority_items=summary.low_priority_items,
    )
    session.add(assessment_row)
    session.commit()
    session.refresh(assessment_row)

    return GDPRAssessmentResponse(
        assessment_id=assessment_row.id,
        created_at=assessment_row.created_at,
        request=request,
        domain_mode=checklist.domain_mode,
        selected_rules=checklist.selected_rules,
        checklist_items=checklist.checklist_items,
        recommended_rule_ids=checklist.recommended_rule_ids,
        summary=summary,
    )


def get_latest_assessment(
    session: Session,
    owner: AssessmentOwner,
) -> GDPRAssessmentResponse | None:
    """Return the latest stored assessment for one user, if one exists."""

    row = session.exec(
        select(ComplianceAssessmentModel)
        .where(ComplianceAssessmentModel.tenant_id == owner.tenant_id)
        .where(ComplianceAssessmentModel.created_by_user_id == owner.user_id)
        .order_by(desc(ComplianceAssessmentModel.created_at))
    ).first()
    if row is None:
        return None

    return build_assessment_response(session, row)


def get_assessment(
    session: Session,
    assessment_id: str,
    owner: AssessmentOwner,
) -> GDPRAssessmentResponse | None:
    """Return one stored assessment for the current user, if it exists."""

    row = session.get(ComplianceAssessmentModel, assessment_id)
    if (
        row is None
        or row.tenant_id != owner.tenant_id
        or row.created_by_user_id != owner.user_id
    ):
        return None

    return build_assessment_response(session, row)


def list_assessments(
    session: Session,
    owner: AssessmentOwner,
    limit: int = 50,
) -> AssessmentHistoryResponse:
    """Return recent stored assessments with compact summaries for one user."""

    capped_limit = max(1, min(limit, 100))
    rows = session.exec(
        select(ComplianceAssessmentModel)
        .where(ComplianceAssessmentModel.tenant_id == owner.tenant_id)
        .where(ComplianceAssessmentModel.created_by_user_id == owner.user_id)
        .order_by(desc(ComplianceAssessmentModel.created_at))
        .limit(capped_limit)
    ).all()
    if not rows:
        return AssessmentHistoryResponse(items=[])

    selected_rule_map = load_rule_label_map(session)
    items: list[AssessmentHistoryItem] = []
    for row in rows:
        checklist_items = [
            ChecklistItem.model_validate(item) for item in row.checklist_items
        ]
        high_priority_done_items = sum(
            1
            for item in checklist_items
            if item.priority == "high" and item.status == "done"
        )
        items.append(
            AssessmentHistoryItem(
                assessment_id=row.id,
                created_at=row.created_at,
                company_type=str(
                    (row.company_profile or {}).get("company_type", "other")
                ),
                service_description=str(
                    (row.company_profile or {}).get("service_description", "")
                ),
                selected_rule_labels=[
                    selected_rule_map.get(rule_id, rule_id)
                    for rule_id in row.selected_rule_ids
                ],
                selected_rule_count=len(row.selected_rule_ids),
                total_items=row.total_items,
                done_items=sum(
                    1 for item in checklist_items if item.status == "done"
                ),
                high_priority_items=row.high_priority_items,
                high_priority_done_items=high_priority_done_items,
                medium_priority_items=row.medium_priority_items,
                low_priority_items=row.low_priority_items,
            )
        )

    return AssessmentHistoryResponse(items=items)


def update_assessment_checklist_item(
    session: Session,
    assessment_id: str,
    checklist_item_id: str,
    payload: ChecklistItemUpdateRequest,
    owner: AssessmentOwner,
) -> GDPRAssessmentResponse | None:
    """Update one checklist item status/evidence metadata in an assessment."""

    row = session.get(ComplianceAssessmentModel, assessment_id)
    if (
        row is None
        or row.tenant_id != owner.tenant_id
        or row.created_by_user_id != owner.user_id
    ):
        return None

    checklist_items = [ChecklistItem.model_validate(item) for item in row.checklist_items]
    updated = False

    for index, item in enumerate(checklist_items):
        if item.id != checklist_item_id:
            continue

        next_item = item.model_copy(deep=True)
        if payload.status is not None:
            next_item.status = payload.status
        if payload.evidence_entries is not None:
            next_item.evidence_entries = payload.evidence_entries
        checklist_items[index] = next_item
        updated = True
        break

    if not updated:
        return None

    summary = build_assessment_summary(checklist_items, row.recommended_rule_ids)
    row.checklist_items = [item.model_dump(mode="json") for item in checklist_items]
    row.total_items = summary.total_items
    row.high_priority_items = summary.high_priority_items
    row.medium_priority_items = summary.medium_priority_items
    row.low_priority_items = summary.low_priority_items
    session.add(row)
    session.commit()
    session.refresh(row)

    domain_mode = load_domain_mode(session)
    selected_rules = load_selected_rules(session, row.selected_rule_ids)
    request = GDPRChecklistRequest(
        selected_rule_ids=row.selected_rule_ids,
        company_profile=row.company_profile or None,
    )

    return GDPRAssessmentResponse(
        assessment_id=row.id,
        created_at=row.created_at,
        request=request,
        domain_mode=domain_mode,
        selected_rules=selected_rules,
        checklist_items=checklist_items,
        recommended_rule_ids=row.recommended_rule_ids,
        summary=summary,
    )


def build_assessment_summary(
    checklist_items: list[ChecklistItem],
    recommended_rule_ids: list[str],
) -> AssessmentSummary:
    """Aggregate checklist metrics for dashboard display."""

    priorities = Counter(item.priority for item in checklist_items)
    done_items = sum(1 for item in checklist_items if item.status == "done")
    high_priority_done_items = sum(
        1
        for item in checklist_items
        if item.priority == "high" and item.status == "done"
    )
    return AssessmentSummary(
        selected_rule_count=len({item.rule_id for item in checklist_items}),
        total_items=len(checklist_items),
        done_items=done_items,
        high_priority_items=priorities.get("high", 0),
        high_priority_done_items=high_priority_done_items,
        medium_priority_items=priorities.get("medium", 0),
        low_priority_items=priorities.get("low", 0),
        recommended_rule_count=len(recommended_rule_ids),
    )


def build_assessment_response(
    session: Session,
    row: ComplianceAssessmentModel,
) -> GDPRAssessmentResponse:
    """Build the public response payload for a persisted assessment row."""

    domain_mode = load_domain_mode(session)
    selected_rules = load_selected_rules(session, row.selected_rule_ids)
    checklist_items = [ChecklistItem.model_validate(item) for item in row.checklist_items]
    summary = build_assessment_summary(checklist_items, row.recommended_rule_ids)
    request = GDPRChecklistRequest(
        selected_rule_ids=row.selected_rule_ids,
        company_profile=row.company_profile or None,
    )

    return GDPRAssessmentResponse(
        assessment_id=row.id,
        created_at=row.created_at,
        request=request,
        domain_mode=domain_mode,
        selected_rules=selected_rules,
        checklist_items=checklist_items,
        recommended_rule_ids=row.recommended_rule_ids,
        summary=summary,
    )


def load_selected_rules(session: Session, rule_ids: list[str]) -> list[RuleOption]:
    """Load selected rules preserving the input order."""

    if not rule_ids:
        return []

    rule_filter = build_or_filter(RuleOptionModel.id, rule_ids)
    rule_rows = session.exec(select(RuleOptionModel).where(rule_filter)).all()
    rule_by_id = {row.id: row for row in rule_rows}

    return [
        RuleOption(
            id=rule_by_id[rule_id].id,
            label=rule_by_id[rule_id].label,
            description=rule_by_id[rule_id].description,
            checklist_item_ids=[],
        )
        for rule_id in rule_ids
        if rule_id in rule_by_id
    ]


def load_rule_label_map(session: Session) -> dict[str, str]:
    """Load the current rule labels keyed by identifier."""

    rule_rows = session.exec(select(RuleOptionModel)).all()
    return {row.id: row.label for row in rule_rows}
