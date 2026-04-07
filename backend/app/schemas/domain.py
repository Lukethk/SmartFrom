from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class TemplateFieldIn(BaseModel):
    logical_key: str
    label: str
    data_type: str = "string"
    required: bool = False


class TemplateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    filename: str
    created_at: datetime


class MappingProfileIn(BaseModel):
    template_id: str
    name: str
    sheet_name: str
    start_row: int = 2
    mapping_json: dict[str, str]


class MappingProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    template_id: str
    name: str
    sheet_name: str
    start_row: int
    mapping_json: dict[str, str]
    created_at: datetime


class BatchCreateIn(BaseModel):
    template_id: str
    name: str


class BatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    template_id: str
    name: str
    status: str
    created_at: datetime
    updated_at: datetime


class CellPatch(BaseModel):
    id: str
    normalized_value: str
    is_validated: bool = True


class ValidationPatch(BaseModel):
    cells: list[CellPatch]


class CellOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    logical_key: str
    raw_text: str
    normalized_value: str
    confidence: float
    source_bbox: dict[str, Any]
    is_validated: bool


class ExtractionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    document_id: str
    template_id: str
    confidence: float
    status: str
    cells: list[CellOut]


class ExportRequest(BaseModel):
    batch_id: str
    mapping_profile_id: str
    include_only_validated: bool = True

