from typing import Optional
from pydantic import BaseModel, Field

class StaffBase(BaseModel):
    staff_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=5, max_length=20)
    specialization: str = Field(..., min_length=2, max_length=100)

class StaffCreate(StaffBase):
    pass

class StaffUpdate(BaseModel):
    staff_name: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    is_active: Optional[bool] = None

class StaffOut(StaffBase):
    staff_id: int
    is_active: bool
    active_assignments_count: Optional[int] = 0
    completed_assignments_count: Optional[int] = 0

    class Config:
        from_attributes = True
