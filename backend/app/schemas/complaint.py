from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ComplaintAssignmentOut(BaseModel):
    assignment_id: int
    staff_id: int
    staff_name: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    assigned_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ComplaintCreate(BaseModel):
    category: str = Field(..., description="Leakage, Shortage, or Water Quality")
    description: str = Field(..., min_length=5)
    location: str = Field(..., min_length=2)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    priority: Optional[str] = "Medium"

class ComplaintUpdateStatus(BaseModel):
    status: str = Field(..., description="Pending, In Progress, or Resolved")

class ComplaintUpdatePriority(BaseModel):
    priority: str = Field(..., description="Low, Medium, High, or Urgent")

class ComplaintAssignStaff(BaseModel):
    staff_id: int

class ComplaintOut(BaseModel):
    complaint_id: int
    display_id: str
    user_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    category: str
    description: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    priority: str
    status: str
    is_duplicate_of: Optional[int] = None
    duplicate_display_id: Optional[str] = None
    created_at: datetime
    assignments: List[ComplaintAssignmentOut] = []

    class Config:
        from_attributes = True

class ComplaintStats(BaseModel):
    total: int
    pending: int
    in_progress: int
    resolved: int
