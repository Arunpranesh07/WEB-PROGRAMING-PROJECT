from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    reading_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sensor_id = Column(String(50), nullable=False, index=True)
    location = Column(String(100), nullable=False)
    flow_rate = Column(Float, nullable=False)  # in L/min
    tank_level = Column(Float, nullable=False)  # 0 to 100 percentage
    battery_level = Column(Float, nullable=False)  # 0 to 100 percentage
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
