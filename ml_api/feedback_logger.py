import csv
from pathlib import Path
from .schemas import FeedbackRequest

RAW_LOG_PATH = Path("ml/data/parking_raw_logs.csv")

def append_feedback(req: FeedbackRequest):
    RAW_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "user_id",
        "parking_id",
        "driving_years",
        "age_group",
        "prefer_cheaper",
        "prefer_near",
        "prefer_easy",
        "chosen",
    ]
    chosen = 1 if req.liked else 0
    row = {
        "user_id": req.userId,
        "parking_id": req.parkingId,
        "driving_years": req.user.drivingYears,
        "age_group": req.user.ageGroup,
        "prefer_cheaper": req.user.preferCheaper,
        "prefer_near": req.user.preferNear,
        "prefer_easy": req.user.preferEasy,
        "chosen": chosen,
    }
    write_header = not RAW_LOG_PATH.exists() or RAW_LOG_PATH.stat().st_size == 0
    with RAW_LOG_PATH.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if write_header:
            writer.writeheader()
        writer.writerow(row)