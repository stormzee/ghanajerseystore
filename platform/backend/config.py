from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/taskplatform"
    secret_key: str = "change-me-to-a-long-random-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    media_upload_dir: str = "./uploads"
    max_upload_size_mb: int = 20
    message_ttl_hours: int = 8

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
