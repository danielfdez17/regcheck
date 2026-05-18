"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration values for the API service."""

    app_name: str = "RegCheck API"
    app_version: str = "0.1.0"
    debug: bool = False
    database_url: str = "sqlite:///./regcheck.db"
    db_echo: bool = False
    frontend_origin: str = "http://localhost:3001"
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480

    model_config = SettingsConfigDict(env_file=".env", env_prefix="REGCHECK_", extra="ignore")


settings = Settings()
