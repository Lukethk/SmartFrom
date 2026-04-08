from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import MappingProfile, Template
from app.schemas.domain import MappingProfileOut

router = APIRouter(prefix="/mappings", tags=["mappings"])


@router.get("/", response_model=list[MappingProfileOut])
def list_mappings(db: Session = Depends(get_db)) -> list[MappingProfile]:
    stmt = (
        select(MappingProfile)
        .join(Template, Template.id == MappingProfile.template_id)
        .order_by(MappingProfile.created_at.desc())
    )
    return db.scalars(stmt).all()


@router.post("/")
def create_mapping_disabled() -> None:
    raise HTTPException(
        status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
        detail="Mappings are preset and cannot be edited by the user.",
    )
