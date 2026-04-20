"""Seed payloads for GDPR default catalog data."""

from __future__ import annotations

from typing import Final

DEFAULT_DOMAIN_MODE: Final[dict[str, str | bool]] = {
    "id": "gdpr",
    "label": "GDPR",
    "description": "Select the GDPR domain to generate an actionable compliance checklist.",
    "is_default": True,
}

DEFAULT_RULES: Final[list[dict[str, str]]] = [
    {
        "id": "personal_data_processing",
        "domain_mode_id": "gdpr",
        "label": "Personal data processing",
        "description": "You process personal data for customers, leads, employees, or vendors.",
    },
]

DEFAULT_CHECKLIST_ITEMS: Final[list[dict[str, str]]] = [
    {
        "id": "document-processing-activities",
        "rule_id": "personal_data_processing",
        "title": "Document processing activities",
        "description": (
            "Keep a record of what personal data you collect, why you collect it, "
            "and where you store it."
        ),
        "priority": "high",
    },
    {
        "id": "publish-privacy-policy",
        "rule_id": "personal_data_processing",
        "title": "Publish a privacy policy",
        "description": (
            "Explain the legal basis, retention policy, and rights available "
            "to data subjects."
        ),
        "priority": "high",
    },
    {
        "id": "track-retention-periods",
        "rule_id": "personal_data_processing",
        "title": "Track retention periods",
        "description": (
            "Define how long each category of personal data is kept and when "
            "it must be deleted."
        ),
        "priority": "medium",
    },
    {
        "id": "define-dsr-process",
        "rule_id": "personal_data_processing",
        "title": "Define a data subject request process",
        "description": (
            "Create a process to handle access, rectification, deletion, "
            "and portability requests."
        ),
        "priority": "high",
    },
    {
        "id": "assign-privacy-owner",
        "rule_id": "personal_data_processing",
        "title": "Assign a privacy owner",
        "description": (
            "Ensure a named owner is accountable for GDPR governance "
            "and follow-up actions."
        ),
        "priority": "medium",
    },
]
