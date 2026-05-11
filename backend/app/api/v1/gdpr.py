"""GDPR domain mode endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.gdpr.assessments import (
    create_assessment,
    get_latest_assessment,
    list_assessments,
    update_assessment_checklist_item,
)
from app.gdpr.catalog import build_gdpr_checklist, get_gdpr_rule_selector
from app.gdpr.schemas import (
    AssessmentHistoryResponse,
    ChecklistItemUpdateRequest,
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


@router.patch("/assessments/{assessment_id}/checklist-items/{checklist_item_id}")
async def patch_assessment_checklist_item(
    assessment_id: str,
    checklist_item_id: str,
    payload: ChecklistItemUpdateRequest,
    session: Annotated[Session, Depends(get_session)],
) -> GDPRAssessmentResponse:
    """Update checklist status/evidence metadata for one assessment item."""

    assessment = update_assessment_checklist_item(
        session=session,
        assessment_id=assessment_id,
        checklist_item_id=checklist_item_id,
        payload=payload,
    )
    if assessment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "message": "Assessment or checklist item not found.",
                "assessment_id": assessment_id,
                "checklist_item_id": checklist_item_id,
            },
        )

    return assessment
