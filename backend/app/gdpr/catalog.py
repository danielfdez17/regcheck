"""Static GDPR domain catalog used for the first API slice."""

from __future__ import annotations

from fastapi import HTTPException, status

from app.gdpr.schemas import (
    ChecklistItem,
    DomainMode,
    GDPRChecklistRequest,
    GDPRChecklistResponse,
    GDPRRuleSelectorResponse,
    RuleOption,
)

GDPR_DOMAIN_MODE = DomainMode(
    id="gdpr",
    label="GDPR",
    description="Select the GDPR domain to generate an actionable compliance checklist.",
    is_default=True,
)

GDPR_RULES: list[RuleOption] = [
    RuleOption(
        id="personal_data_processing",
        label="Personal data processing",
        description="You process personal data for customers, leads, employees, or vendors.",
        checklist_item_ids=[
            "document-processing-activities",
            "publish-privacy-policy",
            "track-retention-periods",
            "define-dsr-process",
            "assign-privacy-owner",
        ],
    ),
]

GDPR_CHECKLIST_ITEMS: dict[str, ChecklistItem] = {
    "document-processing-activities": ChecklistItem(
        id="document-processing-activities",
        title="Document processing activities",
        description="Keep a record of what personal data you collect, why you collect it, and where you store it.",
        priority="high",
        rule_id="personal_data_processing",
    ),
    "publish-privacy-policy": ChecklistItem(
        id="publish-privacy-policy",
        title="Publish a privacy policy",
        description="Explain the legal basis, retention policy, and rights available to data subjects.",
        priority="high",
        rule_id="personal_data_processing",
    ),
    "track-retention-periods": ChecklistItem(
        id="track-retention-periods",
        title="Track retention periods",
        description="Define how long each category of personal data is kept and when it must be deleted.",
        priority="medium",
        rule_id="personal_data_processing",
    ),
    "define-dsr-process": ChecklistItem(
        id="define-dsr-process",
        title="Define a data subject request process",
        description="Create a process to handle access, rectification, deletion, and portability requests.",
        priority="high",
        rule_id="personal_data_processing",
    ),
    "assign-privacy-owner": ChecklistItem(
        id="assign-privacy-owner",
        title="Assign a privacy owner",
        description="Ensure a named owner is accountable for GDPR governance and follow-up actions.",
        priority="medium",
        rule_id="personal_data_processing",
    ),
}


def get_gdpr_rule_selector() -> GDPRRuleSelectorResponse:
    """Return the available GDPR rule selector payload."""

    return GDPRRuleSelectorResponse(
        domain_mode=GDPR_DOMAIN_MODE,
        available_rules=GDPR_RULES,
    )


def build_gdpr_checklist(request: GDPRChecklistRequest) -> GDPRChecklistResponse:
    """Build a GDPR checklist preview from the selected rules."""

    selected_rule_ids = request.selected_rule_ids or [rule.id for rule in GDPR_RULES]
    selected_rules = [rule for rule in GDPR_RULES if rule.id in selected_rule_ids]

    unknown_rule_ids = sorted(set(selected_rule_ids) - {rule.id for rule in GDPR_RULES})
    if unknown_rule_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Unknown GDPR rule identifiers.",
                "unknown_rule_ids": unknown_rule_ids,
            },
        )

    selected_item_ids = {
        item_id for rule in selected_rules for item_id in rule.checklist_item_ids
    }
    checklist_items = [
        GDPR_CHECKLIST_ITEMS[item_id]
        for item_id in GDPR_CHECKLIST_ITEMS
        if item_id in selected_item_ids
    ]

    return GDPRChecklistResponse(
        domain_mode=GDPR_DOMAIN_MODE,
        selected_rules=selected_rules,
        checklist_items=checklist_items,
    )
