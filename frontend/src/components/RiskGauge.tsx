import React from 'react';
import { ThreatVerdict } from '../types';
import { getVerdictTheme } from '../utils/formatters';

interface RiskGaugeProps {
  score: number;
  classification: ThreatVerdict | string;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, classification, size = 180 }) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc for speedometer feel
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(Math.max(score, 0), 100)) / 100;

  const theme = getVerdictTheme(classification);

  const getScoreColor = (val: number) => {
    if (val < 30) return '#10b981'; // Emerald
    if (val < 60) return '#f59e0b'; // Amber
    if (val < 80) return '#f97316'; // Orange
    return '#f43f5e'; // Crimson Rose
  };

  const currentColor = getScoreColor(score);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-135">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          fill="none"
        />
        {/* Active gauge bar */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={currentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${currentColor}80)`,
          }}
        />
      </svg>
      
      {/* Centered Score Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2">
        <span className="text-4xl font-extrabold tracking-tight" style={{ color: currentColor }}>
          {score}
        </span>
        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
          Risk Index
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          0 – 100
        </span>
      </div>
    </div>
  );
};
