"""Database models for GDPR persistence."""

# pylint: disable=too-few-public-methods

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import Column, JSON

from sqlmodel import Field, SQLModel


class TenantModel(SQLModel, table=True):
    """Persisted tenant organization."""

    __tablename__ = "tenants"

    id: str = Field(primary_key=True)
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class UserModel(SQLModel, table=True):
    """Persisted user account linked to one tenant."""

    __tablename__ = "users"

    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenants.id", index=True)
    first_name: str
    last_name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


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


class ComplianceAssessmentModel(SQLModel, table=True):
    """Persisted compliance assessment snapshot."""

    __tablename__ = "compliance_assessments"

    id: str = Field(primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    tenant_id: str = Field(foreign_key="tenants.id", index=True)
    created_by_user_id: str | None = Field(
        default=None,
        foreign_key="users.id",
        index=True,
    )
    domain_mode_id: str = Field(foreign_key="domain_modes.id", index=True)
    company_profile: dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSON, nullable=False),
    )
    selected_rule_ids: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    recommended_rule_ids: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    checklist_items: list[dict[str, Any]] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    # Stored checklist snapshots may include status and evidence metadata per item.
    total_items: int
    high_priority_items: int
    medium_priority_items: int
    low_priority_items: int
