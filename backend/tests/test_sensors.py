from app.core.config import settings

def test_sensor_ingestion_and_retrieval(client):
    # Test valid sensor telemetry submission
    payload = {
        "sensor_id": "TEST-SENSOR-01",
        "location": "Pump House A",
        "flow_rate": 35.4,
        "tank_level": 82.5,
        "battery_level": 94.0
    }
    res = client.post(
        "/api/sensors/readings",
        json=payload,
        headers={"X-API-Key": settings.SENSOR_API_KEY}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["sensor_id"] == "TEST-SENSOR-01"
    assert data["flow_rate"] == 35.4

    # Test invalid API key rejected
    bad_res = client.post(
        "/api/sensors/readings",
        json=payload,
        headers={"X-API-Key": "wrong-key"}
    )
    assert bad_res.status_code == 403

    # Test admin retrieval
    a_res = client.post("/api/auth/register", json={
        "name": "Sensor Admin",
        "email": "sensor_admin@waterhub.com",
        "password": "password123",
        "role": "admin"
    })
    admin_token = a_res.json()["access_token"]

    get_res = client.get("/api/sensors/latest", headers={"Authorization": f"Bearer {admin_token}"})
    assert get_res.status_code == 200
    latest = get_res.json()
    assert len(latest) >= 1
