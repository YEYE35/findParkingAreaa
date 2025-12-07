import { UserFeatures, ParkingFeatures, AiRecommendResponse } from './types';

const AI_URL = 'http://127.0.0.1:8000';

export async function fetchAiRecommendations(
  user: UserFeatures,
  parkings: ParkingFeatures[]
): Promise<AiRecommendResponse> {
  console.log('AI_URL >>>', AI_URL);

  const res = await fetch(`${AI_URL}/recommend_list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, parkings }),
  });

  if (!res.ok) {
    throw new Error('AI 추천 API 호출 실패: ' + res.status);
  }

  const data: AiRecommendResponse = await res.json();
  return data;
}

export async function sendFeedback(
  userId: string,
  parkingId: string,
  liked: boolean,
  user: UserFeatures
): Promise<void> {
  const res = await fetch(`${AI_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      parkingId,
      liked,
      user,
    }),
  });

  if (!res.ok) {
    console.error('피드백 전송 실패:', res.status);
  }
}