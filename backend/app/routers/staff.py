from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_admin
from app.models.user import User
from app.models.staff import MaintenanceStaff
from app.models.complaint import ComplaintAssignment
from app.schemas.staff import StaffCreate, StaffUpdate, StaffOut

router = APIRouter(prefix="/staff", tags=["Maintenance Staff"])

def format_staff_response(staff: MaintenanceStaff, db: Session) -> dict:
    active_count = db.query(ComplaintAssignment).filter(
        ComplaintAssignment.staff_id == staff.staff_id,
        ComplaintAssignment.completed_at == None
    ).count()

    completed_count = db.query(ComplaintAssignment).filter(
        ComplaintAssignment.staff_id == staff.staff_id,
        ComplaintAssignment.completed_at != None
    ).count()

    return {
        "staff_id": staff.staff_id,
        "staff_name": staff.staff_name,
        "phone": staff.phone,
        "specialization": staff.specialization,
        "is_active": staff.is_active,
        "active_assignments_count": active_count,
        "completed_assignments_count": completed_count
    }

@router.get("", response_model=List[StaffOut])
def get_all_staff(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    staff_members = db.query(MaintenanceStaff).filter(MaintenanceStaff.is_active == True).all()
    return [format_staff_response(s, db) for s in staff_members]

@router.post("", response_model=StaffOut, status_code=status.HTTP_201_CREATED)
def create_staff(
    staff_in: StaffCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    staff = MaintenanceStaff(
        staff_name=staff_in.staff_name,
        phone=staff_in.phone,
        specialization=staff_in.specialization,
        is_active=True
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return format_staff_response(staff, db)

@router.put("/{staff_id}", response_model=StaffOut)
def update_staff(
    staff_id: int,
    staff_in: StaffUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    staff = db.query(MaintenanceStaff).filter(MaintenanceStaff.staff_id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff member not found")

    if staff_in.staff_name is not None:
        staff.staff_name = staff_in.staff_name
    if staff_in.phone is not None:
        staff.phone = staff_in.phone
    if staff_in.specialization is not None:
        staff.specialization = staff_in.specialization
    if staff_in.is_active is not None:
        staff.is_active = staff_in.is_active

    db.commit()
    db.refresh(staff)
    return format_staff_response(staff, db)

@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    staff = db.query(MaintenanceStaff).filter(MaintenanceStaff.staff_id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff member not found")

    # Soft delete / deactivate
    staff.is_active = False
    db.commit()
    return None
