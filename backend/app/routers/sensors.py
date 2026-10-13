from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.models.sensor import SensorReading
from app.schemas.sensor import SensorReadingCreate, SensorReadingOut

router = APIRouter(prefix="/sensors", tags=["IoT Sensors"])

def verify_sensor_api_key(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key != settings.SENSOR_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing Sensor API Key"
        )
    return x_api_key

@router.post("/readings", response_model=SensorReadingOut, status_code=status.HTTP_201_CREATED)
def record_sensor_reading(
    reading_in: SensorReadingCreate,
    api_key: str = Depends(verify_sensor_api_key),
    db: Session = Depends(get_db)
):
    reading = SensorReading(
        sensor_id=reading_in.sensor_id,
        location=reading_in.location,
        flow_rate=reading_in.flow_rate,
        tank_level=reading_in.tank_level,
        battery_level=reading_in.battery_level
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading

@router.get("/latest", response_model=List[SensorReadingOut])
def get_latest_readings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    # Find the latest reading for each distinct sensor_id
    subquery = db.query(
        SensorReading.sensor_id,
        func.max(SensorReading.reading_id).label("max_id")
    ).group_by(SensorReading.sensor_id).subquery()

    latest_readings = db.query(SensorReading).join(
        subquery,
        SensorReading.reading_id == subquery.c.max_id
    ).all()

    return latest_readings
