import sys
import os
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Auto-detect local virtual environment if not already active
venv_py_win = BASE_DIR / ".venv" / "Scripts" / "python.exe"
venv_py_unix = BASE_DIR / ".venv" / "bin" / "python"
venv_py = venv_py_win if venv_py_win.exists() else (venv_py_unix if venv_py_unix.exists() else None)

if venv_py and Path(sys.executable).resolve() != venv_py.resolve() and not os.environ.get("_DEVARENA_VENV_ACTIVE"):
    os.environ["_DEVARENA_VENV_ACTIVE"] = "1"
    sys.exit(subprocess.call([str(venv_py), str(Path(__file__).resolve())] + sys.argv[1:]))

# Ensure ai-service root is in sys.path
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"[DevArena AI] Starting RAG Microservice on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False
    )
