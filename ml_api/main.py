from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import csv
from collections import defaultdict
from .schemas import RecommendRequest, RecommendResponse, ParkingScore, FeedbackRequest
from .model_loader import get_model_bundle
from .utils import user_parking_to_vector
from .feedback_logger import append_feedback
import numpy as np
import math

app = FastAPI(title="Parking Recommender API")
RAW_LOG_PATH = Path("ml/data/parking_raw_logs.csv")


def load_feedback_stats():
  stats = defaultdict(lambda: {"like": 0, "dislike": 0})
  if not RAW_LOG_PATH.exists():
    return stats
  with RAW_LOG_PATH.open("r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
      pid = row.get("parking_id")
      if not pid:
        continue
      try:
        chosen = int(row.get("chosen", "0"))
      except ValueError:
        continue
      if chosen == 1:
        stats[pid]["like"] += 1
      else:
        stats[pid]["dislike"] += 1

  return stats

def apply_feedback_to_scores(
    base_results: list[ParkingScore],
    feedback_stats,
    alpha: float = 0.5, 
) -> list[ParkingScore]:
    adjusted: list[ParkingScore] = []

    for r in base_results:
        pid = r.parkingId
        base = float(r.score)
        stat = feedback_stats.get(pid)

        if not stat:
            base_rounded = round(base, 6)
            print(f"[NO_FB]  pid={pid}  base={base_rounded:.6f}  final={base_rounded:.6f}")
            adjusted.append(
                ParkingScore(
                    parkingId=pid,
                    score=base_rounded,
                )
            )
            continue

        like = stat["like"]
        dislike = stat["dislike"]
        total = like + dislike

        if total == 0:
            base_rounded = round(base, 6)
            print(f"[ZERO_FB] pid={pid}  base={base_rounded:.6f}  final={base_rounded:.6f}")
            adjusted.append(
                ParkingScore(
                    parkingId=pid,
                    score=base_rounded,
                )
            )
            continue

        fb_raw = (like - dislike) / total
        fb_score = (fb_raw + 1.0) / 2.0
        final_score = (1 - alpha) * base + alpha * fb_score
        base_rounded = round(base, 6)
        fb_raw_rounded = round(fb_raw, 6)
        fb_score_rounded = round(fb_score, 6)
        final_rounded = round(final_score, 6)
        print(
            f"[FB]     pid={pid}  base={base_rounded:.6f}  "
            f"like={like}  dislike={dislike}  total={total}  "
            f"fb_raw={fb_raw_rounded:.6f}  fb_score={fb_score_rounded:.6f}  "
            f"final={final_rounded:.6f}"
        )

        adjusted.append(
            ParkingScore(
                parkingId=pid,
                score=final_rounded,
            )
        )

    return adjusted

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/recommend_list", response_model=RecommendResponse)
def recommend_list(req: RecommendRequest):
    bundle = get_model_bundle()
    model = bundle.get("model")
    base_prob = float(bundle.get("base_prob", 0.5))
    parkings = req.parkings
    if not parkings:
        return RecommendResponse(results=[])

    X = [user_parking_to_vector(req.user, p) for p in parkings]

    if model is None:
        probs = np.full(len(X), base_prob)
    else:
        probs = model.predict_proba(X)[:, 1]

    base_results = [
        ParkingScore(parkingId=p.id, score=float(prob))
        for p, prob in zip(parkings, probs)
    ]

    feedback_stats = load_feedback_stats()
    print("📊 feedback_stats:", feedback_stats) 

    adjusted_results = apply_feedback_to_scores(
        base_results,
        feedback_stats,
        alpha=0.5,
    )

    adjusted_results.sort(key=lambda r: r.score, reverse=True)
    return RecommendResponse(results=adjusted_results)

@app.post("/feedback")
def log_feedback(req: FeedbackRequest):
    append_feedback(req)
    return {"ok": True}