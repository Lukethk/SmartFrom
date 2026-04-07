from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.entities import MappingProfile, Template, User
from app.schemas.domain import MappingProfileIn, MappingProfileOut

router = APIRouter(prefix="/mappings", tags=["mappings"])


@router.get("/", response_model=list[MappingProfileOut])
def list_mappings(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[MappingProfile]:
    stmt = (
        select(MappingProfile)
        .join(Template, Template.id == MappingProfile.template_id)
        .where(Template.owner_id == user.id)
        .order_by(MappingProfile.created_at.desc())
    )
    return db.scalars(stmt).all()


@router.post("/", response_model=MappingProfileOut)
def create_mapping(
    payload: MappingProfileIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MappingProfile:
    template = db.get(Template, payload.template_id)
    if not template or template.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    profile = MappingProfile(**payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
