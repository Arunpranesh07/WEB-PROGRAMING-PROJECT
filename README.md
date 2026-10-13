# AquaFlow: Smart Community Water Management and Complaint Platform

AquaFlow is a full-stack web application designed for residential apartment communities and college campuses to streamline water distribution management, automate incident reporting, track technician repair workflows, and visualize geospatial leakage hotspots.

---

## 🌟 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Leaflet & React-Leaflet (OpenStreetMap), Lucide Icons
- **Backend**: Python 3.14 / FastAPI, SQLAlchemy, Alembic, Pydantic v2, Uvicorn
- **Database**: PostgreSQL (with `docker-compose.yml`), SQLite default for zero-friction local execution
- **Authentication**: JWT with Bcrypt hashing, role-based access control (`resident`, `admin`)
- **AI & NLP**: scikit-learn (TF-IDF Vectorizer + Logistic Regression, Cosine Similarity Duplicate Matcher, 7-Day Predictive Water Demand Forecaster)
- **IoT Telemetry**: REST API key ingestion with telemetry simulation script

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ (Python 3.14 supported)
- Node.js 18+ and npm
- (Optional) Docker & Docker Compose for PostgreSQL

---

### 1. Backend Setup

1. **Navigate to the backend directory and activate virtual environment**:
   ```bash
   cd backend
   # Windows PowerShell:
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Copy the example `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Seed Database and Train AI Classifier**:
   This seeds the admin, 3 residents, 90 days of water usage, schedules, staff, and trains the scikit-learn model:
   ```bash
   python scripts/seed_data.py
   ```

5. **Start the FastAPI Backend Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API Docs available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   The application will be live at: `http://localhost:5173`

---

### 3. Optional: PostgreSQL with Docker Compose

To run PostgreSQL via Docker:
```bash
docker compose up -d
```
Update `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/water_management
```

---

### 4. Running the IoT Sensor Simulator

To simulate live telemetry from 4 booster pumps and overhead tanks:
```bash
cd backend
.\venv\Scripts\python scripts/simulate_sensors.py
```
View live readings update on the Admin Dashboard under **IoT Flow & Tank Telemetry Monitor**.

---

### 5. Retraining the AI Complaint Classifier

To regenerate the 300+ sample synthetic dataset and retrain the scikit-learn model:
```bash
cd backend
.\venv\Scripts\python scripts/train_model.py
```

---

### 6. Running Automated Tests

Run the backend pytest test suite:
```bash
cd backend
.\venv\Scripts\pytest tests -v
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Pre-configured Data |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@waterhub.com` | `admin123` | Full access to dispatch, staff, telemetry, reports |
| **Resident 1** | `resident1@waterhub.com` | `resident123` | Block A, Terrace Tank leakage complaint |
| **Resident 2** | `resident2@waterhub.com` | `resident123` | Block B, Kitchen water quality complaint |
| **Resident 3** | `resident3@waterhub.com` | `resident123` | Campus Hostel 2, Pressure drop complaint |

---

## 📋 Features Overview

1. **Resident Portal**:
   - Live Water Supply Status & Timetable across blocks
   - Issue reporting with **real-time AI category suggestion**
   - Interactive OpenStreetMap location pin selection
   - Photo attachment with size & format validation
   - Unique tracking ID (`WCP1001` format) with 4-milestone visual progress timeline
   - Community GIS Map with leakage hotspot highlights
   - Floating Smart Assistant chatbot for quick inquiries

2. **Admin Operations**:
   - Priority reassignment and technician dispatching
   - Automatic assignment completion tracking upon ticket resolution
   - Duplicate complaint detection with 1-click **Merge** and **Dismiss**
   - Maintenance staff management with active ticket workload tracking
   - Water supply timetable CRUD with community-wide alert notifications
   - 90-day historical water consumption and 7-day predictive demand forecasting
   - IoT sensor flow rate and tank level live monitoring
