"""GDPR domain mode endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.gdpr.catalog import build_gdpr_checklist, get_gdpr_rule_selector
from app.db.session import get_session
from app.gdpr.schemas import GDPRChecklistRequest, GDPRChecklistResponse, GDPRRuleSelectorResponse

router = APIRouter(prefix="/gdpr", tags=["gdpr"])


@router.get("/rule-selector")
async def read_rule_selector(
    session: Annotated[Session, Depends(get_session)],
) -> GDPRRuleSelectorResponse:
    """Return the GDPR rule selector payload."""

    return get_gdpr_rule_selector(session)


@router.post("/checklists")
async def create_checklist_preview(
    request: GDPRChecklistRequest,
    session: Annotated[Session, Depends(get_session)],
) -> GDPRChecklistResponse:
    """Return a GDPR checklist preview for the selected rules."""

    return build_gdpr_checklist(session, request)
