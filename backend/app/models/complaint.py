from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    complaint_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    display_id = Column(String(20), unique=True, index=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)  # "Leakage" | "Shortage" | "Water Quality"
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(String(255), nullable=True)
    priority = Column(String(20), nullable=False, default="Medium")  # "Low" | "Medium" | "High" | "Urgent"
    status = Column(String(20), nullable=False, default="Pending")  # "Pending" | "In Progress" | "Resolved"
    is_duplicate_of = Column(Integer, ForeignKey("complaints.complaint_id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="complaints")
    assignments = relationship("ComplaintAssignment", back_populates="complaint", cascade="all, delete-orphan")
    duplicates = relationship("Complaint", backref="parent_complaint", remote_side=[complaint_id])

class ComplaintAssignment(Base):
    __tablename__ = "complaint_assignments"

    assignment_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.complaint_id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(Integer, ForeignKey("maintenance_staff.staff_id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    complaint = relationship("Complaint", back_populates="assignments")
    staff = relationship("MaintenanceStaff", back_populates="assignments")
