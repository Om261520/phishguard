import React from 'react';
import { ThreatVerdict } from '../types';
import { getVerdictTheme, cn } from '../utils/formatters';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  verdict: ThreatVerdict | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ verdict, size = 'md', className }) => {
  const theme = getVerdictTheme(verdict);
  
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2 font-bold tracking-wide',
  }[size];

  const getIcon = () => {
    switch (verdict?.toUpperCase()) {
      case 'SAFE':
        return <ShieldCheck className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'SUSPICIOUS':
        return <AlertTriangle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'PHISHING':
      case 'MALICIOUS':
        return <ShieldAlert className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-wider transition-all shadow-sm',
        theme.badge,
        sizeClasses,
        className
      )}
    >
      {getIcon()}
      {verdict}
    </span>
  );
};
