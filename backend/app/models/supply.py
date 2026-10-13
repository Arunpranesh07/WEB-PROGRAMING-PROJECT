from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, Time, Float, DateTime
from app.core.database import Base

class WaterSupply(Base):
    __tablename__ = "water_supply"

    supply_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    area_name = Column(String(100), nullable=False)
    supply_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    availability_status = Column(String(50), nullable=False, default="Scheduled")  # "Available" | "Interrupted" | "Scheduled"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class WaterUsage(Base):
    __tablename__ = "water_usage"

    usage_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    area_name = Column(String(100), nullable=False)
    date = Column(Date, nullable=False)
    liters_consumed = Column(Float, nullable=False)
