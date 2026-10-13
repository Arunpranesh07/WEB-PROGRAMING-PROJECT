from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.ai import (
    AIClassificationRequest, AIClassificationResponse,
    AIDuplicateCheckResponse, AIPriorityPredictRequest, AIPriorityPredictResponse
)
from app.ml.classifier import classify_complaint_text
from app.ml.duplicate_detector import check_for_duplicates
from app.ml.priority_predictor import predict_complaint_priority

router = APIRouter(prefix="/ai", tags=["AI & NLP"])

@router.post("/classify-complaint", response_model=AIClassificationResponse)
def classify_complaint(req: AIClassificationRequest):
    return classify_complaint_text(req.description)

@router.get("/check-duplicates", response_model=AIDuplicateCheckResponse)
def check_duplicates(
    description: str = Query(...),
    location: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return check_for_duplicates(description=description, location=location, db=db)

@router.post("/predict-priority", response_model=AIPriorityPredictResponse)
def predict_priority(req: AIPriorityPredictRequest):
    return predict_complaint_priority(category=req.category, description=req.description)
