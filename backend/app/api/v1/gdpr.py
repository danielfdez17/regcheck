"""GDPR domain mode endpoints."""

from fastapi import APIRouter

from app.gdpr.catalog import build_gdpr_checklist, get_gdpr_rule_selector
from app.gdpr.schemas import GDPRChecklistRequest, GDPRChecklistResponse, GDPRRuleSelectorResponse

router = APIRouter(prefix="/gdpr", tags=["gdpr"])


@router.get("/rule-selector")
async def read_rule_selector() -> GDPRRuleSelectorResponse:
    """Return the GDPR rule selector payload."""

    return get_gdpr_rule_selector()


@router.post("/checklists")
async def create_checklist_preview(
    request: GDPRChecklistRequest,
) -> GDPRChecklistResponse:
    """Return a GDPR checklist preview for the selected rules."""

    return build_gdpr_checklist(request)
