from datetime import datetime

from pydantic import BaseModel


class APIMessage(BaseModel):
    message: str


class HealthStatus(BaseModel):
    status: str
    timestamp: datetime
