import { headers } from 'next/headers';

// 공공데이터포탈 주차금지구역 표준 데이터 타입 정의 (예상)
interface ParkingItem {
  lnmadr?: string;         // 지번주소
  rdnmadr?: string;        // 도로명주소
  institutionNm?: string;  // 관리기관명
  phoneNumber?: string;    // 전화번호
  referenceDate?: string;  // 데이터기준일자
  prkplceNm?: string;      // (주차장 데이터일 경우) 주차장명
  [key: string]: any;      // 그 외 모든 필드 허용
}

async function getParkingData() {
  // Next.js 서버 컴포넌트에서 로컬 API를 호출할 때는 전체 URL이 필요합니다.
  // 💡 팁: 실제 배포 시에는 API 호출 대신 `import data from '@/data/parking.json'` 하는 게 더 빠릅니다.
  // 하지만 지금은 API 라우트 테스트를 위해 fetch를 유지합니다.
  const res = await fetch('http://localhost:3000/api/parking', {
    cache: 'no-store', // 매번 최신 데이터 조회
  });

  if (!res.ok) {
    throw new Error(`데이터 로드 실패: ${res.status}`);
  }

  return res.json();
}

export default async function Home() {
  let data;
  let items: ParkingItem[] = [];
  let errorMsg = null;

  try {
    data = await getParkingData();

    // 📌 JSON 구조에 따라 배열 위치 찾기 (공공데이터 포맷 대응)
    if (Array.isArray(data)) {
      items = data;
    } else if (Array.isArray(data?.response?.body?.items)) {
      items = data.response.body.items; // 일반적인 공공데이터 구조
    } else if (Array.isArray(data?.data)) {
      items = data.data; // 서울시 등 기타 구조
    } else if (data?.GetParkInfo?.row) {
      items = data.GetParkInfo.row; // 서울시 구조
    }
    
  } catch (err) {
    errorMsg = String(err);
  }

  return (
    <main className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🅿️ 주차 금지/허용 구역 조회</h1>
        <p className="text-gray-600">로컬 파일(parking.json)에서 불러온 데이터입니다.</p>
      </div>

      {/* 🔴 에러 발생 시 */}
      {errorMsg && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
          <p className="font-bold">데이터를 불러오지 못했습니다</p>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* 🔵 데이터 정상 로드 시 */}
      {!errorMsg && (
        <>
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border mb-6">
            <span className="font-medium text-gray-700">
              데이터 상태: <span className="text-green-600">정상 ✅</span>
            </span>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              총 {items.length}개 항목
            </span>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                      {item.institutionNm || item.prkplceNm || `구역 #${index + 1}`}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium mb-4">
                      {item.phoneNumber || '전화번호 없음'}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <div className="flex gap-2">
                        <span className="shrink-0">📍</span>
                        <span className="break-keep">{item.rdnmadr || item.lnmadr || '주소 정보 없음'}</span>
                      </div>
                      {item.referenceDate && (
                        <div className="flex gap-2 text-xs text-gray-400 pt-1">
                          <span>📅</span>
                          <span>기준일: {item.referenceDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 카드 하단 상세 JSON (너무 길면 숨김) */}
                  <details className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                    <summary className="cursor-pointer hover:text-gray-800 select-none">
                      전체 데이터 보기
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap break-all">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-xl text-gray-400 font-medium">표시할 데이터가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">JSON 파일 구조를 확인해보세요.</p>
            </div>
          )}
        </>
      )}

      {/* 🛠 디버깅용 전체 JSON 확인 */}
      <div className="mt-12 border-t pt-8">
        <details>
          <summary className="cursor-pointer inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 bg-gray-200 px-3 py-2 rounded-md transition-colors">
            🔍 원본 JSON 전체 보기 (개발자용)
          </summary>
          <div className="mt-4 p-4 bg-slate-900 rounded-lg overflow-hidden shadow-xl">
            <pre className="text-xs text-green-400 overflow-auto max-h-[500px] font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </main>
  );
}