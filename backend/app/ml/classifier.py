import os
import joblib
from typing import Dict, Any

MODEL_PATH = os.path.join(os.path.dirname(__file__), "complaint_classifier.joblib")

_model = None

def get_classifier_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            # If not yet trained, train it lazily
            from app.ml.train_classifier import train_and_save_model
            train_and_save_model()
            _model = joblib.load(MODEL_PATH)
    return _model

def classify_complaint_text(text: str) -> Dict[str, Any]:
    if not text or len(text.strip()) < 3:
        return {
            "suggested_category": "Leakage",
            "confidence": 0.33,
            "probabilities": {"Leakage": 0.33, "Shortage": 0.33, "Water Quality": 0.33}
        }

    model = get_classifier_model()
    probs = model.predict_proba([text])[0]
    classes = model.classes_

    prob_dict = {classes[i]: round(float(probs[i]), 4) for i in range(len(classes))}
    best_category = max(prob_dict, key=prob_dict.get)
    best_confidence = prob_dict[best_category]

    return {
        "suggested_category": best_category,
        "confidence": best_confidence,
        "probabilities": prob_dict
    }
