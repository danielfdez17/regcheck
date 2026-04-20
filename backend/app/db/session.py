"""Database engine/session helpers and bootstrap initialization."""

from __future__ import annotations

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine, select

from app.core.config import settings
from app.db.models import ChecklistItemModel, DomainModeModel, RuleOptionModel
from app.gdpr.seed_data import (
    DEFAULT_CHECKLIST_ITEMS,
    DEFAULT_DOMAIN_MODE,
    DEFAULT_RULES,
)

sqlite_connect_args = (
    {"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {}
)

engine = create_engine(
    settings.database_url,
    echo=settings.db_echo,
    connect_args=sqlite_connect_args,
)


def get_session() -> Generator[Session, None, None]:
    """Yield a database session for request-scoped dependencies."""

    with Session(engine) as session:
        yield session


def initialize_database() -> None:
    """Create all tables and insert default GDPR catalog rows if missing."""

    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        seed_domain_mode(session)
        seed_rules(session)
        seed_checklist_items(session)
        session.commit()


def seed_domain_mode(session: Session) -> None:
    """Insert default domain mode if it is not already present."""

    existing_domain = session.get(DomainModeModel, str(DEFAULT_DOMAIN_MODE["id"]))
    if existing_domain is None:
        session.add(DomainModeModel.model_validate(DEFAULT_DOMAIN_MODE))


def seed_rules(session: Session) -> None:
    """Insert default rule options if they are missing."""

    existing_rule_ids = {
        rule.id for rule in session.exec(select(RuleOptionModel)).all()
    }
    for rule_payload in DEFAULT_RULES:
        rule_id = str(rule_payload["id"])
        if rule_id not in existing_rule_ids:
            session.add(RuleOptionModel.model_validate(rule_payload))


def seed_checklist_items(session: Session) -> None:
    """Insert default checklist items if they are missing."""

    existing_item_ids = {
        item.id for item in session.exec(select(ChecklistItemModel)).all()
    }
    for item_payload in DEFAULT_CHECKLIST_ITEMS:
        item_id = str(item_payload["id"])
        if item_id not in existing_item_ids:
            session.add(ChecklistItemModel.model_validate(item_payload))
