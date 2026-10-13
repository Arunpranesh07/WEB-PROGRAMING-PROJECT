from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class NotificationOut(BaseModel):
    notification_id: int
    user_id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    message: str = Field(..., min_length=5)
    type: str = Field("General", description="Shortage, Maintenance, or General")

class AnnouncementOut(BaseModel):
    announcement_id: int
    title: str
    message: str
    type: str
    created_at: datetime

    class Config:
        from_attributes = True
