"""Authentication business logic."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.auth.schemas import AuthResponse, AuthUser, LoginRequest, SignupRequest
from app.auth.security import create_access_token, hash_password, verify_password
from app.db.models import TenantModel, UserModel


def build_auth_user(user: UserModel, enterprise: str) -> AuthUser:
    """Build the public user profile for API responses."""

    return AuthUser(
        id=user.id,
        tenant_id=user.tenant_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        enterprise=enterprise,
    )


def build_auth_response(user: UserModel, enterprise: str) -> AuthResponse:
    """Create an authentication response with a fresh access token."""

    access_token = create_access_token(
        user_id=user.id,
        tenant_id=user.tenant_id,
        email=user.email,
    )
    return AuthResponse(
        access_token=access_token,
        user=build_auth_user(user, enterprise),
    )


def signup_user(session: Session, payload: SignupRequest) -> AuthResponse:
    """Create a tenant and first user account for a new signup."""

    normalized_email = payload.email.lower()
    existing_user = session.exec(
        select(UserModel).where(UserModel.email == normalized_email)
    ).first()
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    tenant = TenantModel(
        id=uuid4().hex,
        name=payload.enterprise.strip(),
        created_at=datetime.now(timezone.utc),
    )
    user = UserModel(
        id=uuid4().hex,
        tenant_id=tenant.id,
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        email=normalized_email,
        password_hash=hash_password(payload.password),
        created_at=datetime.now(timezone.utc),
    )
    session.add(tenant)
    session.add(user)
    session.commit()
    session.refresh(user)

    return build_auth_response(user, tenant.name)


def load_tenant_for_user(session: Session, user: UserModel) -> TenantModel:
    """Return the tenant for a user or raise when it is missing."""

    tenant = session.get(TenantModel, user.tenant_id)
    if tenant is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tenant not found.",
        )
    return tenant


def authenticate_user(session: Session, payload: LoginRequest) -> AuthResponse:
    """Authenticate a user with email and password."""

    normalized_email = payload.email.lower()
    user = session.exec(
        select(UserModel).where(UserModel.email == normalized_email)
    ).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    tenant = load_tenant_for_user(session, user)

    return build_auth_response(user, tenant.name)


def get_user_profile(session: Session, user_id: str) -> AuthUser:
    """Return the public profile for an authenticated user."""

    user = session.get(UserModel, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    tenant = session.get(TenantModel, user.tenant_id)
    if tenant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found.",
        )

    return build_auth_user(user, tenant.name)
