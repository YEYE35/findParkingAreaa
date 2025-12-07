from pathlib import Path
import joblib

MODEL_BUNDLE_PATH = Path("ml/models/parking_recommender.joblib")
_model_bundle = None

def get_model_bundle():
    global _model_bundle
    if _model_bundle is None:
        _model_bundle = joblib.load(MODEL_BUNDLE_PATH)
    return _model_bundle
