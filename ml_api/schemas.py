from pydantic import BaseModel
from typing import List

class UserFeatures(BaseModel):
    drivingYears: int
    ageGroup: int
    preferCheaper: int
    preferNear: int
    preferEasy: int

class ParkingFeatures(BaseModel):
    id: str
    name: str

class RecommendRequest(BaseModel):
    user: UserFeatures
    parkings: List[ParkingFeatures]

class ParkingScore(BaseModel):
    parkingId: str
    score: float

class RecommendResponse(BaseModel):
    results: List[ParkingScore]

class FeedbackRequest(BaseModel):
  userId: str     
  parkingId: str    
  liked: bool           
  user: UserFeatures   