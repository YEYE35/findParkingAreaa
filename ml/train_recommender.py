import pandas as pd
import numpy as np
from sklearn.svm import SVC
import joblib
from pathlib import Path

DATA_PATH = Path("ml/data/parking_training_data.csv")
MODEL_PATH = Path("ml/models/parking_recommender.joblib")

def main():
    df = pd.read_csv(DATA_PATH)
    parking_cat = df["parking_id"].astype("category")
    df["parking_code"] = parking_cat.cat.codes
    parking_id_to_code = {
        parking_id: int(code)
        for parking_id, code in zip(
            parking_cat.cat.categories,
            range(len(parking_cat.cat.categories)),
        )
    }

    feature_cols = ["parking_code"]
    for col in feature_cols + ["chosen"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna(subset=feature_cols + ["chosen"])
    print("남은 샘플 수:", len(df))
    if len(df) == 0:
        raise RuntimeError("학습에 사용할 샘플이 없습니다.")

    X = df[feature_cols].values
    y = df["chosen"].astype(int).values 
    base_prob = float(np.mean(y)) if len(y) > 0 else 0.5

    unique_labels = np.unique(y)
    if len(unique_labels) < 2:
        print("⚠ 경고: chosen 라벨이 하나뿐입니다. (예: 전부 0)")
        print("   → SVC 대신 base_prob만 사용합니다.")
        model = None
    else:
        model = SVC(probability=True, kernel="rbf")
        model.fit(X, y)
    bundle = {
        "model": model,   
        "feature_cols": feature_cols, 
        "parking_id_to_code": parking_id_to_code,
        "base_prob": base_prob,
    }

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, MODEL_PATH)
    print("✅ 모델 저장 완료:", MODEL_PATH)

if __name__ == "__main__":
    main()
