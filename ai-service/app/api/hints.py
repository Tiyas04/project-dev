from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.rag.chains import progressive_hint_chain

router = APIRouter(prefix="/api/rag", tags=["Hints"])

class HintRequest(BaseModel):
    problem_query: str = Field(..., description="Problem name, link, or description")
    user_rating: Optional[int] = Field(default=None, description="Current user rating")
    model: Optional[str] = Field(default=None, description="Preferred model")

class HintResponse(BaseModel):
    problem_title: str
    platform: str
    rating: Optional[int]
    difficulty: Optional[str]
    tier1: str
    tier2: str
    tier3: str
    tier4: str
    source: str

@router.post("/hints", response_model=HintResponse)
async def get_progressive_hints(req: HintRequest):
    if not req.problem_query.strip():
        raise HTTPException(status_code=400, detail="Problem query cannot be empty.")

    try:
        result = progressive_hint_chain.execute(
            problem_title_or_query=req.problem_query,
            user_rating=req.user_rating,
            preferred_model=req.model
        )
        return HintResponse(
            problem_title=result.get("problem_title", req.problem_query),
            platform=result.get("platform", "General"),
            rating=result.get("rating"),
            difficulty=result.get("difficulty"),
            tier1=result.get("tier1", ""),
            tier2=result.get("tier2", ""),
            tier3=result.get("tier3", ""),
            tier4=result.get("tier4", ""),
            source=result.get("source", "rag")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hint generation error: {str(e)}")
