from datetime import datetime
from pydantic import BaseModel, Field

class SensorReadingCreate(BaseModel):
    sensor_id: str = Field(..., min_length=2, max_length=50)
    location: str = Field(..., min_length=2, max_length=100)
    flow_rate: float = Field(..., ge=0.0)
    tank_level: float = Field(..., ge=0.0, le=100.0)
    battery_level: float = Field(..., ge=0.0, le=100.0)

class SensorReadingOut(SensorReadingCreate):
    reading_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
