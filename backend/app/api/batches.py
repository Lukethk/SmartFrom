import base64

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.entities import Batch, BatchStatus, Document, Template, User
from app.schemas.domain import BatchOut
from app.services.queue import enqueue_document_job
from app.workers.tasks import process_document_job

router = APIRouter(prefix="/batches", tags=["batches"])


@router.get("/", response_model=list[BatchOut])
def list_batches(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[Batch]:
    return db.scalars(select(Batch).where(Batch.owner_id == user.id).order_by(Batch.created_at.desc())).all()


@router.post("/", response_model=BatchOut)
async def create_batch(
    template_id: str = Form(...),
    name: str = Form(...),
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Batch:
    template = db.get(Template, template_id)
    if not template or template.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files uploaded")

    batch = Batch(owner_id=user.id, template_id=template_id, name=name, status=BatchStatus.pending)
    db.add(batch)
    db.flush()

    for file in files:
        content = await file.read()
        doc = Document(
            batch_id=batch.id,
            filename=file.filename,
            mime_type=file.content_type or "application/octet-stream",
            status=BatchStatus.pending,
        )
        db.add(doc)
        db.flush()

        file_b64 = base64.b64encode(content).decode("utf-8")
        if settings.use_async_queue:
            enqueue_document_job(
                document_id=doc.id,
                template_id=template_id,
                filename=file.filename,
                mime_type=file.content_type or "application/octet-stream",
                file_b64=file_b64,
            )
        else:
            process_document_job(
                document_id=doc.id,
                template_id=template_id,
                filename=file.filename,
                mime_type=file.content_type or "application/octet-stream",
                file_b64=file_b64,
            )

    batch.status = BatchStatus.processing
    db.commit()
    db.refresh(batch)
    return batch


@router.post("/{batch_id}/retry", response_model=BatchOut)
def retry_failed_docs(batch_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Batch:
    batch = db.get(Batch, batch_id)
    if not batch or batch.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    failed_docs = db.scalars(
        select(Document).where(Document.batch_id == batch.id, Document.status == BatchStatus.failed)
    ).all()
    for doc in failed_docs:
        doc.status = BatchStatus.pending
    batch.status = BatchStatus.processing
    db.commit()
    db.refresh(batch)
    return batch
