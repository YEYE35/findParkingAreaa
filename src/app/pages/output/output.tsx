'use client';
import { useEffect, useState, useCallback,useMemo,useRef } from 'react';
import { fetchAiRecommendations, sendFeedback } from '@/lib/ai/client';
import {UserFeatures,ParkingFeatures,AiScoreItem,} from '@/lib/ai/types';
import AiRecommendToggle from '@/components/AiRecommendToggle';
import AiScoreBadge from '@/components/AiScoreBadge';
import { mapRawParkingToFeatures, getParkingIdFromRaw } from '@/lib/ai/featureMapper';

import Search from '../../../assets/search.svg';
import Good from '../../../assets/good.svg';
import Bad from '../../../assets/bad.svg';
import GoodActive from '../../../assets/goodActive.svg';
import BadActive from '../../../assets/badActive.svg';
import './output.css';

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
  onBack?: () => void;
  onSearch: (keyword: string) => void;
};
const dummyUser: UserFeatures = {
  drivingYears: 1,
  ageGroup: 20,
  preferCheaper: 1,
  preferNear: 1,
  preferEasy: 0,
};
const DUMMY_USER_ID = 'web_user_1';
const FEEDBACK_STORAGE_KEY = 'parking_feedback_v1';
const USE_AI_STORAGE_KEY = 'parking_use_ai_v1';

export default function Output({keyword,items,onBack,onSearch,}: OutputProps) {
  const [input, setInput] = useState(keyword);
  const [useAi, setUseAi] = useState(false);
  const [aiScores, setAiScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>({});
  const likeTimersRef = useRef<{ [id: string]: number }>({});
  const dislikeTimersRef = useRef<{ [id: string]: number }>({});

  const handleLike = async (id: string) => {
    setFeedback((prev) => ({...prev, [id]: 'up',}));
    const prevTimer = likeTimersRef.current[id];
    if (prevTimer) {clearTimeout(prevTimer);}

    likeTimersRef.current[id] = window.setTimeout(() => {
      setFeedback((prev) => ({...prev, [id]: null,}));
      delete likeTimersRef.current[id];
    }, 1000);

    try {
      await sendFeedback(DUMMY_USER_ID, id, true, dummyUser);
      await fetchAiScores();
    } catch (e) {
      console.error('like feedback 전송 실패:', e);
    }
  };
  const handleDislike = async (id: string) => {
    setFeedback((prev) => ({...prev, [id]: 'down',}));
    const prevTimer = dislikeTimersRef.current[id];
    if (prevTimer) {
      clearTimeout(prevTimer);
    }

    dislikeTimersRef.current[id] = window.setTimeout(() => {
      setFeedback((prev) => ({...prev,[id]: null,}));
      delete dislikeTimersRef.current[id];
    }, 1000);

    try {
      await sendFeedback(DUMMY_USER_ID, id, false, dummyUser);
      await fetchAiScores();
    } catch (e) {
      console.error('dislike feedback 전송 실패:', e);
    }
  };
  const handleToggleAi = (next: boolean) => {
    setUseAi(next);
    if (!next) {setAiScores({});}
  };
  const filteredItems: ParkingItem[] = useMemo(() => {
    const seen = new Set<string>();
    const result: ParkingItem[] = [];

    for (const item of items) {
      if (typeof item.addr !== 'string') continue;
      if (!item.addr.includes(keyword)) continue;
      const id = getParkingIdFromRaw(item);
      if (seen.has(id)) continue;
      seen.add(id);
      result.push(item);
    }
    return result;
  }, [items, keyword]);
  const fetchAiScores = useCallback(async () => {
    if (!useAi) return;
    if (filteredItems.length === 0) {
      setAiScores({});
      return;
    }

    try {
      const parkingsForAi: ParkingFeatures[] = filteredItems.map((item) =>
        mapRawParkingToFeatures(item)
      );
      const res = await fetchAiRecommendations(dummyUser, parkingsForAi);
      const map: Record<string, number> = {};
      res.results.forEach((item: AiScoreItem) => {
        map[item.parkingId] = item.score;
      });
      setAiScores(map);
    } catch (err) {
      console.error('AI 추천 호출 실패:', err);
    }
  }, [useAi, filteredItems]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedFb = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (savedFb) {
        const parsed = JSON.parse(savedFb);
        if (parsed && typeof parsed === 'object') {
          setFeedback(parsed);
        }
      }
      const savedUseAi = window.localStorage.getItem(USE_AI_STORAGE_KEY);
      if (savedUseAi !== null) {
        setUseAi(savedUseAi === '1');
      }
    } catch (e) {
      console.error('피드백/AI 상태 불러오기 실패:', e);
    }
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        FEEDBACK_STORAGE_KEY,
        JSON.stringify(feedback)
      );
    } catch (e) {
      console.error('피드백 저장 실패:', e);
    }
  }, [feedback]);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(
        USE_AI_STORAGE_KEY,
        useAi ? '1' : '0'
      );
    } catch (e) {
      console.error('AI 토글 저장 실패:', e);
    }
  }, [useAi]);
  useEffect(() => {fetchAiScores();}, [fetchAiScores]);

  const sortedItems: ParkingItem[] = useAi
  ? [...filteredItems].sort((a, b) => {
      const idA = getParkingIdFromRaw(a);
      const idB = getParkingIdFromRaw(b);
      const scoreA = aiScores[idA] ?? 0;
      const scoreB = aiScores[idB] ?? 0;
      return scoreB - scoreA;
    })
  : filteredItems;
  const handleSearch = () => {
    const q = input.trim();
    if (!q) return;
    onSearch(q);
  };

  return (
    <div className="search">
      <div className="search-top">
        {onBack && (
          <video
          src="/icon.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="my-video"
          style={{ width: "10vw", height: "10vw", cursor:"pointer" }}
          onClick={onBack}
        />
        )}
        <div className="search-top-var">
          <div className="search-top-var-border">
            <div className="search-top-var-rec">
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
              ></button>
              <div className="search-top-var-right">
                <img
                  src={Search.src}
                  alt="검색아이콘"
                  style={{ width: '2vw', height: '2vw', inset: '0' }}
                />
              </div>
            </div>
          </div>
          <div className="search-top-var-textdiv">
            <div className="search-top-var-textdiv-text">
              '{keyword}' (으)로 {filteredItems.length} 개 찾았어요
            </div>
            <AiRecommendToggle useAi={useAi} onToggle={handleToggleAi} />
          </div>
        </div>
      </div>
      <div className="search-bottom">
        {sortedItems.map((item, index) => {
          const id = getParkingIdFromRaw(item);
          const feedbackState = feedback[id] ?? null;
          const displayScore = aiScores[id] ?? 0;
          return (
            <div key={id + index} className="search-bottom-context">
              <div className="search-bottom-context-numbertxt">
                {index + 1} 순위
              </div>
              <div className="search-bottom-context-right">
                <div className="search-bottom-context-right-text">
                  <div className="search-bottom-context-right-text-name">
                    {item.pklt_nm || `주차장 #${index + 1}`}
                  </div>
                  <div className="search-bottom-context-right-text-more">
                    <div className="search-bottom-context-right-text-more-small">
                      {item.addr || '주소 정보 없음'}
                    </div>
                    <div className="search-bottom-context-right-text-more-small">
                      {item.telno || '전화번호 정보 없음'}
                    </div>
                    <div className="ai-txt">
                      <AiScoreBadge score={useAi ? displayScore : undefined} />
                    </div>
                  </div>
                </div>
                <div className="choice">
                  <img
                    src={feedbackState === 'up' ? GoodActive.src : Good.src}
                    alt="추천"
                    className={`icon-button like-icon-btn ${
                      feedbackState === 'up' ? 'active' : ''
                    }`}
                    onClick={() => handleLike(id)}
                    style={{ width: '3vw', height: '3vw', inset: '0' }}
                  />
                  <img
                    src={feedbackState === 'down' ? BadActive.src : Bad.src}
                    alt="비추천"
                    className={`icon-button dislike-icon-btn ${
                      feedbackState === 'down' ? 'active' : ''
                    }`}
                    onClick={() => handleDislike(id)}
                    style={{ width: '3vw', height: '3vw', inset: '0' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}