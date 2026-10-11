from contextlib import asynccontextmanager
from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from app.config import settings
from app.rag.vector_store import vector_store
from app.api.coach import router as coach_router
from app.api.hints import router as hints_router
from app.api.planner import router as planner_router
from app.api.review import router as review_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load knowledge base and warm up vectors
    print("[DevArena AI] Initializing RAG Knowledge Base...")
    vector_store.load_data()
    print("[DevArena AI] Microservice ready to serve requests.")
    yield
    print("[DevArena AI] Shutting down.")

app = FastAPI(
    title="DevArena AI & RAG Microservice",
    description="High-performance Retrieval-Augmented Generation engine for Competitive Programming Analytics.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security verification (optional internal secret)
def verify_internal_secret(x_ai_secret: Optional[str] = Header(None)):
    if settings.INTERNAL_AI_SECRET and x_ai_secret:
        if x_ai_secret != settings.INTERNAL_AI_SECRET:
            raise HTTPException(status_code=403, detail="Invalid internal secret.")
    return True

# Include API Routers
app.include_router(coach_router)
app.include_router(hints_router)
app.include_router(planner_router)
app.include_router(review_router)

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "DevArena AI & RAG Microservice",
        "version": "1.0.0",
        "indexed_patterns": len(vector_store.patterns),
        "indexed_problems": len(vector_store.problems),
        "default_model": settings.DEFAULT_MODEL
    }

@app.get("/api/rag/patterns")
async def list_patterns(category: Optional[str] = None):
    if not vector_store.is_initialized:
        vector_store.load_data()
    
    if category:
        return [p for p in vector_store.patterns if category.lower() in p["category"].lower()]
    return vector_store.patterns

@app.get("/api/rag/problems")
async def list_problems(topic: Optional[str] = None, platform: Optional[str] = None):
    if not vector_store.is_initialized:
        vector_store.load_data()

    results = vector_store.problems
    if topic:
        results = [p for p in results if any(topic.lower() in t.lower() for t in p.get("topic_tags", []))]
    if platform:
        results = [p for p in results if p.get("platform", "").lower() == platform.lower()]
    return results
