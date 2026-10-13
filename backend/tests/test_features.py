def test_chatbot_inquiry(client):
    r_res = client.post("/api/auth/register", json={
        "name": "Chatbot User",
        "email": "chat_user@waterhub.com",
        "password": "password123",
        "role": "resident"
    })
    token = r_res.json()["access_token"]

    # Ask schedule
    res1 = client.post(
        "/api/chatbot/message",
        json={"message": "When is the next water supply?"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res1.status_code == 200
    assert "Supply" in res1.json()["reply"] or "schedule" in res1.json()["reply"].lower()

    # Ask how to file
    res2 = client.post(
        "/api/chatbot/message",
        json={"message": "How do I file a complaint?"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res2.status_code == 200
    assert "Submit" in res2.json()["reply"]

def test_water_usage_forecast(client):
    r_res = client.post("/api/auth/register", json={
        "name": "Forecast User",
        "email": "forecast_user@waterhub.com",
        "password": "password123",
        "role": "resident"
    })
    token = r_res.json()["access_token"]

    res = client.get("/api/usage/forecast", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "forecast" in data
    assert len(data["forecast"]) == 7
