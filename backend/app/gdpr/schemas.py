"""Pydantic schemas for the GDPR domain mode."""

from __future__ import annotations

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


class ChecklistItem(BaseModel):
    """Represents one actionable checklist item."""

    id: str
    title: str
    description: str
    priority: ChecklistPriority
    status: ChecklistStatus = "pending"
    rule_id: str


class GDPRRuleSelectorResponse(BaseModel):
    """Response payload for the GDPR rule selector endpoint."""

    domain_mode: DomainMode
    available_rules: list[RuleOption]


class GDPRChecklistRequest(BaseModel):
    """Request payload for generating a GDPR checklist preview."""

    selected_rule_ids: list[str] = Field(default_factory=list)


class GDPRChecklistResponse(BaseModel):
    """Response payload for the GDPR checklist endpoint."""

    domain_mode: DomainMode
    selected_rules: list[RuleOption]
    checklist_items: list[ChecklistItem]
