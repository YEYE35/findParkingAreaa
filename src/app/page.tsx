'use client';
import parkingData from '../data/parking.json';
import { useState } from 'react';
import Start from './pages/start/start';
import Output from './pages/output/output';

interface ParkingItem {
  lnmadr?: string;
  rdnmadr?: string;
  institutionNm?: string;
  phoneNumber?: string;
  referenceDate?: string;
  prkplceNm?: string;
  pklt_nm?: string;
  telno?: string;
  addr?: string;
  last_data_sync_tm?: string;
  [key: string]: any;
}

function extractParkingItems(raw: any): ParkingItem[] {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.response?.body?.items)) return raw.response.body.items;
  if (Array.isArray(raw?.response?.body?.items?.item)) return raw.response.body.items.item;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.records)) return raw.records;
  if (Array.isArray(raw?.GetParkInfo?.row)) return raw.GetParkInfo.row;

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

export default function Home() {
  const [keyword, setKeyword] = useState<string | null>(null);
  const data: any = parkingData;
  const items: ParkingItem[] = extractParkingItems(data);

  if (keyword === null) {
    return (
      <Start
        onStart={(q) => {
          setKeyword(q); 
        }}
      />
    );
  }
  return (
    <Output
      keyword={keyword}
      items={items}
      onBack={() => setKeyword(null)}
      onSearch={(q) => setKeyword(q)}   
    />
  );
}
