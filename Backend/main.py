import joblib
import pandas as pd
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pennylane as qml
import random
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import uuid


# --- 1. DEFINE Pydantic MODELS and Quantum Kernel ---

class TrafficLog(BaseModel):
    """Defines the input data structure. MUST match training data columns."""
    # Using float for robustness, even if values are whole numbers.
    duration: float
    # ✅ FIX: Renamed 'protocol_type' to 'proto' to match the trained pipeline's expectation.
    proto: str
    service: str
    conn_state: str
    orig_bytes: float
    resp_bytes: float
    missed_bytes: float
    orig_pkts: float
    orig_ip_bytes: float

    class Config:
        json_schema_extra = {
            "example": {
                "duration": 0.003,
                "proto": "tcp",
                "service": "http",
                "conn_state": "SF",
                "orig_bytes": 0,
                "resp_bytes": 0,
                "missed_bytes": 0,
                "orig_pkts": 1,
                "orig_ip_bytes": 40
            }
        }

class HybridPredictionResponse(BaseModel):
    """Defines the structured output for the hybrid analysis endpoint."""
    verdict: str
    is_anomalous: bool
    anomaly_score: float
    is_known_threat: bool

# We must redefine the quantum functions in the API script
n_qubits = 4
dev = qml.device("default.qubit", wires=n_qubits)

def feature_map(x):
    """This feature map must be identical to the one used for training."""
    qml.templates.AngleEmbedding(x, wires=range(n_qubits))
    # Using a simple entanglement structure for this example
    for i in range(n_qubits - 1):
        qml.CNOT(wires=[i, i + 1])

@qml.qnode(dev)
def kernel_circuit(x1, x2):
    """Quantum circuit to calculate state overlap for the kernel."""
    feature_map(x1)
    qml.adjoint(feature_map)(x2)
    return qml.probs(wires=range(n_qubits))

def quantum_kernel(x1, x2):
    """Computes the kernel value K(x1, x2)."""
    return kernel_circuit(x1, x2)[0]

# --- 2. INITIALIZE FastAPI APP AND LOAD ASSETS ---
app = FastAPI(title="Hybrid Threat Intelligence API")

# --- ADD CORS MIDDLEWARE ---
# This allows the API to be called from web pages hosted on different domains.
# It's crucial for front-end applications that will consume this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for simplicity. For production, you might restrict this to specific domains.
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


model_cache = {}

@app.on_event("startup")
def load_assets():
    """On startup, load and preprocess all necessary assets into a cache."""
    print("Loading all model assets...")
    try:
        # --- Existing Hybrid Model Assets ---
        pipeline = joblib.load("preprocessor_pipelinefinal.joblib")
        x_train_raw = joblib.load("x_train_rawfinal.joblib")

        model_cache["pipeline"] = pipeline
        model_cache["autoencoder"] = tf.keras.models.load_model("autoencoder_modelfinal.keras")
        model_cache["qsvm"] = joblib.load("qsvm_modelfinal.joblib")
        model_cache["anomaly_threshold"] = 0.25

        print("Preprocessing training data for QSVM cache...")
        model_cache["x_train_processed"] = pipeline.transform(x_train_raw)
        
        # --- Existing Anomaly Detector Assets ---
        model_cache["iot_scaler"] = joblib.load("scaler.joblib")
        model_cache["iot_autoencoder"] = tf.keras.models.load_model("autoencoder_model.keras")
        model_cache["iot_anomaly_threshold"] = 0.0762

        # --- NEW: Load sample data for automated analysis ---
        print("Loading sample data for automation...")
        model_cache["sample_traffic_df"] = pd.read_csv("sample_traffic_logs.csv")
        model_cache["sample_iot_df"] = pd.read_csv("sample_iot_data.csv")
        
        print("Assets loaded and processed successfully. ✅")

    except Exception as e:
        print(f"🔴 FATAL: Failed to load model assets. Error: {e}")
        model_cache.clear()



# --- 3. HELPER FUNCTION TO GET CURRENT TIME ---
def get_utc_timestamp():
    """Returns the current time in UTC as a timezone-aware ISO 8601 string."""
    return datetime.now(timezone.utc).isoformat()



# --- 3. DEFINE THE UNIFIED PREDICTION ENDPOINT ---
@app.post("/predict/hybrid-analysis", response_model=HybridPredictionResponse, tags=["Hybrid Analysis"])
async def predict_hybrid(log: TrafficLog):
    """Analyzes a traffic log using both an Autoencoder and a QSVM."""
    if not model_cache:
        raise HTTPException(status_code=503, detail="Model assets are not loaded. Server failed on startup.")

    # STEP 1: PREPROCESS INCOMING DATA
    input_df = pd.DataFrame([log.dict()])
    pipeline = model_cache["pipeline"]
    processed_features = pipeline.transform(input_df)

    # STEP 2: AUTOENCODER ANOMALY DETECTION
    autoencoder = model_cache["autoencoder"]
    reconstructed = autoencoder.predict(processed_features)
    # Using Mean Absolute Error, which often aligns better with 'mae' loss
    error = np.mean(np.abs(processed_features - reconstructed))
    is_anomalous = error > model_cache["anomaly_threshold"]

    # STEP 3: QSVM KNOWN THREAT CLASSIFICATION
    qsvm = model_cache["qsvm"]
    # Retrieve the pre-processed training data from the cache
    x_train_processed = model_cache["x_train_processed"]
    # Calculate the kernel row by comparing the new point to all cached training points
    kernel_row = np.array([[quantum_kernel(processed_features[0], xtp) for xtp in x_train_processed]])
    is_known_threat = qsvm.predict(kernel_row)[0] == 1

    # STEP 4: COMBINE RESULTS FOR A FINAL VERDICT
    verdict = "Normal Traffic"
    if is_anomalous and is_known_threat:
        verdict = "Confirmed Known Threat"
    elif is_anomalous and not is_known_threat:
        verdict = "Unknown Anomaly Detected (Potential Zero-Day)"
    elif not is_anomalous and is_known_threat:
        verdict = "Known Threat Pattern Detected (Low-and-Slow Activity)"

    return {
        "id": f"HYB-{uuid.uuid4().hex[:6].upper()}",
        "verdict": verdict,
        "is_anomalous": bool(is_anomalous),
        "anomaly_score": float(error),
        "time": datetime.now().isoformat(),
        "is_known_threat": bool(is_known_threat)
    }


#########################################################################################




# Load the preprocessing scaler
scaler = joblib.load("scaler.joblib")

# Load the trained autoencoder model
autoencoder = tf.keras.models.load_model("autoencoder_model.keras")

# Set the anomaly threshold (replace with your value from Colab)
ANOMALY_THRESHOLD = 0.0762

# --- 2. DEFINE API DATA MODELS ---

# NOTE: For a real application, replace feature_1, feature_2, etc.,
# with the ACTUAL 32 feature names from your dataset for clarity.
class IoTData(BaseModel):
    feature_1: float
    feature_2: float
    feature_3: float
    feature_4: float
    feature_5: float
    feature_6: float
    feature_7: float
    feature_8: float
    feature_9: float
    feature_10: float
    feature_11: float
    feature_12: float
    feature_13: float
    feature_14: float
    feature_15: float
    feature_16: float
    feature_17: float
    feature_18: float
    feature_19: float
    feature_20: float
    feature_21: float
    feature_22: float
    feature_23: float
    feature_24: float
    feature_25: float
    feature_26: float
    feature_27: float
    feature_28: float
    feature_29: float
    feature_30: float
    feature_31: float
    feature_32: float

    class Config:
        # ✅ UPDATED: Changed schema_extra to json_schema_extra for Pydantic V2
        json_schema_extra = {
            "example": {f"feature_{i+1}": round(np.random.randn(), 4) for i in range(32)}
        }

class PredictionResponse(BaseModel):
    """Defines the structure for the API's prediction response."""
    is_anomaly: bool
    label: str
    reconstruction_error: float = Field(..., example=0.085)
    threshold: float = Field(..., example=ANOMALY_THRESHOLD)


# --- 3. CREATE API ENDPOINTS ---

@app.get("/")
def read_root():
    """A simple health check endpoint to confirm the API is running."""
    return {"status": "online", "model_loaded": True}

@app.post("/predictanomaly", response_model=PredictionResponse)
def predict_anomaly(data: IoTData):
    """
    Receives IoT data, preprocesses it, and vpredicts if it's an anomaly.
    """
    # Convert input data to a NumPy array
    input_data = np.array(list(data.dict().values())).reshape(1, -1)

    # Scale the data using the loaded scaler
    input_data_scaled = scaler.transform(input_data)

    # Get the model's reconstruction
    reconstruction = autoencoder.predict(input_data_scaled)

    # Calculate the reconstruction error (Mean Absolute Error)
    reconstruction_error = tf.keras.losses.mae(input_data_scaled, reconstruction).numpy()[0]

    # Check if the error exceeds the threshold
    is_anomaly = reconstruction_error > ANOMALY_THRESHOLD
    label = "Anomaly Detected" if is_anomaly else "Normal Traffic"

    # Return the structured result
    return {
        "id": f"{uuid.uuid4().hex[:6].upper()}",
        "system": "iot-sensor-gaad",        
        "is_anomaly": bool(is_anomaly),
        "label": label,
        "reconstruction_error": float(reconstruction_error),
        "threshold": ANOMALY_THRESHOLD
    }



# --- 4. NEW AUTOMATED ANALYSIS ENDPOINTS ---

@app.get("/analyze/hybrid-stream", tags=["Automated Analysis"])
async def analyze_hybrid_stream():
    """
    Simulates reading a new traffic log, analyzes it, and returns a formatted alert if it's a threat.
    """
    if not model_cache or "sample_traffic_df" not in model_cache:
        raise HTTPException(status_code=503, detail="Model assets not loaded.")

    # STEP 1: Simulate receiving new data by sampling from the loaded CSV
    sample_log_df = model_cache["sample_traffic_df"].sample(n=1)
    log_data = sample_log_df.to_dict(orient='records')[0]
    
    # Use the TrafficLog model for validation and structure
    log = TrafficLog(**log_data)
    
    # --- This is the same logic as your manual prediction endpoint ---
    input_df = pd.DataFrame([log.dict()])
    processed_features = model_cache["pipeline"].transform(input_df)
    
    autoencoder = model_cache["autoencoder"]
    reconstructed = autoencoder.predict(processed_features)
    error = np.mean(np.abs(processed_features - reconstructed))
    is_anomalous = error > model_cache["anomaly_threshold"]

    qsvm = model_cache["qsvm"]
    x_train_processed = model_cache["x_train_processed"]
    kernel_row = np.array([[quantum_kernel(processed_features[0], xtp) for xtp in x_train_processed]])
    is_known_threat = qsvm.predict(kernel_row)[0] == 1

    verdict = "Normal Traffic"
    if is_anomalous and is_known_threat:
        verdict = "Confirmed Known Threat"
    elif is_anomalous and not is_known_threat:
        verdict = "Unknown Anomaly (Zero-Day)"
    elif not is_anomalous and is_known_threat:
        verdict = "Low-and-Slow Activity"

    # STEP 2: If it's not normal, format it as a high-priority alert
    if verdict != "Normal Traffic":
        severity_map = {
            "Confirmed Known Threat": "Critical",
            "Unknown Anomaly (Zero-Day)": "High",
            "Low-and-Slow Activity": "Medium"
        }
        return [{
            "id": f"{uuid.uuid4().hex[:6].upper()}",
            "system": f"{log.proto}:{log.service}",
            "severity": severity_map.get(verdict),
            "time": get_utc_timestamp(),
            "status": "Logged"
        }]
    
    # Return an empty list if traffic is normal
    return []


@app.get("/analyze/anomaly-stream", tags=["Automated Analysis"])
async def analyze_anomaly_stream():
    """
    Simulates reading new IoT sensor data, analyzes it, and returns a formatted alert if it's an anomaly.
    """
    if not model_cache or "sample_iot_df" not in model_cache:
        raise HTTPException(status_code=503, detail="Model assets not loaded.")

    # STEP 1: Simulate receiving new data by sampling
    sample_iot_df = model_cache["sample_iot_df"].sample(n=1)
    
    # --- Same logic as your manual prediction endpoint ---
    input_data_scaled = model_cache["iot_scaler"].transform(sample_iot_df)
    reconstruction = model_cache["iot_autoencoder"].predict(input_data_scaled)
    reconstruction_error = tf.keras.losses.mae(input_data_scaled, reconstruction).numpy()[0]
    
    is_anomaly = reconstruction_error > model_cache["iot_anomaly_threshold"]

    # STEP 2: If it's an anomaly, create an alert
    if is_anomaly:
        return [{
            "id": f"{uuid.uuid4().hex[:6].upper()}",
            "system": "iot-sensor-grid", # Example system name
            "severity": random.choice(["Low", "Medium", "High", "Critical"]),
            "time": get_utc_timestamp(),
            "status": "Logged"
        }]

    return []
