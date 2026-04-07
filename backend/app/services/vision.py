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


def extract_fields(file_bytes: bytes, filename: str, mime_type: str) -> dict[str, Any]:
    if not settings.gemini_api_key:
        return build_mock_result(filename)

    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
    )

    prompt = (
        "Extrae campos como JSON estricto con formato: "
        '{"form_type":"string","fields":[{"logical_key":"string","raw_text":"string","confidence":0.0,"source_bbox":{"x":0,"y":0,"w":0,"h":0}}]}'
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
    with httpx.Client(timeout=60.0) as client:
        response = client.post(endpoint, json=payload)
        response.raise_for_status()
        data = response.json()

    text = data["candidates"][0]["content"]["parts"][0]["text"]
    cleaned = text.strip().removeprefix("```json").removesuffix("```").strip()
    return json.loads(cleaned)
