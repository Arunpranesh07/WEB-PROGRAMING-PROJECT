from datetime import date, time, datetime
from typing import Optional
from pydantic import BaseModel, Field

class WaterSupplyBase(BaseModel):
    area_name: str = Field(..., min_length=2, max_length=100)
    supply_date: date
    start_time: time
    end_time: time
    availability_status: str = Field("Scheduled", description="Available, Interrupted, or Scheduled")

class WaterSupplyCreate(WaterSupplyBase):
    pass

class WaterSupplyUpdate(BaseModel):
    area_name: Optional[str] = None
    supply_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    availability_status: Optional[str] = None

class WaterSupplyOut(WaterSupplyBase):
    supply_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WaterUsageBase(BaseModel):
    area_name: str
    date: date
    liters_consumed: float

class WaterUsageCreate(WaterUsageBase):
    pass

class WaterUsageOut(WaterUsageBase):
    usage_id: int

    class Config:
        from_attributes = True
