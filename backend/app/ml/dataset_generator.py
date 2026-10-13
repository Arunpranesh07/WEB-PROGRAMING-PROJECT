import random
from typing import List, Tuple

# Comprehensive vocabulary and realistic complaint templates
LEAKAGE_TEMPLATES = [
    "Severe water leakage observed from the main pipeline near {loc}.",
    "Water is constantly leaking from the overhead tank at {loc}.",
    "Pipe burst in the basement of {loc}, water is flooding the walkway.",
    "Ceiling is damp and water is dripping continuously in {loc}.",
    "A massive leak under the kitchen sink, flooding the floor in {loc}.",
    "Garden sprinkler system pipe cracked and gushing water near {loc}.",
    "Bathroom faucet is broken and continuously leaking in {loc}.",
    "Dripping joint in the external riser pipe outside {loc}.",
    "Water gushing out of an underground supply pipe next to {loc}.",
    "Seepage on the wall causing puddle formation in {loc}.",
    "Heavy water loss due to rusted pipe leak in {loc}.",
    "Valve near the pump room is loose and leaking high pressure water near {loc}."
]

SHORTAGE_TEMPLATES = [
    "No water supply since morning in {loc}. Taps are completely dry.",
    "Very low water pressure in {loc}. Unable to fill buckets.",
    "Water stopped completely around 2 PM in {loc}, need emergency tanker.",
    "Severe water shortage in {loc}. Tank has been empty for hours.",
    "Scheduled water supply did not arrive today in {loc}.",
    "Only a thin trickle of water coming from taps in {loc}.",
    "Upper floors in {loc} have zero water pressure while ground floor has some.",
    "Water pump not functioning, leading to complete water outage in {loc}.",
    "Frequent supply interruptions throughout the day in {loc}.",
    "Water cut off without prior notice or announcement in {loc}."
]

QUALITY_TEMPLATES = [
    "Water coming from taps is muddy brown and has heavy sediment in {loc}.",
    "Strong chlorine and chemical smell in the tap water at {loc}.",
    "Water has a foul sewage odor and appears yellowish in {loc}.",
    "White cloudy appearance and strange metallic taste in drinking water at {loc}.",
    "Black particles and rust coming out of shower head in {loc}.",
    "Oily film visible on the surface of stored water in {loc}.",
    "Water feels greasy and smells like rotten eggs in {loc}.",
    "Kids got stomach infection possibly due to contaminated water supply in {loc}.",
    "Hard water stains and murky suspended particles in {loc}.",
    "Water quality has severely degraded with foul smell and dirt in {loc}."
]

LOCATIONS = [
    "Block A - Flat 101", "Block A - Flat 204", "Block A - Flat 402",
    "Block B - Flat 102", "Block B - Flat 303", "Block B - Flat 501",
    "Block C - Flat 105", "Block C - Flat 202", "Block C - Flat 404",
    "Campus Hostel 1", "Campus Hostel 2", "Dining Hall Wing",
    "Clubhouse Restroom", "Central Park Lawn", "Main Gate Security Post",
    "Underground Pump House", "Overhead Tank Area", "Faculty Quarters B"
]

def generate_synthetic_dataset(samples_per_category: int = 120) -> List[Tuple[str, str]]:
    """
    Generates balanced synthetic complaint descriptions and labels.
    Returns list of (text, category) tuples (minimum 360 samples).
    """
    dataset = []

    for _ in range(samples_per_category):
        loc = random.choice(LOCATIONS)
        template = random.choice(LEAKAGE_TEMPLATES)
        text = template.format(loc=loc)
        dataset.append((text, "Leakage"))

    for _ in range(samples_per_category):
        loc = random.choice(LOCATIONS)
        template = random.choice(SHORTAGE_TEMPLATES)
        text = template.format(loc=loc)
        dataset.append((text, "Shortage"))

    for _ in range(samples_per_category):
        loc = random.choice(LOCATIONS)
        template = random.choice(QUALITY_TEMPLATES)
        text = template.format(loc=loc)
        dataset.append((text, "Water Quality"))

    random.shuffle(dataset)
    return dataset

if __name__ == "__main__":
    data = generate_synthetic_dataset(120)
    print(f"Generated {len(data)} balanced synthetic samples.")
    print("Sample record:", data[0])
