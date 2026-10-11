from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.rag.chains import contest_review_chain

router = APIRouter(prefix="/api/rag", tags=["Review"])

class ReviewRequest(BaseModel):
    contest_title: str = Field(..., description="Name of the contest (e.g. Codeforces Round 950)")
    missed_problems: List[str] = Field(..., description="List of problem names or IDs struggled with")
    error_type: str = Field(default="TLE", description="Primary symptom (TLE, WA, MLE, RE)")
    model: Optional[str] = Field(default=None, description="Preferred model")

class ReviewResponse(BaseModel):
    contest_title: str
    error_type: str
    analysis: str
    associated_patterns: List[str]

@router.post("/review", response_model=ReviewResponse)
async def review_contest_performance(req: ReviewRequest):
    if not req.contest_title.strip() or not req.missed_problems:
        raise HTTPException(status_code=400, detail="Contest title and missed problems are required.")

    try:
        result = contest_review_chain.execute(
            contest_title=req.contest_title,
            missed_problems=req.missed_problems,
            error_type=req.error_type,
            preferred_model=req.model
        )
        return ReviewResponse(
            contest_title=result["contest_title"],
            error_type=result["error_type"],
            analysis=result["analysis"],
            associated_patterns=result["associated_patterns"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Contest review error: {str(e)}")
