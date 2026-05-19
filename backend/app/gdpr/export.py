"""Assessment export builders for CSV and Markdown formats."""

from __future__ import annotations

import csv
from io import StringIO

from app.gdpr.schemas import ChecklistItem, GDPRAssessmentResponse

CSV_FIELDNAMES = [
    "id",
    "title",
    "description",
    "priority",
    "status",
    "rule_id",
    "concrete_action",
    "evidence_request",
    "evidence_labels",
    "evidence_urls",
    "evidence_notes",
]


def _format_evidence_field(
    item: ChecklistItem,
    attribute: str,
) -> str:
    values: list[str] = []
    for entry in item.evidence_entries:
        value = getattr(entry, attribute)
        if value:
            values.append(str(value))
    return " | ".join(values)


def build_assessment_csv(assessment: GDPRAssessmentResponse) -> str:
    """Serialize checklist rows to CSV."""

    buffer = StringIO()
    writer = csv.DictWriter(buffer, fieldnames=CSV_FIELDNAMES)
    writer.writeheader()
    for item in assessment.checklist_items:
        writer.writerow(
            {
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "priority": item.priority,
                "status": item.status,
                "rule_id": item.rule_id,
                "concrete_action": item.concrete_action or "",
                "evidence_request": item.evidence_request or "",
                "evidence_labels": _format_evidence_field(item, "label"),
                "evidence_urls": _format_evidence_field(item, "reference_url"),
                "evidence_notes": _format_evidence_field(item, "notes"),
            }
        )
    return buffer.getvalue()


def _escape_markdown_cell(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ")


def build_assessment_markdown(assessment: GDPRAssessmentResponse) -> str:
    """Serialize assessment metadata and checklist rows to Markdown."""

    profile = assessment.request.company_profile
    company_type = profile.company_type if profile is not None else "other"
    service_description = profile.service_description if profile is not None else ""
    selected_rules = ", ".join(rule.label for rule in assessment.selected_rules)
    lines = [
        "# RegCheck assessment export",
        "",
        f"- Assessment ID: `{assessment.assessment_id}`",
        f"- Created at: {assessment.created_at.isoformat()}",
        f"- Company type: {company_type}",
        f"- Service description: {service_description or 'N/A'}",
        f"- Selected rules: {selected_rules or 'N/A'}",
        f"- Progress: {assessment.summary.done_items}/{assessment.summary.total_items} done",
        "",
        "## Checklist",
        "",
        "| Title | Priority | Status | Concrete action | Evidence request | Evidence |",
        "| --- | --- | --- | --- | --- | --- |",
    ]

    for item in assessment.checklist_items:
        evidence_summary = " ; ".join(
            " - ".join(
                part
                for part in [
                    entry.label,
                    entry.reference_url or "",
                    entry.notes or "",
                ]
                if part
            )
            for entry in item.evidence_entries
        )
        lines.append(
            "| "
            + " | ".join(
                _escape_markdown_cell(value)
                for value in [
                    item.title,
                    item.priority,
                    item.status,
                    item.concrete_action or "",
                    item.evidence_request or "",
                    evidence_summary,
                ]
            )
            + " |"
        )

    lines.append("")
    return "\n".join(lines)
