'use client';
import React from 'react';
import './AiRecommendToggle.css';

type Props = {
  useAi: boolean;
  onToggle: (value: boolean) => void;
};

export default function AiRecommendToggle({ useAi, onToggle }: Props) {
  return (
    <button
      type="button"
      className={`ai-toggle ${useAi ? 'ai-on' : 'ai-off'}`}
      onClick={() => onToggle(!useAi)}
    >
      {useAi ? 'AI 추천 정렬' : '기본 정렬'}
    </button>
  );
}
