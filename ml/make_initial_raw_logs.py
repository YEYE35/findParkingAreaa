import json
import csv
from pathlib import Path

CANDIDATE_PATHS = [
    Path("src/data/parking.json"),
    Path("data/parking.json"),
]

PARKING_JSON_PATH = None
for p in CANDIDATE_PATHS:
    if p.exists():
        PARKING_JSON_PATH = p
        break

if PARKING_JSON_PATH is None:
    raise FileNotFoundError(
        "parking.json을 찾을 수 없습니다. "
        "다음 위치 중 한 곳에 있어야 합니다: src/data/parking.json 또는 data/parking.json"
    )

RAW_LOG_PATH = Path("ml/data/parking_raw_logs.csv")

def main():
    print(f"▶ parking.json 경로: {PARKING_JSON_PATH}")

    with open(PARKING_JSON_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)
    if isinstance(raw, dict) and "DATA" in raw:
        parkings = raw["DATA"]
    elif isinstance(raw, list):
        parkings = raw
    else:
        raise ValueError(
            f"parking.json 구조를 이해할 수 없습니다. "
            f"dict이고 'DATA' 키가 있거나, 최상단이 list여야 합니다. 현재 타입: {type(raw)}"
        )

    RAW_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)

    with open(RAW_LOG_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "user_id",
                "parking_id",
                "driving_years",
                "age_group",
                "prefer_cheaper",
                "prefer_near",
                "prefer_easy",
                "chosen",
            ]
        )

        for item in parkings:
            if not isinstance(item, dict):
                continue
            parking_name = (
                item.get("pklt_nm")
                or item.get("prkplceNm")
                or item.get("institutionNm")
                or "UnknownParking"
            )
            user_id = "u_init" 
            driving_years = 0    
            age_group = 20         
            prefer_cheaper = 1     
            prefer_near = 1       
            prefer_easy = 1    
            chosen = 0
            writer.writerow(
                [
                    user_id,
                    parking_name,
                    driving_years,
                    age_group,
                    prefer_cheaper,
                    prefer_near,
                    prefer_easy,
                    chosen,
                ]
            )
    print(f"✅ parking_raw_logs.csv 생성 완료: {RAW_LOG_PATH}")

if __name__ == "__main__":
    main()
