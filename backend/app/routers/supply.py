from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.models.supply import WaterSupply
from app.schemas.supply import WaterSupplyCreate, WaterSupplyUpdate, WaterSupplyOut
from app.services.notification_service import broadcast_notification_to_all_residents

router = APIRouter(prefix="/supply", tags=["Water Supply"])

@router.get("", response_model=List[WaterSupplyOut])
def get_schedules(
    area: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(WaterSupply)
    if area:
        query = query.filter(WaterSupply.area_name.ilike(f"%{area}%"))
    if status:
        query = query.filter(WaterSupply.availability_status == status)

    return query.order_by(WaterSupply.supply_date.desc(), WaterSupply.start_time.asc()).all()

@router.post("", response_model=WaterSupplyOut, status_code=status.HTTP_201_CREATED)
def create_schedule(
    supply_in: WaterSupplyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    schedule = WaterSupply(
        area_name=supply_in.area_name,
        supply_date=supply_in.supply_date,
        start_time=supply_in.start_time,
        end_time=supply_in.end_time,
        availability_status=supply_in.availability_status
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    broadcast_notification_to_all_residents(
        db,
        f"New water supply schedule posted for {schedule.area_name} on {schedule.supply_date} ({schedule.start_time.strftime('%H:%M')} - {schedule.end_time.strftime('%H:%M')})."
    )

    return schedule

@router.put("/{supply_id}", response_model=WaterSupplyOut)
def update_schedule(
    supply_id: int,
    supply_in: WaterSupplyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    schedule = db.query(WaterSupply).filter(WaterSupply.supply_id == supply_id).first()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")

    old_status = schedule.availability_status

    if supply_in.area_name is not None:
        schedule.area_name = supply_in.area_name
    if supply_in.supply_date is not None:
        schedule.supply_date = supply_in.supply_date
    if supply_in.start_time is not None:
        schedule.start_time = supply_in.start_time
    if supply_in.end_time is not None:
        schedule.end_time = supply_in.end_time
    if supply_in.availability_status is not None:
        schedule.availability_status = supply_in.availability_status

    db.commit()
    db.refresh(schedule)

    if schedule.availability_status != old_status:
        broadcast_notification_to_all_residents(
            db,
            f"Alert: Water supply status for {schedule.area_name} is now '{schedule.availability_status}'."
        )

    return schedule

@router.delete("/{supply_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(
    supply_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    schedule = db.query(WaterSupply).filter(WaterSupply.supply_id == supply_id).first()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")

    db.delete(schedule)
    db.commit()
    return None
