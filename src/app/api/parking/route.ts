import { NextResponse } from 'next/server';
import parkingData from '@/data/parking.json';

const PYTHON_AI_URL =
  process.env.NEXT_PUBLIC_AI_API_URL ?? 'http://localhost:8000';

export async function GET() {
  try {
    console.log('📂 로컬 JSON 파일 데이터를 반환합니다.');
    return NextResponse.json(parkingData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: '파일 읽기 실패' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = body.user;
    const parkings = body.parkings ?? parkingData;
    if (!user) {
      return NextResponse.json(
        { error: 'user 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    const res = await fetch(`${PYTHON_AI_URL}/recommend_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, parkings }),
    });

    if (!res.ok) {
      console.error('AI 서버 에러 상태코드:', res.status);
      return NextResponse.json(
        { error: 'AI 서버에서 추천에 실패했습니다.' },
        { status: 502 }
      );
    }

    const aiResult = await res.json();
    return NextResponse.json(aiResult);
  } catch (error) {
    console.error('AI 추천 POST 처리 중 오류:', error);
    return NextResponse.json(
      { error: '추천 처리 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
