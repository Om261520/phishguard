import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ThreatVerdict } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (e) {
    return isoString;
  }
}

export function getVerdictTheme(verdict: ThreatVerdict | string) {
  switch (verdict?.toUpperCase()) {
    case 'SAFE':
      return {
        bg: 'bg-emerald-950/40',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        glow: 'cyber-glow-emerald',
        hex: '#10b981',
      };
    case 'SUSPICIOUS':
      return {
        bg: 'bg-amber-950/40',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        glow: 'cyber-glow-amber',
        hex: '#f59e0b',
      };
    case 'PHISHING':
    case 'MALICIOUS':
      return {
        bg: 'bg-rose-950/40',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        glow: 'cyber-glow-rose',
        hex: '#f43f5e',
      };
    default:
      return {
        bg: 'bg-slate-900',
        border: 'border-slate-700',
        text: 'text-slate-400',
        badge: 'bg-slate-800 text-slate-300 border-slate-700',
        glow: '',
        hex: '#94a3b8',
      };
  }
}

export function getSeverityBadge(severity: string) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-red-500/15 text-red-400 border border-red-500/30';
    case 'HIGH':
      return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
    case 'MEDIUM':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'LOW':
    default:
      return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
  }
}
