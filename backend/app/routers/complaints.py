from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.models.complaint import Complaint, ComplaintAssignment
from app.models.staff import MaintenanceStaff
from app.schemas.complaint import (
    ComplaintOut, ComplaintCreate, ComplaintUpdateStatus,
    ComplaintUpdatePriority, ComplaintAssignStaff, ComplaintStats
)
from app.services.notification_service import create_user_notification
from app.utils.file_storage import save_complaint_image

router = APIRouter(prefix="/complaints", tags=["Complaints"])

def format_complaint_response(complaint: Complaint) -> dict:
    assignments_data = []
    for a in complaint.assignments:
        staff_data = None
        if a.staff:
            staff_data = {
                "assignment_id": a.assignment_id,
                "staff_id": a.staff_id,
                "staff_name": a.staff.staff_name,
                "phone": a.staff.phone,
                "specialization": a.staff.specialization,
                "assigned_at": a.assigned_at,
                "completed_at": a.completed_at
            }
            assignments_data.append(staff_data)

    parent_display_id = None
    if complaint.parent_complaint:
        parent_display_id = complaint.parent_complaint.display_id

    return {
        "complaint_id": complaint.complaint_id,
        "display_id": complaint.display_id or f"WCP{1000 + complaint.complaint_id}",
        "user_id": complaint.user_id,
        "user_name": complaint.user.name if complaint.user else None,
        "user_email": complaint.user.email if complaint.user else None,
        "category": complaint.category,
        "description": complaint.description,
        "location": complaint.location,
        "latitude": complaint.latitude,
        "longitude": complaint.longitude,
        "image_url": complaint.image_url,
        "priority": complaint.priority,
        "status": complaint.status,
        "is_duplicate_of": complaint.is_duplicate_of,
        "duplicate_display_id": parent_display_id,
        "created_at": complaint.created_at,
        "assignments": assignments_data
    }

@router.get("/stats", response_model=ComplaintStats)
def get_complaint_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Complaint)
    if current_user.role == "resident":
        query = query.filter(Complaint.user_id == current_user.user_id)

    total = query.count()
    pending = query.filter(Complaint.status == "Pending").count()
    in_progress = query.filter(Complaint.status == "In Progress").count()
    resolved = query.filter(Complaint.status == "Resolved").count()

    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved
    }

@router.get("", response_model=List[ComplaintOut])
def get_complaints(
    status_filter: Optional[str] = Query(None, alias="status"),
    category_filter: Optional[str] = Query(None, alias="category"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Complaint)

    # Role check: resident sees only their complaints; admin sees all
    if current_user.role == "resident":
        query = query.filter(Complaint.user_id == current_user.user_id)

    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    if category_filter:
        query = query.filter(Complaint.category == category_filter)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Complaint.description.ilike(search_pattern)) |
            (Complaint.location.ilike(search_pattern)) |
            (Complaint.display_id.ilike(search_pattern))
        )

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return [format_complaint_response(c) for c in complaints]

@router.post("", response_model=ComplaintOut, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    category: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    priority: Optional[str] = Form("Medium"),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_url = None
    if image and image.filename:
        image_url = await save_complaint_image(image)

    # Validate category and priority
    valid_categories = {"Leakage", "Shortage", "Water Quality"}
    if category not in valid_categories:
        category = "Leakage"  # default fallback

    valid_priorities = {"Low", "Medium", "High", "Urgent"}
    if priority not in valid_priorities:
        priority = "Medium"

    complaint = Complaint(
        user_id=current_user.user_id,
        category=category,
        description=description,
        location=location,
        latitude=latitude,
        longitude=longitude,
        image_url=image_url,
        priority=priority,
        status="Pending",
        created_at=datetime.now(timezone.utc)
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # Set display_id as WCP1001 format
    complaint.display_id = f"WCP{1000 + complaint.complaint_id}"
    db.commit()
    db.refresh(complaint)

    # Create notification for the resident confirming submission
    create_user_notification(
        db,
        user_id=current_user.user_id,
        message=f"Complaint {complaint.display_id} for '{complaint.category}' has been successfully submitted."
    )

    return format_complaint_response(complaint)

@router.get("/{id_or_display_id}", response_model=ComplaintOut)
def get_complaint(
    id_or_display_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = None
    if id_or_display_id.isdigit():
        complaint = db.query(Complaint).filter(Complaint.complaint_id == int(id_or_display_id)).first()
    if not complaint:
        complaint = db.query(Complaint).filter(Complaint.display_id.ilike(id_or_display_id)).first()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    if current_user.role == "resident" and complaint.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return format_complaint_response(complaint)

@router.patch("/{complaint_id}/status", response_model=ComplaintOut)
def update_complaint_status(
    complaint_id: int,
    status_in: ComplaintUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    new_status = status_in.status
    if new_status not in ["Pending", "In Progress", "Resolved"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")

    complaint.status = new_status

    # If resolved, set completed_at on active assignments
    if new_status == "Resolved":
        now = datetime.now(timezone.utc)
        for assignment in complaint.assignments:
            if not assignment.completed_at:
                assignment.completed_at = now

    db.commit()
    db.refresh(complaint)

    # Send notification to resident
    create_user_notification(
        db,
        user_id=complaint.user_id,
        message=f"Your complaint {complaint.display_id} status has been updated to '{complaint.status}'."
    )

    return format_complaint_response(complaint)

@router.patch("/{complaint_id}/priority", response_model=ComplaintOut)
def update_complaint_priority(
    complaint_id: int,
    priority_in: ComplaintUpdatePriority,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    if priority_in.priority not in ["Low", "Medium", "High", "Urgent"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid priority")

    complaint.priority = priority_in.priority
    db.commit()
    db.refresh(complaint)

    return format_complaint_response(complaint)

@router.post("/{complaint_id}/assign", response_model=ComplaintOut)
def assign_complaint_staff(
    complaint_id: int,
    assign_in: ComplaintAssignStaff,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    staff = db.query(MaintenanceStaff).filter(MaintenanceStaff.staff_id == assign_in.staff_id).first()
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff member not found")

    # If status is still Pending, move it to In Progress automatically
    if complaint.status == "Pending":
        complaint.status = "In Progress"

    assignment = ComplaintAssignment(
        complaint_id=complaint.complaint_id,
        staff_id=staff.staff_id,
        assigned_at=datetime.now(timezone.utc)
    )
    db.add(assignment)
    db.commit()
    db.refresh(complaint)

    create_user_notification(
        db,
        user_id=complaint.user_id,
        message=f"Staff member {staff.staff_name} has been assigned to your complaint {complaint.display_id}."
    )

    return format_complaint_response(complaint)

@router.post("/{complaint_id}/merge", response_model=ComplaintOut)
def merge_duplicate(
    complaint_id: int,
    parent_id: int = Query(..., description="ID of the parent complaint to merge into"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    parent = db.query(Complaint).filter(Complaint.complaint_id == parent_id).first()
    if not complaint or not parent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    complaint.is_duplicate_of = parent.complaint_id
    db.commit()
    db.refresh(complaint)

    create_user_notification(
        db,
        user_id=complaint.user_id,
        message=f"Your complaint {complaint.display_id} was identified as duplicate and linked with {parent.display_id}."
    )

    return format_complaint_response(complaint)

@router.post("/{complaint_id}/dismiss-duplicate", response_model=ComplaintOut)
def dismiss_duplicate(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    complaint.is_duplicate_of = None
    db.commit()
    db.refresh(complaint)
    return format_complaint_response(complaint)
