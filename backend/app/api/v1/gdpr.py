"""GDPR domain mode endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.gdpr.assessments import create_assessment, get_latest_assessment, list_assessments
from app.gdpr.catalog import build_gdpr_checklist, get_gdpr_rule_selector
from app.gdpr.schemas import (
    AssessmentHistoryResponse,
    GDPRAssessmentResponse,
    GDPRChecklistRequest,
    GDPRChecklistResponse,
    GDPRRuleSelectorResponse,
)

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


@router.post("/assessments")
async def create_assessment_snapshot(
    request: GDPRChecklistRequest,
    session: Annotated[Session, Depends(get_session)],
) -> GDPRAssessmentResponse:
    """Generate and persist a GDPR assessment snapshot."""

    return create_assessment(session, request)


@router.get("/assessments/latest")
async def read_latest_assessment(
    session: Annotated[Session, Depends(get_session)],
) -> GDPRAssessmentResponse:
    """Return the latest persisted GDPR assessment."""

    latest_assessment = get_latest_assessment(session)
    if latest_assessment is None:
        return create_assessment(
            session,
            GDPRChecklistRequest(
                selected_rule_ids=[],
                company_profile=None,
            ),
        )

    return latest_assessment


@router.get("/assessments")
async def read_assessment_history(
    session: Annotated[Session, Depends(get_session)],
    limit: int = 5,
) -> AssessmentHistoryResponse:
    """Return recent persisted GDPR assessments."""

    return list_assessments(session, limit=limit)
