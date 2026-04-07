from datetime import datetime, timezone

from fastapi import APIRouter

from app.schemas.common import HealthStatus

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthStatus)
def health() -> HealthStatus:
    return HealthStatus(status="ok", timestamp=datetime.now(timezone.utc))


@router.get("/ready", response_model=HealthStatus)
def ready() -> HealthStatus:
    return HealthStatus(status="ready", timestamp=datetime.now(timezone.utc))
