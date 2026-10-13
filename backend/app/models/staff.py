from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class MaintenanceStaff(Base):
    __tablename__ = "maintenance_staff"

    staff_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    staff_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    specialization = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)

    assignments = relationship("ComplaintAssignment", back_populates="staff")
