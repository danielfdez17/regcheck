"""Pydantic schemas for authentication requests and responses."""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    """Payload for creating a new tenant and user account."""

    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    enterprise: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    """Payload for authenticating an existing user."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class AuthUser(BaseModel):
    """Public user profile returned after authentication."""

    id: str
    tenant_id: str
    first_name: str
    last_name: str
    email: EmailStr
    enterprise: str


class AuthResponse(BaseModel):
    """Authentication response with access token and user profile."""

    access_token: str
    token_type: str = "bearer"
    user: AuthUser
