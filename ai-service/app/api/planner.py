from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.rag.chains import study_planner_chain

router = APIRouter(prefix="/api/rag", tags=["Planner"])

class PlanRequest(BaseModel):
    topic: str = Field(..., description="Target DSA topic (e.g. Dynamic Programming, Graphs)")
    target_rating_gain: int = Field(default=150, description="Desired rating points gain")
    current_rating: int = Field(default=1400, description="Current rating")
    model: Optional[str] = Field(default=None, description="Preferred model")

class PlanResponse(BaseModel):
    topic: str
    current_rating: int
    target_rating: int
    roadmap: str
    recommended_problems: List[Dict[str, Any]]

@router.post("/plan", response_model=PlanResponse)
async def generate_study_plan(req: PlanRequest):
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="Target topic is required.")

    try:
        result = study_planner_chain.execute(
            target_topic=req.topic,
            target_rating_gain=req.target_rating_gain,
            current_rating=req.current_rating,
            preferred_model=req.model
        )
        return PlanResponse(
            topic=result["topic"],
            current_rating=result["current_rating"],
            target_rating=result["target_rating"],
            roadmap=result["roadmap"],
            recommended_problems=result["recommended_problems"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Study plan error: {str(e)}")
