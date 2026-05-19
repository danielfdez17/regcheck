"""FastAPI application entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.session import initialize_database

API_DESCRIPTION = """
RegCheck helps organizations map GDPR context to actionable compliance checklists.

## Authentication

Most routes require a bearer token from `POST /api/v1/auth/signup` or `POST /api/v1/auth/login`.
Use the **Authorize** button in Swagger UI and enter: `Bearer <your_access_token>`.

Public routes: health check and auth signup/login.
"""

OPENAPI_TAGS = [
    {
        "name": "health",
        "description": "Service liveness checks.",
    },
    {
        "name": "auth",
        "description": "Signup, login, profile, and logout.",
    },
    {
        "name": "gdpr",
        "description": (
            "GDPR rule selector, checklist preview, assessments, exports, and item updates."
        ),
    },
]


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize persistence resources before serving requests."""

    initialize_database()
    yield

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=API_DESCRIPTION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    openapi_tags=OPENAPI_TAGS,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://127.0.0.1:3001",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["health"])
async def root() -> dict[str, str]:
    """Return service status and interactive API documentation links."""

    return {
        "message": "RegCheck API",
        "docs": "/api/docs",
        "redoc": "/api/redoc",
        "openapi": "/api/openapi.json",
    }
