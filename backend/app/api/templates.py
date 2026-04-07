from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.entities import Template, TemplateField, User
from app.schemas.domain import TemplateFieldIn, TemplateOut

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/", response_model=list[TemplateOut])
def list_templates(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Template]:
    return db.scalars(select(Template).where(Template.owner_id == user.id).order_by(Template.created_at.desc())).all()


@router.post("/", response_model=TemplateOut)
async def create_template(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Template:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")
    template = Template(owner_id=user.id, name=name, filename=file.filename, workbook_blob=content)
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.post("/{template_id}/fields")
def set_template_fields(
    template_id: str,
    fields: list[TemplateFieldIn],
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    template = db.get(Template, template_id)
    if not template or template.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    db.query(TemplateField).filter(TemplateField.template_id == template.id).delete()
    for field in fields:
        db.add(
            TemplateField(
                template_id=template.id,
                logical_key=field.logical_key,
                label=field.label,
                data_type=field.data_type,
                required=field.required,
            )
        )
    db.commit()
    return {"message": "Fields saved"}
