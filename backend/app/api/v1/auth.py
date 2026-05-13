"""Authentication endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlmodel import Session

from app.auth.dependencies import CurrentUser, get_current_user
from app.auth.schemas import AuthResponse, AuthUser, LoginRequest, SignupRequest
from app.auth.service import authenticate_user, get_user_profile, signup_user
from app.db.session import get_session

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(
    payload: SignupRequest,
    session: Annotated[Session, Depends(get_session)],
) -> AuthResponse:
    """Create a tenant and user account, returning an access token."""

    return signup_user(session, payload)


@router.post("/login")
async def login(
    payload: LoginRequest,
    session: Annotated[Session, Depends(get_session)],
) -> AuthResponse:
    """Authenticate with email and password."""

    return authenticate_user(session, payload)


@router.get("/me")
async def read_current_user(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> AuthUser:
    """Return the authenticated user's public profile."""

    return get_user_profile(session, current_user.user_id)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    _: Annotated[CurrentUser, Depends(get_current_user)],
) -> Response:
    """Acknowledge logout for stateless JWT clients."""

    return Response(status_code=status.HTTP_204_NO_CONTENT)
