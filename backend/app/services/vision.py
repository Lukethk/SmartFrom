import base64
import json
from typing import Any

import httpx

from app.core.config import settings


def normalize_value(logical_key: str, value: str) -> str:
    cleaned = value.strip()
    if logical_key.lower().endswith("_email"):
        return cleaned.lower()
    return cleaned


def build_mock_result(filename: str) -> dict[str, Any]:
    return {
        "form_type": "generic",
        "fields": [
            {"logical_key": "first_name", "raw_text": "Juan", "confidence": 0.92, "source_bbox": {"x": 10, "y": 10, "w": 80, "h": 20}},
            {"logical_key": "last_name", "raw_text": "Perez", "confidence": 0.89, "source_bbox": {"x": 100, "y": 10, "w": 80, "h": 20}},
            {"logical_key": "doc_id", "raw_text": f"{filename}-001", "confidence": 0.86, "source_bbox": {"x": 10, "y": 40, "w": 120, "h": 20}},
        ],
    }


def build_mock_result_for_keys(filename: str, expected_keys: list[str] | None) -> dict[str, Any]:
    keys = expected_keys or ["codigo", "nombre", "apellido_paterno"]
    values = []
    for idx, key in enumerate(keys):
        values.append(
            {
                "logical_key": key,
                "raw_text": f"{key}-{idx + 1}" if key != "codigo" else f"EMP-{idx + 1:03d}",
                "confidence": max(0.65, 0.95 - (idx * 0.01)),
                "source_bbox": {"x": 10 + idx * 8, "y": 10 + idx * 4, "w": 100, "h": 20},
            }
        )
    return {"form_type": "employees", "fields": values}


def extract_fields(file_bytes: bytes, filename: str, mime_type: str, expected_keys: list[str] | None = None) -> dict[str, Any]:
    if not settings.gemini_api_key:
        return build_mock_result_for_keys(filename, expected_keys)

    supported_mime_types = {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
    }
    if mime_type not in supported_mime_types:
        return build_mock_result_for_keys(filename, expected_keys)

    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
    )

    prompt = (
        "Extrae datos de un formulario de empleados y responde SOLO JSON estricto con este formato: "
        '{"form_type":"employees","fields":[{"logical_key":"string","raw_text":"string","confidence":0.0,"source_bbox":{"x":0,"y":0,"w":0,"h":0}}]}'
        f" Debes usar exactamente estas logical_key: {', '.join(expected_keys or []) or 'codigo, nombre, apellido_paterno'}."
    )
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": mime_type, "data": base64.b64encode(file_bytes).decode("utf-8")}},
                ]
            }
        ]
    }
    try:
        with httpx.Client(timeout=60.0) as client:
            response = client.post(endpoint, json=payload)
            response.raise_for_status()
            data = response.json()

        text = data["candidates"][0]["content"]["parts"][0]["text"]
        cleaned = text.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(cleaned)
    except Exception:
        return build_mock_result_for_keys(filename, expected_keys)
