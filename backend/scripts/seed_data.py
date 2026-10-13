import os
import sys
import random
from datetime import date, time, datetime, timedelta, timezone

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User
from app.models.staff import MaintenanceStaff
from app.models.complaint import Complaint, ComplaintAssignment
from app.models.supply import WaterSupply, WaterUsage
from app.models.communication import Notification, Announcement
from app.models.sensor import SensorReading
from app.ml.train_classifier import train_and_save_model

def seed():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if users already seeded
        if db.query(User).count() > 0:
            print("Database already contains data. Skipping seeding.")
            return

        print("Seeding Users...")
        admin = User(
            name="Admin Officer",
            email="admin@waterhub.com",
            phone="+91 98765 43210",
            address="Facility Management Office, Building 1",
            password_hash=hash_password("admin123"),
            role="admin"
        )
        db.add(admin)

        resident1 = User(
            name="Aarav Sharma",
            email="resident1@waterhub.com",
            phone="+91 98111 22334",
            address="Block A - Flat 302",
            password_hash=hash_password("resident123"),
            role="resident"
        )
        resident2 = User(
            name="Priya Patel",
            email="resident2@waterhub.com",
            phone="+91 98222 33445",
            address="Block B - Flat 104",
            password_hash=hash_password("resident123"),
            role="resident"
        )
        resident3 = User(
            name="Karthik Raman",
            email="resident3@waterhub.com",
            phone="+91 98333 44556",
            address="Campus Hostel 2 - Room 214",
            password_hash=hash_password("resident123"),
            role="resident"
        )
        db.add_all([resident1, resident2, resident3])
        db.commit()
        db.refresh(admin)
        db.refresh(resident1)
        db.refresh(resident2)
        db.refresh(resident3)

        print("Seeding Maintenance Staff...")
        staff1 = MaintenanceStaff(
            staff_name="Ramesh Kumar",
            phone="+91 91234 56780",
            specialization="Plumbing & Pipe Fitting",
            is_active=True
        )
        staff2 = MaintenanceStaff(
            staff_name="Suresh Babu",
            phone="+91 91234 56781",
            specialization="Pump & Motor Mechanics",
            is_active=True
        )
        staff3 = MaintenanceStaff(
            staff_name="Anjali Nair",
            phone="+91 91234 56782",
            specialization="Water Filtration & Quality Testing",
            is_active=True
        )
        db.add_all([staff1, staff2, staff3])
        db.commit()
        db.refresh(staff1)
        db.refresh(staff2)
        db.refresh(staff3)

        print("Seeding Water Supply Schedules...")
        today = date.today()
        areas = ["Block A", "Block B", "Block C", "Campus Hostels"]

        schedules = [
            WaterSupply(
                area_name="Block A",
                supply_date=today,
                start_time=time(6, 0),
                end_time=time(9, 30),
                availability_status="Available"
            ),
            WaterSupply(
                area_name="Block B",
                supply_date=today,
                start_time=time(6, 30),
                end_time=time(10, 0),
                availability_status="Available"
            ),
            WaterSupply(
                area_name="Block C",
                supply_date=today,
                start_time=time(17, 0),
                end_time=time(20, 0),
                availability_status="Scheduled"
            ),
            WaterSupply(
                area_name="Campus Hostels",
                supply_date=today,
                start_time=time(17, 30),
                end_time=time(21, 0),
                availability_status="Interrupted"
            ),
            WaterSupply(
                area_name="Block A",
                supply_date=today + timedelta(days=1),
                start_time=time(6, 0),
                end_time=time(9, 30),
                availability_status="Scheduled"
            ),
            WaterSupply(
                area_name="Block B",
                supply_date=today + timedelta(days=1),
                start_time=time(6, 30),
                end_time=time(10, 0),
                availability_status="Scheduled"
            ),
        ]
        db.add_all(schedules)
        db.commit()

        print("Seeding Complaints & Assignments...")
        # Base campus latitude/longitude: 13.0827, 80.2707 (Chennai community)
        base_lat, base_lng = 13.0827, 80.2707

        c1 = Complaint(
            user_id=resident1.user_id,
            category="Leakage",
            description="Main overhead pipe leaking continuously on the terrace, water pooling on roof.",
            location="Block A - Terrace Tank",
            latitude=base_lat + 0.0012,
            longitude=base_lng + 0.0015,
            priority="High",
            status="In Progress",
            created_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add(c1)
        db.commit()
        db.refresh(c1)
        c1.display_id = f"WCP{1000 + c1.complaint_id}"

        # Assign c1 to staff1
        assign1 = ComplaintAssignment(
            complaint_id=c1.complaint_id,
            staff_id=staff1.staff_id,
            assigned_at=datetime.now(timezone.utc) - timedelta(days=1)
        )
        db.add(assign1)

        c2 = Complaint(
            user_id=resident2.user_id,
            category="Water Quality",
            description="Tap water has a dark brownish tint with muddy smell since yesterday evening.",
            location="Block B - Flat 104 Kitchen",
            latitude=base_lat - 0.0010,
            longitude=base_lng + 0.0020,
            priority="Urgent",
            status="Pending",
            created_at=datetime.now(timezone.utc) - timedelta(hours=14)
        )
        db.add(c2)
        db.commit()
        db.refresh(c2)
        c2.display_id = f"WCP{1000 + c2.complaint_id}"

        c3 = Complaint(
            user_id=resident3.user_id,
            category="Shortage",
            description="Zero pressure in hostel 2nd floor bathrooms. No water flow since afternoon.",
            location="Campus Hostel 2 - 2nd Floor",
            latitude=base_lat + 0.0025,
            longitude=base_lng - 0.0018,
            priority="Medium",
            status="Resolved",
            created_at=datetime.now(timezone.utc) - timedelta(days=4)
        )
        db.add(c3)
        db.commit()
        db.refresh(c3)
        c3.display_id = f"WCP{1000 + c3.complaint_id}"

        # Assign c3 to staff2 and resolve
        assign3 = ComplaintAssignment(
            complaint_id=c3.complaint_id,
            staff_id=staff2.staff_id,
            assigned_at=datetime.now(timezone.utc) - timedelta(days=3),
            completed_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add(assign3)

        c4 = Complaint(
            user_id=resident1.user_id,
            category="Leakage",
            description="External drainage pipe joint dripping near the lobby garden pathway.",
            location="Block A - Ground Lobby Garden",
            latitude=base_lat + 0.0008,
            longitude=base_lng + 0.0010,
            priority="Low",
            status="Pending",
            created_at=datetime.now(timezone.utc) - timedelta(hours=5)
        )
        db.add(c4)
        db.commit()
        db.refresh(c4)
        c4.display_id = f"WCP{1000 + c4.complaint_id}"

        print("Seeding Announcements & Notifications...")
        ann1 = Announcement(
            title="Scheduled Maintenance for Campus Hostels",
            message="Pump room booster servicing in progress for Campus Hostels. Normal supply will resume by 9:00 PM.",
            type="Maintenance"
        )
        ann2 = Announcement(
            title="Water Conservation Notice",
            message="Please avoid non-essential car washing and lawn watering during dry spell periods.",
            type="General"
        )
        db.add_all([ann1, ann2])

        notif1 = Notification(
            user_id=resident1.user_id,
            message="Technician Ramesh Kumar has been assigned to your complaint WCP1001.",
            is_read=False
        )
        notif2 = Notification(
            user_id=resident3.user_id,
            message="Your complaint WCP1003 has been marked as Resolved. Thank you for your patience.",
            is_read=True
        )
        db.add_all([notif1, notif2])
        db.commit()

        print("Seeding 90 days of simulated Water Usage...")
        usage_records = []
        for days_back in range(90, 0, -1):
            curr_date = today - timedelta(days=days_back)
            # base consumption: Block A: ~4200L, Block B: ~4600L, Block C: ~3900L, Hostels: ~6500L
            base_rates = {
                "Block A": 4200,
                "Block B": 4600,
                "Block C": 3900,
                "Campus Hostels": 6500
            }
            # Add weekend bump and small random noise
            is_weekend = curr_date.weekday() >= 5
            multiplier = 1.15 if is_weekend else 1.0

            for area, base_val in base_rates.items():
                liters = round(base_val * multiplier * random.uniform(0.90, 1.10), 1)
                usage_records.append(
                    WaterUsage(
                        area_name=area,
                        date=curr_date,
                        liters_consumed=liters
                    )
                )

        db.bulk_save_objects(usage_records)
        db.commit()

        print("Seeding IoT Sensor Readings...")
        sensor_data = [
            SensorReading(
                sensor_id="FLOW-BLK-A",
                location="Block A Inflow Main",
                flow_rate=42.5,
                tank_level=84.0,
                battery_level=96.0,
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=5)
            ),
            SensorReading(
                sensor_id="FLOW-BLK-B",
                location="Block B Inflow Main",
                flow_rate=38.2,
                tank_level=79.5,
                battery_level=92.0,
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=4)
            ),
            SensorReading(
                sensor_id="FLOW-BLK-C",
                location="Block C Inflow Main",
                flow_rate=0.0,
                tank_level=62.0,
                battery_level=88.5,
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=2)
            ),
            SensorReading(
                sensor_id="FLOW-HOSTEL",
                location="Campus Hostel Overhead Tank",
                flow_rate=12.1,
                tank_level=41.0,
                battery_level=75.0,
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=1)
            ),
        ]
        db.add_all(sensor_data)
        db.commit()

        print("Seeding completed successfully!")
    finally:
        db.close()

    # Train AI Model
    print("Training scikit-learn AI complaint classifier model...")
    train_and_save_model()

if __name__ == "__main__":
    seed()
