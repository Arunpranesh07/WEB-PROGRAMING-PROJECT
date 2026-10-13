def test_staff_assignment_and_resolution(client):
    # Admin login / register
    a_res = client.post("/api/auth/register", json={
        "name": "Staff Admin",
        "email": "staff_admin@waterhub.com",
        "password": "password123",
        "role": "admin"
    })
    admin_token = a_res.json()["access_token"]

    # Create Staff
    s_res = client.post(
        "/api/staff",
        json={
            "staff_name": "Vijay Tech",
            "phone": "9887766554",
            "specialization": "Plumbing"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert s_res.status_code == 201
    staff_id = s_res.json()["staff_id"]

    # Create Complaint
    c_res = client.post(
        "/api/complaints",
        data={
            "category": "Shortage",
            "description": "Pressure drop in pump line",
            "location": "Wing C"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    complaint_id = c_res.json()["complaint_id"]

    # Assign staff
    assign_res = client.post(
        f"/api/complaints/{complaint_id}/assign",
        json={"staff_id": staff_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert assign_res.status_code == 200
    complaint_assigned = assign_res.json()
    assert complaint_assigned["status"] == "In Progress"
    assert len(complaint_assigned["assignments"]) == 1
    assert complaint_assigned["assignments"][0]["completed_at"] is None

    # Resolve complaint
    resolve_res = client.patch(
        f"/api/complaints/{complaint_id}/status",
        json={"status": "Resolved"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resolve_res.status_code == 200
    complaint_resolved = resolve_res.json()
    assert complaint_resolved["status"] == "Resolved"
    assert complaint_resolved["assignments"][0]["completed_at"] is not None
