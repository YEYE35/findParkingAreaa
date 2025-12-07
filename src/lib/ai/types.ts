export interface UserFeatures {
  drivingYears: number;
  ageGroup: number;
  preferCheaper: number;
  preferNear: number;
  preferEasy: number;
}

export interface ParkingFeatures {
  id: string;  
  name: string;
}

export interface AiScoreItem {
  parkingId: string;
  score: number;
}

export interface AiRecommendResponse {
  results: AiScoreItem[];
}
