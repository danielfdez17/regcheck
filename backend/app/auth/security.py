"""Password hashing and JWT helpers."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    """Return a bcrypt hash for the given plaintext password."""

    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""

    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        password_hash.encode("utf-8"),
    )


def create_access_token(
    *,
    user_id: str,
    tenant_id: str,
    email: str,
) -> str:
    """Create a signed JWT access token for the authenticated user."""

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": user_id,
        "tenant_id": tenant_id,
        "email": email,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, str]:
    """Decode and validate a JWT access token."""

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as exc:
        raise ValueError("Invalid access token.") from exc

    user_id = payload.get("sub")
    tenant_id = payload.get("tenant_id")
    email = payload.get("email")
    if not isinstance(user_id, str) or not isinstance(tenant_id, str) or not isinstance(email, str):
        raise ValueError("Invalid access token payload.")

    return {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "email": email,
    }
