"""GDPR domain mode endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.auth.dependencies import CurrentUser, get_current_user
from app.db.session import get_session
from app.gdpr.assessments import (
    AssessmentOwner,
    create_assessment,
    get_assessment,
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


def build_assessment_owner(current_user: CurrentUser) -> AssessmentOwner:
    """Build the persistence scope for the authenticated user."""

    return AssessmentOwner(
        tenant_id=current_user.tenant_id,
        user_id=current_user.user_id,
    )


@router.get("/rule-selector")
async def read_rule_selector(
    session: Annotated[Session, Depends(get_session)],
    _: Annotated[CurrentUser, Depends(get_current_user)],
) -> GDPRRuleSelectorResponse:
    """Return the GDPR rule selector payload."""

    return get_gdpr_rule_selector(session)


@router.post("/checklists")
async def create_checklist_preview(
    request: GDPRChecklistRequest,
    session: Annotated[Session, Depends(get_session)],
    _: Annotated[CurrentUser, Depends(get_current_user)],
) -> GDPRChecklistResponse:
    """Return a GDPR checklist preview for the selected rules."""

    return build_gdpr_checklist(session, request)


@router.post("/assessments")
async def create_assessment_snapshot(
    request: GDPRChecklistRequest,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> GDPRAssessmentResponse:
    """Generate and persist a GDPR assessment snapshot."""

    return create_assessment(
        session,
        request,
        build_assessment_owner(current_user),
    )


@router.get("/assessments/latest")
async def read_latest_assessment(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> GDPRAssessmentResponse | None:
    """Return the latest persisted GDPR assessment for the current user."""

    return get_latest_assessment(session, build_assessment_owner(current_user))


@router.get("/assessments")
async def read_assessment_history(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    limit: int = 50,
) -> AssessmentHistoryResponse:
    """Return recent persisted GDPR assessments for the current user."""

    return list_assessments(
        session,
        build_assessment_owner(current_user),
        limit=limit,
    )


@router.get("/assessments/{assessment_id}")
async def read_assessment(
    assessment_id: str,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> GDPRAssessmentResponse:
    """Return one persisted GDPR assessment for the current user."""

    assessment = get_assessment(
        session,
        assessment_id,
        build_assessment_owner(current_user),
    )
    if assessment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "message": "Assessment not found.",
                "assessment_id": assessment_id,
            },
        )

    return assessment


@router.patch("/assessments/{assessment_id}/checklist-items/{checklist_item_id}")
async def patch_assessment_checklist_item(
    assessment_id: str,
    checklist_item_id: str,
    payload: ChecklistItemUpdateRequest,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> GDPRAssessmentResponse:
    """Update checklist status/evidence metadata for one assessment item."""

    assessment = update_assessment_checklist_item(
        session=session,
        assessment_id=assessment_id,
        checklist_item_id=checklist_item_id,
        payload=payload,
        owner=build_assessment_owner(current_user),
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
