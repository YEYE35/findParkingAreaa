// src/app/page.tsx
'use client';
// 로컬 JSON 파일 직접 import (경로: src/data/parking.json)
import parkingData from '../data/parking.json';
import { useState } from 'react';
import Start from './pages/start/start';

// 공공데이터포탈 주차장 데이터 타입 정의
interface ParkingItem {
  // 예전에 쓰던 필드들 (혹시 다른 JSON 쓸 때를 대비해서 남겨둠)
  lnmadr?: string;            // 지번주소
  rdnmadr?: string;           // 도로명주소
  institutionNm?: string;     // 관리기관명
  phoneNumber?: string;       // 전화번호
  referenceDate?: string;     // 데이터기준일자
  prkplceNm?: string;         // 주차장명(다른 포맷일 때)

  // 지금 parking.json 에 실제로 존재하는 필드들
  pklt_nm?: string;           // 주차장 이름
  telno?: string;             // 전화번호
  addr?: string;              // 주소
  last_data_sync_tm?: string; // 최종 동기화 시각

  [key: string]: any;         // 그 외 모든 필드 허용
}

function extractParkingItems(raw: any): ParkingItem[] {
  // 1) 대표적인 패턴들 먼저 체크
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.response?.body?.items)) return raw.response.body.items;
  if (Array.isArray(raw?.response?.body?.items?.item)) return raw.response.body.items.item;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.records)) return raw.records;
  if (Array.isArray(raw?.GetParkInfo?.row)) return raw.GetParkInfo.row;

  // 2) 그래도 못 찾으면, 객체 안을 깊게 뒤지면서
  //    "객체로 이루어진 배열"을 처음 하나 찾아옴
  const visited = new Set<any>();

  function dfs(node: any): ParkingItem[] {
    if (!node || typeof node !== 'object' || visited.has(node)) return [];
    visited.add(node);

    if (Array.isArray(node) && node.length > 0 && typeof node[0] === 'object') {
      return node as ParkingItem[];
    }

    for (const value of Object.values(node)) {
      const found = dfs(value);
      if (found.length > 0) return found;
    }

    return [];
  }

  return dfs(raw);
}

// ⬇ 더 이상 async / fetch 필요 없음
export default function Home() {
  const [started, setStarted] = useState(false);
  if (!started) return <Start onStart={() => setStarted(true)} />;
  // import 해온 원본 데이터
  const data: any = parkingData;
  const items: ParkingItem[] = extractParkingItems(data);

  // 🔎 조건 필터: 주소에 '도봉구'가 들어간 데이터만 사용
  const filteredItems: ParkingItem[] = items.filter(
    (item) => typeof item.addr === 'string' && item.addr.includes('도봉구')
  );

  return (
    <main className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🅿️ 주차 금지/허용 구역 조회</h1>
        <p className="text-gray-600">
          로컬 파일(parking.json)에서 불러온 데이터 중, <b>주소에 &quot;도봉구&quot;가 포함된 항목</b>만 표시합니다.
        </p>
      </div>

      {/* 데이터 상태 카드 */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border mb-6">
        <span className="font-medium text-gray-700">
          데이터 상태: <span className="text-green-600">정상 ✅</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded">
            전체 {items.length}개
          </span>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            도봉구 필터: {filteredItems.length}개
          </span>
        </span>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-5">
                {/* ✅ 주차장 이름: pklt_nm 사용 */}
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                  {item.pklt_nm || item.institutionNm || item.prkplceNm || `구역 #${index + 1}`}
                </h3>

                {/* ✅ 전화번호: telno 사용 */}
                <p className="text-sm text-blue-600 font-medium mb-4">
                  {item.telno || item.phoneNumber || '전화번호 없음'}
                </p>

                {/* ✅ 주소: addr 사용 */}
                <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <span className="shrink-0">📍</span>
                    <span className="break-keep">
                      {item.addr || item.rdnmadr || item.lnmadr || '주소 정보 없음'}
                    </span>
                  </div>

                  {/* ✅ 기준일/동기화 시간: last_data_sync_tm 사용 */}
                  {(item.last_data_sync_tm || item.referenceDate) && (
                    <div className="flex gap-2 text-xs text-gray-400 pt-1">
                      <span>📅</span>
                      <span>기준일: {item.last_data_sync_tm || item.referenceDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 카드 하단 상세 JSON */}
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
          <p className="text-sm text-gray-400 mt-1">
            주소에 &quot;도봉구&quot;가 포함된 데이터가 있는지, JSON 파일 내용을 확인해보세요.
          </p>
        </div>
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
