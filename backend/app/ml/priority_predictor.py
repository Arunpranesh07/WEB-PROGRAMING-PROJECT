from typing import Dict, Any

URGENT_KEYWORDS = ["burst", "flooding", "flood", "sewage", "emergency", "foul odor", "infection", "hazard", "overflowing", "huge leak"]
HIGH_KEYWORDS = ["no water", "stopped completely", "black particles", "contamination", "heavy sediment", "empty tank", "broken pipe"]
LOW_KEYWORDS = ["slight", "minor", "drip", "slow", "faucet handle", "faint smell", "low priority"]

def predict_complaint_priority(category: str, description: str, duplicate_count: int = 0) -> Dict[str, Any]:
    text_lower = description.lower()

    # Rule 1: High number of similar reports automatically escalates to Urgent
    if duplicate_count >= 2:
        return {
            "predicted_priority": "Urgent",
            "reason": f"Escalated due to {duplicate_count} active similar complaints reported in this area."
        }

    # Rule 2: Check urgent keywords
    for kw in URGENT_KEYWORDS:
        if kw in text_lower:
            return {
                "predicted_priority": "Urgent",
                "reason": f"Triggered by critical severity keyword '{kw}'."
            }

    # Rule 3: Check high keywords
    for kw in HIGH_KEYWORDS:
        if kw in text_lower:
            return {
                "predicted_priority": "High",
                "reason": f"Triggered by impact keyword '{kw}'."
            }

    # Rule 4: Check low keywords
    for kw in LOW_KEYWORDS:
        if kw in text_lower:
            return {
                "predicted_priority": "Low",
                "reason": f"Identified as minor routine issue ('{kw}')."
            }

    # Default rules by category
    if category == "Shortage":
        return {
            "predicted_priority": "High",
            "reason": "Water supply outage typically affects household daily essentials."
        }
    elif category == "Water Quality":
        return {
            "predicted_priority": "High",
            "reason": "Water safety and health risk assessment."
        }
    else:
        return {
            "predicted_priority": "Medium",
            "reason": "Standard maintenance priority."
        }
