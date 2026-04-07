from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, batches, extractions, exports, health, mappings, templates
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(templates.router)
app.include_router(mappings.router)
app.include_router(batches.router)
app.include_router(extractions.router)
app.include_router(exports.router)
