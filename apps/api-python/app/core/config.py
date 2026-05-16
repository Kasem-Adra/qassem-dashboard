import os
from pathlib import Path

class Settings:
    app_name: str = "Qassem.net API"
    admin_password: str = os.getenv("ADMIN_PASSWORD", "admin")
    content_file: Path = Path(os.getenv("CONTENT_FILE", "./data/content.json"))
    cors_origins: list[str] = [
        item.strip()
        for item in os.getenv("CORS_ORIGINS", "*").split(",")
        if item.strip()
    ]

settings = Settings()
