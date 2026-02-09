"""Configuration management for the audio guide backend."""

from functools import lru_cache
from pathlib import Path
from typing import Union

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "Audio Guide API"
    app_version: str = "0.1.0"
    debug: bool = False

    # Server
    backend_host: str = Field(default="0.0.0.0", alias="BACKEND_HOST")
    backend_port: int = Field(default=8000, alias="BACKEND_PORT")

    # CORS
    cors_origins: Union[str, list[str]] = Field(
        default="*",
        alias="CORS_ORIGINS",
    )

    # Telegram
    bot_token: str = Field(default="", alias="BOT_TOKEN")

    # Yandex Maps
    yandex_maps_api_key: str = Field(default="", alias="YANDEX_MAPS_API_KEY")

    # Data paths
    data_dir: Path = Field(default=Path("data"), alias="DATA_DIR")
    attractions_file: Path = Field(
        default=Path("data/attractions.json"),
        alias="ATTRACTIONS_FILE",
    )
    routes_file: Path = Field(default=Path("data/routes.json"), alias="ROUTES_FILE")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str] | None) -> list[str]:
        """Parse CORS origins from comma-separated string or list."""
        if v is None:
            return ["*"]
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        if isinstance(v, list):
            return v
        return ["*"]

    @property
    def api_url(self) -> str:
        """Get the full API URL."""
        return f"http://{self.backend_host}:{self.backend_port}"

    @property
    def api_prefix(self) -> str:
        """Get the API prefix."""
        return "/api/v1"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
