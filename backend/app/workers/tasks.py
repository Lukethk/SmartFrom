import base64
import tempfile
from pathlib import Path

from app.db.session import SessionLocal
from app.models.entities import Batch, BatchStatus, Cell, Document, Extraction, MappingProfile
from app.services.presets import employee_logical_keys
from app.services.vision import extract_fields, normalize_value


def process_document_job(document_id: str, template_id: str, filename: str, mime_type: str, file_b64: str) -> None:
    db = SessionLocal()
    tmp_path: Path | None = None
    try:
        document = db.get(Document, document_id)
        if not document:
            return
        document.status = BatchStatus.processing
        db.commit()

        raw = base64.b64decode(file_b64.encode("utf-8"))
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(filename).suffix) as tmp:
            tmp.write(raw)
            tmp_path = Path(tmp.name)

        template = db.get(Template, template_id)
        mapping = db.scalar(select(MappingProfile).where(MappingProfile.template_id == template_id))
        expected_keys = list(mapping.mapping_json.keys()) if mapping else employee_logical_keys()
        result = extract_fields(raw, filename, mime_type, expected_keys=expected_keys)
        fields = result.get("fields", [])
        confidence = sum(item.get("confidence", 0.0) for item in fields) / max(1, len(fields))

        extraction = Extraction(
            document_id=document.id,
            template_id=template_id,
            raw_json=result,
            confidence=confidence,
            status=BatchStatus.requires_review,
        )
        db.add(extraction)
        db.flush()

        for field in fields:
            logical_key = field.get("logical_key", "unknown")
            raw_text = str(field.get("raw_text", ""))
            cell = Cell(
                extraction_id=extraction.id,
                logical_key=logical_key,
                raw_text=raw_text,
                normalized_value=normalize_value(logical_key, raw_text),
                confidence=float(field.get("confidence", 0.0)),
                source_bbox=field.get("source_bbox", {}),
                is_validated=True,
            )
            db.add(cell)

        document.status = BatchStatus.ready_to_export
        batch = db.get(Batch, document.batch_id)
        if batch:
            batch.status = BatchStatus.ready_to_export
        db.commit()
    except Exception:
        doc = db.get(Document, document_id)
        if doc:
            doc.status = BatchStatus.failed
            batch = db.get(Batch, doc.batch_id)
            if batch:
                batch.status = BatchStatus.failed
        db.commit()
        raise
    finally:
        if tmp_path and tmp_path.exists():
            tmp_path.unlink(missing_ok=True)
        db.close()
