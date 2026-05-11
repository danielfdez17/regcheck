"""GDPR catalog services backed by persistent SQLite entities."""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlmodel import Session, select

from app.db.models import ChecklistItemModel, DomainModeModel, RuleOptionModel
from app.gdpr.schemas import (
    ChecklistItem,
    CompanyProfileInput,
    CompanyProfileOptions,
    DomainMode,
    GDPRChecklistRequest,
    GDPRChecklistResponse,
    GDPRRuleSelectorResponse,
    RuleOption,
)

DEFAULT_PROFILE_OPTIONS = CompanyProfileOptions(
    company_types=[
        "startup",
        "sme",
        "enterprise",
        "public_sector",
        "other",
    ],
    department_types=[
        "hhrr",
        "development",
        "satellites",
        "cyber",
        "operations",
    ],
    framework_options=["gdpr", "iso_27001"],
)

SERVICE_RULE_HINTS: dict[str, str] = {
    "cyber": "security_monitoring_incident_response",
    "soc": "security_monitoring_incident_response",
    "satellite": "satellite_systems_and_telemetry_security",
    "photovoltaic": "satellite_systems_and_telemetry_security",
    "web": "web_platform_security_and_privacy",
    "website": "web_platform_security_and_privacy",
    "audit": "web_platform_security_and_privacy",
    "software": "devsecops_secure_sdlc",
    "development": "devsecops_secure_sdlc",
    "cloud": "cloud_security_controls",
}

DEPARTMENT_RULE_HINTS: dict[str, str] = {
    "hhrr": "employee_data_and_access_governance",
    "hr": "employee_data_and_access_governance",
    "development": "devsecops_secure_sdlc",
    "satellites": "satellite_systems_and_telemetry_security",
    "cyber": "security_monitoring_incident_response",
}

FRAMEWORK_RULE_HINTS: dict[str, str] = {
    "gdpr": "personal_data_processing",
    "iso_27001": "iso_27001_control_baseline",
    "iso/iec 27001": "iso_27001_control_baseline",
}

CHECKLIST_ENRICHMENTS: dict[str, dict[str, str]] = {
    "document-processing-activities": {
        "concrete_action": (
            "Build and maintain a processing inventory grouped by data subject "
            "and data category."
        ),
        "evidence_request": "Upload the latest Record of Processing Activities document.",
    },
    "publish-privacy-policy": {
        "concrete_action": (
            "Publish a policy version with lawful basis, retention, and "
            "contact channels."
        ),
        "evidence_request": "Provide the public URL and the approval/review date.",
    },
    "track-retention-periods": {
        "concrete_action": "Define and enforce retention schedules per data category.",
        "evidence_request": "Attach the retention matrix and one deletion proof sample.",
    },
    "define-dsr-process": {
        "concrete_action": "Create an SLA-driven data subject request workflow with owners.",
        "evidence_request": "Share one closed DSR ticket showing timestamps and resolution.",
    },
    "assign-privacy-owner": {
        "concrete_action": "Assign accountability for GDPR governance and escalation paths.",
        "evidence_request": "Provide the responsibility matrix and role nomination record.",
    },
}

def get_gdpr_rule_selector(session: Session) -> GDPRRuleSelectorResponse:
    """Return the available GDPR rule selector payload."""

    domain_mode = load_domain_mode(session)
    available_rules = load_rule_options(session, [domain_mode.id])

    return GDPRRuleSelectorResponse(
        domain_mode=domain_mode,
        available_rules=available_rules,
        profile_options=DEFAULT_PROFILE_OPTIONS,
    )


def build_gdpr_checklist(session: Session, request: GDPRChecklistRequest) -> GDPRChecklistResponse:
    """Build a GDPR checklist preview from the selected rules."""

    domain_mode = load_domain_mode(session)
    available_rules = load_rule_options(session, [domain_mode.id])
    available_rule_ids = [rule.id for rule in available_rules]

    recommended_rule_ids = recommend_rule_ids(request.company_profile)
    selected_rule_ids = merge_rule_ids(
        request.selected_rule_ids,
        recommended_rule_ids,
        available_rule_ids,
    )
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
        recommended_rule_ids=[
            rule_id for rule_id in recommended_rule_ids if rule_id in available_rule_ids
        ],
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

    checklist_items: list[ChecklistItem] = []
    for item_row in item_rows:
        enrichment = CHECKLIST_ENRICHMENTS.get(item_row.id, {})
        concrete_action = enrichment.get(
            "concrete_action",
            f"Implement and verify: {item_row.title.lower()}.",
        )
        evidence_request = enrichment.get(
            "evidence_request",
            "Attach one current policy/procedure artifact and one execution record.",
        )
        checklist_items.append(
            ChecklistItem(
                id=item_row.id,
                title=item_row.title,
                description=item_row.description,
                priority=item_row.priority,
                status=item_row.status,
                rule_id=item_row.rule_id,
                concrete_action=concrete_action,
                evidence_request=evidence_request,
                evidence_entries=[],
            )
        )

    return checklist_items


def recommend_rule_ids(company_profile: CompanyProfileInput | None) -> list[str]:
    """Recommend rule identifiers from company profile context."""

    if company_profile is None:
        return []

    recommended_rule_ids: list[str] = ["personal_data_processing"]
    service_description = company_profile.service_description.strip().lower()

    for keyword, rule_id in SERVICE_RULE_HINTS.items():
        if keyword in service_description:
            recommended_rule_ids.append(rule_id)

    for department in company_profile.department_types:
        department_key = department.strip().lower()
        if department_key in DEPARTMENT_RULE_HINTS:
            recommended_rule_ids.append(DEPARTMENT_RULE_HINTS[department_key])

    for framework in company_profile.requested_frameworks:
        framework_key = framework.strip().lower()
        if framework_key in FRAMEWORK_RULE_HINTS:
            recommended_rule_ids.append(FRAMEWORK_RULE_HINTS[framework_key])

    if company_profile.uses_cloud:
        recommended_rule_ids.append("cloud_security_controls")
    if company_profile.has_physical_buildings:
        recommended_rule_ids.append("physical_access_and_video_control")
    if company_profile.supports_remote_work_vpn:
        recommended_rule_ids.append("remote_work_vpn_and_password_policy")

    return deduplicate(recommended_rule_ids)


def merge_rule_ids(
    selected_rule_ids: list[str],
    recommended_rule_ids: list[str],
    available_rule_ids: list[str],
) -> list[str]:
    """Merge manual and profile-driven rule identifiers with sensible defaults."""

    if selected_rule_ids:
        return deduplicate([*selected_rule_ids, *recommended_rule_ids])
    if recommended_rule_ids:
        return deduplicate(recommended_rule_ids)

    return available_rule_ids


def deduplicate(values: list[str]) -> list[str]:
    """Return ordered unique values from a list."""

    unique_values = dict.fromkeys(values)
    return list(unique_values)


def build_or_filter(field, values: list[str]):
    """Build a SQLAlchemy OR predicate for one field and many values."""

    if len(values) == 1:
        return field == values[0]

    return or_(*(field == value for value in values))
