from typing import List, Optional
from pydantic import BaseModel

class AIClassificationRequest(BaseModel):
    description: str

class AIClassificationResponse(BaseModel):
    suggested_category: str
    confidence: float
    probabilities: dict

class DuplicateComplaintItem(BaseModel):
    complaint_id: int
    display_id: str
    description: str
    location: str
    similarity_score: float

class AIDuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    matching_complaints: List[DuplicateComplaintItem] = []

class AIPriorityPredictRequest(BaseModel):
    category: str
    description: str

class AIPriorityPredictResponse(BaseModel):
    predicted_priority: str
    reason: str
