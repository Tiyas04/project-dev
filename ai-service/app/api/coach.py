from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.rag.chains import rag_coach_chain

router = APIRouter(prefix="/api/rag", tags=["Coach"])

class CoachRequest(BaseModel):
    message: str = Field(..., description="User message or question")
    user_context: Optional[Dict[str, Any]] = Field(default=None, description="Connected accounts & stats")
    chat_history: Optional[List[Dict[str, str]]] = Field(default=None, description="Recent conversation turns")
    model: Optional[str] = Field(default=None, description="Preferred Gemini model")

class CoachResponse(BaseModel):
    content: str
    retrieved_patterns: List[str]
    retrieved_problems: List[str]
    grounded: bool

@router.post("/coach", response_model=CoachResponse)
async def coach_chat(req: CoachRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        result = rag_coach_chain.execute(
            message=req.message,
            user_context=req.user_context,
            chat_history=req.chat_history,
            preferred_model=req.model
        )
        return CoachResponse(
            content=result["content"],
            retrieved_patterns=result["retrieved_patterns"],
            retrieved_problems=result["retrieved_problems"],
            grounded=result["grounded"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Coach generation error: {str(e)}")
