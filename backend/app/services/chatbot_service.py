import re
from datetime import date
from sqlalchemy.orm import Session
from app.models.complaint import Complaint
from app.models.supply import WaterSupply

def process_chatbot_query(message: str, user_id: int, db: Session) -> str:
    text = message.strip().lower()

    # Intent 1: Check complaint status via ID (e.g., WCP1001)
    wcp_match = re.search(r'(wcp\d+)', text, re.IGNORECASE)
    if wcp_match or ("status" in text and "complaint" in text and any(char.isdigit() for char in text)):
        display_id = wcp_match.group(1).upper() if wcp_match else None
        if not display_id:
            # extract first number
            num_match = re.search(r'\d+', text)
            if num_match:
                display_id = f"WCP{num_match.group(0)}"

        if display_id:
            complaint = db.query(Complaint).filter(Complaint.display_id.ilike(display_id)).first()
            if complaint:
                staff_info = "No staff assigned yet."
                if complaint.assignments and complaint.assignments[-1].staff:
                    staff = complaint.assignments[-1].staff
                    staff_info = f"Assigned to {staff.staff_name} ({staff.phone}, {staff.specialization})."

                return (
                    f"📋 **Complaint {complaint.display_id} Details:**\n"
                    f"- **Category:** {complaint.category}\n"
                    f"- **Status:** {complaint.status}\n"
                    f"- **Priority:** {complaint.priority}\n"
                    f"- **Location:** {complaint.location}\n"
                    f"- **Technician:** {staff_info}\n"
                    f"- **Reported On:** {complaint.created_at.strftime('%b %d, %Y %I:%M %p') if complaint.created_at else 'Recent'}"
                )
            else:
                return f"🔍 I couldn't find any complaint matching ID **{display_id}**. Please double-check the ID or check the 'Complaint History' tab."

    # Intent 2: Supply schedule inquiries
    if any(k in text for k in ["schedule", "supply", "timing", "timings", "when will water come", "water timing", "available"]):
        today = date.today()
        schedules = db.query(WaterSupply).filter(WaterSupply.supply_date >= today).order_by(WaterSupply.supply_date.asc(), WaterSupply.start_time.asc()).limit(5).all()
        if not schedules:
            return "💧 Currently there are no scheduled supply slots listed for today. Please check back shortly or refer to the Water Supply page."

        resp = "💧 **Upcoming Water Supply Schedules:**\n"
        for s in schedules:
            status_icon = "🟢" if s.availability_status == "Available" else ("🟡" if s.availability_status == "Scheduled" else "🔴")
            resp += f"- **{s.area_name}** ({s.supply_date}): {s.start_time.strftime('%I:%M %p')} - {s.end_time.strftime('%I:%M %p')} [{status_icon} {s.availability_status}]\n"
        resp += "\nYou can view full area details in the **Water Supply** section."
        return resp

    # Intent 3: How to file / submit a complaint
    if (("complaint" in text or "report" in text or "issue" in text) and any(w in text for w in ["how", "file", "submit", "lodge", "register", "create"])) or any(k in text for k in ["how to file", "file complaint", "submit complaint", "report leak", "report shortage", "how to report", "lodge"]):
        return (
            "📝 **How to Submit a Complaint:**\n"
            "1. Navigate to the **Submit Complaint** page from the sidebar.\n"
            "2. Describe your issue. Our AI will automatically suggest the right category!\n"
            "3. Select or enter your location (you can even drop a pin on the community map).\n"
            "4. Upload an optional photo to help technicians locate the issue.\n"
            "5. Click **Submit**. You'll receive a unique tracking ID (e.g. `WCP1001`) and instant notifications on updates!"
        )

    # Intent 4: Water conservation tips
    if any(k in text for k in ["tip", "tips", "conserve", "save water", "conservation"]):
        return (
            "🌱 **Smart Water Conservation Tips:**\n"
            "• Fix dripping faucets promptly; a single drip can waste over 30 liters daily.\n"
            "• Turn off taps while brushing teeth or shaving to save ~6 liters/minute.\n"
            "• Run washing machines and dishwashers only with full loads.\n"
            "• Install aerators on sink faucets to reduce flow while maintaining water pressure.\n"
            "• Report common community pipeline leakages immediately to prevent supply cuts!"
        )

    # Default / Greetings
    return (
        "👋 Hello! I'm your **AquaFlow Community Assistant**.\n\n"
        "Here are things you can ask me:\n"
        "• *'When is the next water supply for Block A?'*\n"
        "• *'What is the status of complaint WCP1001?'*\n"
        "• *'How do I file a water quality complaint?'*\n"
        "• *'Give me water saving tips'*\n\n"
        "Feel free to ask anytime!"
    )
