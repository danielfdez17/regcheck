"""Pydantic schemas for the GDPR domain mode."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

ChecklistStatus = Literal["pending", "in_progress", "done"]
ChecklistPriority = Literal["high", "medium", "low"]


class DomainMode(BaseModel):
    """Represents an available regulatory domain mode."""

    id: str
    label: str
    description: str
    is_default: bool = False


class RuleOption(BaseModel):
    """Represents one selectable rule inside a domain mode."""

    id: str
    label: str
    description: str
    checklist_item_ids: list[str] = Field(default_factory=list)


class CompanyProfileOptions(BaseModel):
    """Predefined options for building a company profile input."""

    company_types: list[str] = Field(default_factory=list)
    department_types: list[str] = Field(default_factory=list)
    framework_options: list[str] = Field(default_factory=list)


class EvidenceEntry(BaseModel):
    """Metadata entry linked to one checklist control evidence."""

    id: str
    label: str
    reference_url: str | None = None
    notes: str | None = None
    created_at: datetime


class ChecklistItem(BaseModel):
    """Represents one actionable checklist item."""

    id: str
    title: str
    description: str
    priority: ChecklistPriority
    status: ChecklistStatus = "pending"
    rule_id: str
    concrete_action: str | None = None
    evidence_request: str | None = None
    evidence_entries: list[EvidenceEntry] = Field(default_factory=list)


class GDPRRuleSelectorResponse(BaseModel):
    """Response payload for the GDPR rule selector endpoint."""

    domain_mode: DomainMode
    available_rules: list[RuleOption]
    profile_options: CompanyProfileOptions


class CompanyProfileInput(BaseModel):
    """Company context used to recommend relevant controls and rules."""

    company_type: str = "other"
    department_types: list[str] = Field(default_factory=list)
    service_description: str = ""
    requested_frameworks: list[str] = Field(default_factory=list)
    uses_cloud: bool = False
    has_physical_buildings: bool = False
    supports_remote_work_vpn: bool = False


class GDPRChecklistRequest(BaseModel):
    """Request payload for generating a GDPR checklist preview."""

    selected_rule_ids: list[str] = Field(default_factory=list)
    company_profile: CompanyProfileInput | None = None


class ChecklistItemUpdateRequest(BaseModel):
    """Request payload to update one checklist item in an assessment."""

    status: ChecklistStatus | None = None
    evidence_entries: list[EvidenceEntry] | None = None


class GDPRChecklistResponse(BaseModel):
    """Response payload for the GDPR checklist endpoint."""

    domain_mode: DomainMode
    selected_rules: list[RuleOption]
    checklist_items: list[ChecklistItem]
    recommended_rule_ids: list[str] = Field(default_factory=list)


class AssessmentSummary(BaseModel):
    """Aggregated metrics for a generated compliance assessment."""

    selected_rule_count: int
    total_items: int
    done_items: int
    high_priority_items: int
    high_priority_done_items: int
    medium_priority_items: int
    low_priority_items: int
    recommended_rule_count: int


class GDPRAssessmentResponse(BaseModel):
    """Response payload for a persisted GDPR assessment."""

    assessment_id: str
    created_at: datetime
    request: GDPRChecklistRequest
    domain_mode: DomainMode
    selected_rules: list[RuleOption]
    checklist_items: list[ChecklistItem]
    recommended_rule_ids: list[str] = Field(default_factory=list)
    summary: AssessmentSummary


class AssessmentHistoryItem(BaseModel):
    """Compact summary of a stored GDPR assessment."""

    assessment_id: str
    created_at: datetime
    company_type: str
    service_description: str
    selected_rule_labels: list[str] = Field(default_factory=list)
    selected_rule_count: int
    total_items: int
    done_items: int
    high_priority_items: int
    high_priority_done_items: int
    medium_priority_items: int
    low_priority_items: int


class AssessmentHistoryResponse(BaseModel):
    """Response payload with recent assessment history."""

    items: list[AssessmentHistoryItem]
