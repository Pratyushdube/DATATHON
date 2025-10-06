import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware # Import CORS

# --- 1. APP SETUP & MODEL LOADING ---
app = FastAPI(title="QSVM Ransomware Detection API")

# Allow requests from our React frontend (running on localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained QSVM model on startup
model = joblib.load("ransomware_qsvm_model.joblib")

# Define the structure for incoming data (must match model features)
class IoTData(BaseModel):
    cpu_usage: float
    memory_usage: float

# --- 2. PREDICTION & DASHBOARD ENDPOINTS ---
@app.post("/predict")
def predict(data: IoTData):
    features = np.array([[data.cpu_usage, data.memory_usage]])
    prediction = model.predict(features)
    return {"is_threat": bool(prediction[0])}

@app.get("/api/stats")
def get_dashboard_stats():
    return {
        "totalThreats": 1234, "highRiskAlerts": 56,
        "systemsAffected": 789, "incidentsResolved": 1123
    }

@app.get("/api/alerts")
def get_recent_alerts():
    return [
        {"id": "ALERT-001", "system": "auth-service-prod", "severity": "Critical", "timestamp": "2 min ago", "status": "Unresolved"},
        {"id": "ALERT-002", "system": "payment-gateway-v2", "severity": "High", "timestamp": "15 min ago", "status": "Unresolved"},
        {"id": "ALERT-003", "system": "user-database-replica", "severity": "Medium", "timestamp": "1 hr ago", "status": "Resolved"}
    ]

