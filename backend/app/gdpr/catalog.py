"""GDPR catalog services backed by persistent SQLite entities."""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlmodel import Session, select

from app.db.models import ChecklistItemModel, DomainModeModel, RuleOptionModel
from app.gdpr.schemas import (
    ChecklistItem,
    DomainMode,
    GDPRChecklistRequest,
    GDPRChecklistResponse,
    GDPRRuleSelectorResponse,
    RuleOption,
)

def get_gdpr_rule_selector(session: Session) -> GDPRRuleSelectorResponse:
    """Return the available GDPR rule selector payload."""

    domain_mode = load_domain_mode(session)
    available_rules = load_rule_options(session, [domain_mode.id])

    return GDPRRuleSelectorResponse(
        domain_mode=domain_mode,
        available_rules=available_rules,
    )


def build_gdpr_checklist(session: Session, request: GDPRChecklistRequest) -> GDPRChecklistResponse:
    """Build a GDPR checklist preview from the selected rules."""

    domain_mode = load_domain_mode(session)
    available_rules = load_rule_options(session, [domain_mode.id])
    available_rule_ids = [rule.id for rule in available_rules]

    selected_rule_ids = request.selected_rule_ids or available_rule_ids
    selected_rules = [rule for rule in available_rules if rule.id in selected_rule_ids]

    unknown_rule_ids = sorted(set(selected_rule_ids) - set(available_rule_ids))
    if unknown_rule_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Unknown GDPR rule identifiers.",
                "unknown_rule_ids": unknown_rule_ids,
            },
        )

    checklist_items = load_checklist_items(session, selected_rule_ids)

    return GDPRChecklistResponse(
        domain_mode=domain_mode,
        selected_rules=selected_rules,
        checklist_items=checklist_items,
    )


def load_domain_mode(session: Session) -> DomainMode:
    """Load the default GDPR domain mode from persistence."""

    domain_mode_row = session.exec(
        select(DomainModeModel).where(DomainModeModel.id == "gdpr")
    ).first()
    if domain_mode_row is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "GDPR domain mode is not configured in persistence."},
        )

    return DomainMode.model_validate(domain_mode_row.model_dump())


def load_rule_options(session: Session, domain_mode_ids: list[str]) -> list[RuleOption]:
    """Load rules and attach associated checklist item identifiers."""

    if not domain_mode_ids:
        return []

    domain_mode_filter = build_or_filter(RuleOptionModel.domain_mode_id, domain_mode_ids)
    rule_rows = session.exec(select(RuleOptionModel).where(domain_mode_filter)).all()

    if not rule_rows:
        return []

    rule_ids = [rule.id for rule in rule_rows]
    rule_filter = build_or_filter(ChecklistItemModel.rule_id, rule_ids)
    item_rows = session.exec(select(ChecklistItemModel).where(rule_filter)).all()

    item_ids_by_rule: dict[str, list[str]] = {}
    for item_row in item_rows:
        item_ids_by_rule.setdefault(item_row.rule_id, []).append(item_row.id)

    return [
        RuleOption(
            id=rule_row.id,
            label=rule_row.label,
            description=rule_row.description,
            checklist_item_ids=item_ids_by_rule.get(rule_row.id, []),
        )
        for rule_row in rule_rows
    ]


def load_checklist_items(session: Session, rule_ids: list[str]) -> list[ChecklistItem]:
    """Load checklist items for selected rule identifiers."""

    if not rule_ids:
        return []

    rule_filter = build_or_filter(ChecklistItemModel.rule_id, rule_ids)
    item_rows = session.exec(select(ChecklistItemModel).where(rule_filter)).all()

    return [
        ChecklistItem(
            id=item_row.id,
            title=item_row.title,
            description=item_row.description,
            priority=item_row.priority,
            status=item_row.status,
            rule_id=item_row.rule_id,
        )
        for item_row in item_rows
    ]


def build_or_filter(field, values: list[str]):
    """Build a SQLAlchemy OR predicate for one field and many values."""

    if len(values) == 1:
        return field == values[0]

    return or_(*(field == value for value in values))
