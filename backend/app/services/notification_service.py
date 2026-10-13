from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.communication import Notification
from app.models.user import User

def create_user_notification(db: Session, user_id: int, message: str) -> Notification:
    notification = Notification(
        user_id=user_id,
        message=message,
        is_read=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

def broadcast_notification_to_all_residents(db: Session, message: str) -> int:
    residents = db.query(User).filter(User.role == "resident").all()
    count = 0
    now = datetime.now(timezone.utc)
    for res in residents:
        notif = Notification(
            user_id=res.user_id,
            message=message,
            is_read=False,
            created_at=now
        )
        db.add(notif)
        count += 1
    db.commit()
    return count
