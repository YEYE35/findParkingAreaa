import { NextResponse } from 'next/server';
// 👇 1. 다운받은 json 파일을 직접 가져옵니다.
import parkingData from '@/data/parking.json'; 

export async function GET() {
  try {
    // 2. 네트워크 요청 없이 가져온 파일 내용을 바로 응답으로 줍니다.
    console.log('📂 로컬 JSON 파일 데이터를 반환합니다.');
    
    return NextResponse.json(parkingData);

  } catch (error) {
    return NextResponse.json(
      { error: '파일 읽기 실패' },
      { status: 500 }
    );
  }
}