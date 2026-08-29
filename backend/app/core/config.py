import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "PhishGuard"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-Powered Phishing URL Detection & Security Analysis Platform"
    API_V1_STR: str = "/api"
    
    # Security & Auth
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "phishguard-ultra-secure-cyber-jwt-key-2026-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./phishguard.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # ML Model Path
    ML_MODEL_PATH: str = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../../ml/models/phishing_model.joblib")
    )
    ML_METADATA_PATH: str = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../../ml/models/feature_metadata.json")
    )

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")


settings = Settings()
