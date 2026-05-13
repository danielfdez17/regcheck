"""FastAPI dependencies for authenticated requests."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from app.auth.service import load_tenant_for_user
from app.auth.security import decode_access_token
from app.db.models import UserModel
from app.db.session import get_session

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentUser:
    """Authenticated user context resolved from a JWT."""

    user_id: str
    tenant_id: str
    email: str
    first_name: str
    last_name: str
    enterprise: str


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    session: Annotated[Session, Depends(get_session)],
) -> CurrentUser:
    """Resolve the authenticated user from a Bearer JWT."""

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        token_data = decode_access_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = session.get(UserModel, token_data["user_id"])
    if user is None or user.tenant_id != token_data["tenant_id"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    tenant = load_tenant_for_user(session, user)

    if user.email != token_data["email"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no longer valid.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return CurrentUser(
        user_id=user.id,
        tenant_id=user.tenant_id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        enterprise=tenant.name,
    )
