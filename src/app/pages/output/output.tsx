'use client';
import parkingData from '../../data/parking.json';
import { useState } from 'react';
import Icon from "../../../assets/3d.png";
import Search from "../../../assets/search.svg";
import Show from "../../../assets/show.svg";
import './output.css'

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

type OutputProps = {
  keyword: string;
  items: ParkingItem[];
  onBack?: () => void; // 뒤로가기용 (선택)
  onSearch: (keyword: string) => void;
};

export default function Output({ keyword, items, onBack, onSearch }: OutputProps) {
  const [input, setInput] = useState(keyword);
  const filteredItems: ParkingItem[] = items.filter(
    (item) =>
      typeof item.addr === 'string' &&
      item.addr.includes(keyword)
  );
  const handleSearch = () => {
    const q = input.trim();
    if (!q) return;
    onSearch(q);   // ✅ 부모(page.tsx)의 setKeyword 호출
  };

  return(
    <div className='search'>
        <div className='search-top'>
          {onBack && (
            <img src={Icon.src} alt="대표아이콘" style={{ width: "9vw", height: "9vw", inset: "0" }} onClick={onBack}/>
          )}
          <div className='search-top-var'>
            <div className='search-top-var-border'>
                <div className='search-top-var-rec'>
                  <input
                className="search-top-var-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              <button
                className="search-top-var-btn"
                type="button"
                onClick={handleSearch}
              >
               </button> 
                  <div className='search-top-var-right'>
                    <img src={Search.src} alt='검색아이콘' style={{width: "2vw", height: "2vw", inset: "0"}}/>
                  </div>
                </div> 
            </div>
            <div className='search-top-var-textdiv'>
              <div className='search-top-var-textdiv-text'>'{keyword}' (으)로 {filteredItems.length} 개 찾았어요</div>
            </div>
          </div>
        </div>
        <div className='search-bottom'>
          {filteredItems.map((item, index) => (
            <div key={index} className='search-bottom-context'>
                <div className='search-bottom-context-numbertxt'>{index+1} 순위</div>
                <div className='search-bottom-context-right'>
                  <div className='search-bottom-context-right-text'>
                    <div className='search-bottom-context-right-text-name'>{item.pklt_nm || `주차장 #${index + 1}`}</div>
                    <div className='search-bottom-context-right-text-more'>
                      <div className='search-bottom-context-right-text-more-small'>{item.addr || '주소 정보 없음'}</div>
                      <div className='search-bottom-context-right-text-more-small'>{item.telno || '전화번호 정보 없음'}</div>
                    </div>
                  </div>
                  <img src={Show.src} alt='검색아이콘' style={{width: "2vw", height: "2vw", inset: "0"}}/>
                </div>
            </div>
          ))}
        </div>
    </div>
  );
}