import pandas as pd
from pathlib import Path

RAW_PATH = Path("ml/data/parking_raw_logs.csv")
TRAIN_PATH = Path("ml/data/parking_training_data.csv")

def main():
    df = pd.read_csv(RAW_PATH)

    TRAIN_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(TRAIN_PATH, index=False)
    print(f"✅ training_data 저장 완료: {TRAIN_PATH}")

if __name__ == "__main__":
    main()


