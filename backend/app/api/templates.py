from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Template
from app.schemas.domain import TemplateOut

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/", response_model=list[TemplateOut])
def list_templates(
    db: Session = Depends(get_db),
) -> list[Template]:
    return db.scalars(select(Template).order_by(Template.created_at.desc())).all()


@router.post("/")
def create_template_disabled() -> None:
    raise HTTPException(
        status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
        detail="Templates are preset and cannot be edited by the user.",
    )


@router.post("/{template_id}/fields")
def set_template_fields(
    template_id: str,
) -> None:
    raise HTTPException(
        status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
        detail="Templates are preset and cannot be edited by the user.",
    )
