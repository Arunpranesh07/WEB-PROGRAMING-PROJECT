def test_ai_classifier_and_duplicates(client):
    # Register resident
    r_res = client.post("/api/auth/register", json={
        "name": "AI Resident",
        "email": "ai_resident@waterhub.com",
        "password": "password123",
        "role": "resident"
    })
    token = r_res.json()["access_token"]

    # Test category classifier
    res = client.post(
        "/api/ai/classify-complaint",
        json={"description": "Massive pipeline burst and heavy water leak flooding hallway"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["suggested_category"] == "Leakage"
    assert data["confidence"] > 0.5

    # Test quality classification
    q_res = client.post(
        "/api/ai/classify-complaint",
        json={"description": "Water coming from tap is muddy brown and has awful sewage smell"}
    )
    assert q_res.status_code == 200
    q_data = q_res.json()
    assert q_data["suggested_category"] == "Water Quality"

    # Test shortage classification
    s_res = client.post(
        "/api/ai/classify-complaint",
        json={"description": "Taps are completely dry and tank has been empty for hours"}
    )
    assert s_res.status_code == 200
    s_data = s_res.json()
    assert s_data["suggested_category"] == "Shortage"
