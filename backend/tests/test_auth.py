def test_register_and_login(client):
    # Register resident
    res = client.post("/api/auth/register", json={
        "name": "Test Resident",
        "email": "test_resident@waterhub.com",
        "password": "password123",
        "role": "resident",
        "phone": "9998887770",
        "address": "Block D 101"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "resident"

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": "test_resident@waterhub.com",
        "password": "password123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None

    # Get Me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "test_resident@waterhub.com"

def test_login_invalid_credentials(client):
    res = client.post("/api/auth/login", json={
        "email": "nonexistent@waterhub.com",
        "password": "wrongpassword"
    })
    assert res.status_code == 401
