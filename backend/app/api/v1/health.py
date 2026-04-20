"""Health endpoints for API liveness checks."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def healthcheck() -> dict[str, str]:
    """Return an OK status when the API is responsive."""

    return {"status": "ok"}
