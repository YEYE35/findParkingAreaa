import React from 'react';

type Props = {
  score?: number;
};

export default function AiScoreBadge({ score }: Props) {
  if (score === undefined) {
    return null;
  }

  const percent = score * 100;
  const label = percent.toFixed(2); 

  return (
    <span className="ai-score-badge">
      AI 추천 {label}%
    </span>
  );
}
