import os
import sys
import time
import random
import json
import urllib.request
import urllib.error

API_URL = os.getenv("AQUAFLOW_API_URL", "http://localhost:8000/api/sensors/readings")
API_KEY = os.getenv("SENSOR_API_KEY", "aquaflow-sensor-secret-key-2026")

SENSORS = [
    {"id": "FLOW-BLK-A", "location": "Block A Inflow Main", "base_flow": 40.0, "tank_min": 75, "tank_max": 95},
    {"id": "FLOW-BLK-B", "location": "Block B Inflow Main", "base_flow": 35.0, "tank_min": 70, "tank_max": 90},
    {"id": "FLOW-BLK-C", "location": "Block C Inflow Main", "base_flow": 28.0, "tank_min": 60, "tank_max": 85},
    {"id": "FLOW-HOSTEL", "location": "Campus Hostel Overhead Tank", "base_flow": 48.0, "tank_min": 45, "tank_max": 80},
]

def simulate_reading(sensor):
    flow_rate = round(max(0.0, sensor["base_flow"] + random.uniform(-6.0, 6.0)), 2)
    tank_level = round(random.uniform(sensor["tank_min"], sensor["tank_max"]), 1)
    battery_level = round(random.uniform(90.0, 99.5), 1)

    payload = {
        "sensor_id": sensor["id"],
        "location": sensor["location"],
        "flow_rate": flow_rate,
        "tank_level": tank_level,
        "battery_level": battery_level,
    }
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=data_bytes,
        headers={
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status in (200, 201):
                print(f"[{sensor['id']}] Telemetry delivered: Flow={flow_rate}L/m, Tank={tank_level}%, Batt={battery_level}%")
            else:
                print(f"[{sensor['id']}] Response: HTTP {response.status}")
    except urllib.error.HTTPError as e:
        print(f"[{sensor['id']}] HTTP Error {e.code}: {e.read().decode()}")
    except Exception as e:
        print(f"[{sensor['id']}] Network error connecting to {API_URL}: {e}")

def main():
    print("=== AquaFlow IoT Sensor Telemetry Simulator ===")
    print(f"Target API Endpoint: {API_URL}")
    print(f"Simulating {len(SENSORS)} telemetry transmitters. Press Ctrl+C to stop.\n")

    iteration = 0
    while True:
        iteration += 1
        print(f"\n--- Broadcast Cycle #{iteration} ---")
        for s in SENSORS:
            simulate_reading(s)
            time.sleep(0.3)

        if len(sys.argv) > 1 and sys.argv[1] == "--once":
            print("\nSingle test cycle complete.")
            break

        time.sleep(5)

if __name__ == "__main__":
    main()
