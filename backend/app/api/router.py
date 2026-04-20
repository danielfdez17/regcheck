"""Aggregate versioned API routes."""

from fastapi import APIRouter

from app.api.v1.gdpr import router as gdpr_router
from app.api.v1.health import router as health_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(gdpr_router)
