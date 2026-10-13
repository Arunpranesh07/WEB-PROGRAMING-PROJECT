from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.models.communication import Announcement
from app.schemas.communication import AnnouncementCreate, AnnouncementOut
from app.services.notification_service import broadcast_notification_to_all_residents

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.get("", response_model=List[AnnouncementOut])
def get_announcements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Announcement).order_by(Announcement.created_at.desc()).limit(20).all()

@router.post("", response_model=AnnouncementOut, status_code=status.HTTP_201_CREATED)
def create_announcement(
    announcement_in: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    announcement = Announcement(
        title=announcement_in.title,
        message=announcement_in.message,
        type=announcement_in.type
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    # Broadcast notification to all residents
    broadcast_notification_to_all_residents(
        db,
        f"Announcement [{announcement.type}]: {announcement.title} - {announcement.message}"
    )

    return announcement
