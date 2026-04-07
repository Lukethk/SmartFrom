from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.entities import Batch, BatchStatus, Cell, Document, Extraction, User
from app.schemas.domain import ExtractionOut, ValidationPatch

router = APIRouter(prefix="/extractions", tags=["extractions"])


@router.get("/batch/{batch_id}", response_model=list[ExtractionOut])
def list_by_batch(batch_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[Extraction]:
    batch = db.get(Batch, batch_id)
    if not batch or batch.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

    stmt = (
        select(Extraction)
        .join(Document, Document.id == Extraction.document_id)
        .where(Document.batch_id == batch.id)
    )
    return db.scalars(stmt).all()


@router.patch("/{extraction_id}")
def patch_cells(
    extraction_id: str,
    payload: ValidationPatch,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    extraction = db.get(Extraction, extraction_id)
    if not extraction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extraction not found")
    doc = db.get(Document, extraction.document_id)
    batch = db.get(Batch, doc.batch_id) if doc else None
    if not batch or batch.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extraction not found")

    for patch in payload.cells:
        cell = db.get(Cell, patch.id)
        if cell and cell.extraction_id == extraction.id:
            cell.normalized_value = patch.normalized_value
            cell.is_validated = patch.is_validated
    extraction.status = BatchStatus.ready_to_export
    if doc:
        doc.status = BatchStatus.ready_to_export
    if batch:
        batch.status = BatchStatus.ready_to_export
    db.commit()
    return {"message": "Extraction updated"}
