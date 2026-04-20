"""Database models for GDPR persistence."""

# pylint: disable=too-few-public-methods

from __future__ import annotations

from sqlmodel import Field, SQLModel


class DomainModeModel(SQLModel, table=True):
    """Persisted domain mode configuration."""

    __tablename__ = "domain_modes"

    id: str = Field(primary_key=True)
    label: str
    description: str
    is_default: bool = False


class RuleOptionModel(SQLModel, table=True):
    """Persisted rule options for one domain mode."""

    __tablename__ = "rule_options"

    id: str = Field(primary_key=True)
    domain_mode_id: str = Field(foreign_key="domain_modes.id", index=True)
    label: str
    description: str


class ChecklistItemModel(SQLModel, table=True):
    """Persisted checklist item mapped to one rule option."""

    __tablename__ = "checklist_items"

    id: str = Field(primary_key=True)
    rule_id: str = Field(foreign_key="rule_options.id", index=True)
    title: str
    description: str
    priority: str
    status: str = "pending"
