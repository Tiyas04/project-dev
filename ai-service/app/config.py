import os
from pathlib import Path
from dotenv import load_dotenv

# Locate .env file (check local ai-service first, then parent backend/.env)
current_dir = Path(__file__).resolve().parent
local_env = current_dir.parent / ".env"
backend_env = current_dir.parent.parent / "backend" / ".env"

if local_env.exists():
    load_dotenv(local_env)
elif backend_env.exists():
    load_dotenv(backend_env)
else:
    load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", os.getenv("AI_SERVICE_PORT", "8000")))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("CHATGPT_API_KEY", os.getenv("OPENAI_API_KEY", ""))
    CLAUDE_API_KEY: str = os.getenv("CLAUDE_API_KEY", os.getenv("ANTHROPIC_API_KEY", ""))
    INTERNAL_AI_SECRET: str = os.getenv("INTERNAL_AI_SECRET", "devarena_rag_secret_key_2026")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "gemini-2.5-flash")
    FALLBACK_MODELS: list = [
        m.strip()
        for m in os.getenv(
            "FALLBACK_MODELS",
            "gemini-2.5-flash,gemini-3.5-flash,gemini-3.8-flash,gemini-2.5-flash-lite,gemini-3.1-pro-preview"
        ).split(",")
        if m.strip()
    ]
    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:5000"
        ).split(",")
        if origin.strip()
    ]

settings = Settings()
