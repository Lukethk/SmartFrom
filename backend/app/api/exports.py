from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.entities import Batch, BatchStatus, Cell, Document, ExportRecord, Extraction, MappingProfile, Template, User
from app.schemas.domain import ExportRequest
from app.services.exporter import export_batch_to_xlsx

router = APIRouter(prefix="/exports", tags=["exports"])


@router.post("/xlsx")
def export_xlsx(
    payload: ExportRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> StreamingResponse:
    batch = db.get(Batch, payload.batch_id)
    if not batch or batch.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

    template = db.get(Template, batch.template_id)
    profile = db.get(MappingProfile, payload.mapping_profile_id)
    if not template or not profile or profile.template_id != template.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid template/profile")

    rows = []
    docs = db.scalars(select(Document).where(Document.batch_id == batch.id).order_by(Document.created_at.asc())).all()
    for doc in docs:
        extraction = db.scalar(select(Extraction).where(Extraction.document_id == doc.id))
        if not extraction:
            continue
        cells = db.scalars(select(Cell).where(Cell.extraction_id == extraction.id)).all()
        rows.append((doc, extraction, cells))

    file_bytes = export_batch_to_xlsx(template, profile, rows, payload.include_only_validated)
    db.add(ExportRecord(batch_id=batch.id, mapping_profile_id=profile.id))
    batch.status = BatchStatus.exported
    db.commit()

    return StreamingResponse(
        BytesIO(file_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="smartform-{batch.id}.xlsx"'},
    )
