import joblib
import numpy as np
import tensorflow as tf
from fastapi import FastAPI
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware # Import CORS

# --- 1. INITIALIZE APP & LOAD MODELS ---

app = FastAPI(
    title="IoT Anomaly Detection API",
    description="Uses a trained autoencoder to detect anomalies in IoT traffic data.",
    version="1.0.0"
)


# Allow requests from our React frontend (running on localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    Receives IoT data, preprocesses it, and predicts if it's an anomaly.
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
        "is_anomaly": bool(is_anomaly),
        "label": label,
        "reconstruction_error": float(reconstruction_error),
        "threshold": ANOMALY_THRESHOLD
    }

