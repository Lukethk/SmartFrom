from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "SmartForm API"
    app_env: str = "development"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 7
    reset_token_expire_minutes: int = 30
    algorithm: str = "HS256"

    database_url: str = "sqlite:////tmp/smartform.db"
    redis_url: str = "redis://redis:6379/0"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    cors_origins: str = "http://localhost:5173"
    use_async_queue: bool = False


settings = Settings()


def normalized_database_url(raw_url: str) -> str:
    url = (raw_url or "").strip()
    if not url:
        return "sqlite:////tmp/smartform.db"
    if url.startswith("postgres://"):
        return "postgresql+psycopg2://" + url[len("postgres://") :]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg2://" + url[len("postgresql://") :]
    return url
