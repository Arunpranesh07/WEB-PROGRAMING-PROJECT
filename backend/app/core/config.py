import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "AquaFlow - Smart Community Water Platform"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api"

    DATABASE_URL: str = "sqlite:///./water_management.db"

    SECRET_KEY: str = "aquaflow-super-secret-development-key-32charsmin!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    SENSOR_API_KEY: str = "aquaflow-sensor-secret-key-2026"
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "complaints")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
