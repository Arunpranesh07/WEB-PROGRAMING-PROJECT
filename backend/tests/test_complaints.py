def test_complaint_workflow(client):
    # Register resident & admin
    r_res = client.post("/api/auth/register", json={
        "name": "Flow Resident",
        "email": "flow_resident@waterhub.com",
        "password": "password123",
        "role": "resident"
    })
    resident_token = r_res.json()["access_token"]

    a_res = client.post("/api/auth/register", json={
        "name": "Flow Admin",
        "email": "flow_admin@waterhub.com",
        "password": "password123",
        "role": "admin"
    })
    admin_token = a_res.json()["access_token"]

    # Submit complaint
    c_res = client.post(
        "/api/complaints",
        data={
            "category": "Leakage",
            "description": "Burst pipe on 2nd floor corridor.",
            "location": "Block E - 2nd floor",
            "priority": "High"
        },
        headers={"Authorization": f"Bearer {resident_token}"}
    )
    assert c_res.status_code == 201
    complaint_data = c_res.json()
    assert complaint_data["display_id"].startswith("WCP")
    assert complaint_data["status"] == "Pending"
    complaint_id = complaint_data["complaint_id"]

    # Admin lists complaints
    admin_list = client.get("/api/complaints", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_list.status_code == 200
    assert len(admin_list.json()) >= 1

    # Admin updates status to In Progress
    status_res = client.patch(
        f"/api/complaints/{complaint_id}/status",
        json={"status": "In Progress"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "In Progress"

    # Admin updates priority to Urgent
    prio_res = client.patch(
        f"/api/complaints/{complaint_id}/priority",
        json={"priority": "Urgent"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert prio_res.status_code == 200
    assert prio_res.json()["priority"] == "Urgent"
