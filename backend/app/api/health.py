from datetime import datetime, timezone

from fastapi import APIRouter
from sqlalchemy import text

from app.db.session import SessionLocal
from app.schemas.common import HealthStatus

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthStatus)
def health() -> HealthStatus:
    return HealthStatus(status="ok", timestamp=datetime.now(timezone.utc))


@router.get("/ready", response_model=HealthStatus)
def ready() -> HealthStatus:
    status = "ready"
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        status = "degraded"
    finally:
        db.close()
    return HealthStatus(status=status, timestamp=datetime.now(timezone.utc))
