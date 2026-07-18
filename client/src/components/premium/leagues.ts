import React from 'react';

export type LeagueTier =
  | 'bronze' | 'silver' | 'gold' | 'diamond' | 'master' | 'legend';

export interface LeagueInfo {
  tier: LeagueTier;
  label: string;
  shortLabel: string;
  sp: number;
  nextSp: number | null;
  gradient: string;
  glow: string;
  icon: string;
  borderColor: string;
  shieldFrom: string;
  shieldTo: string;
}

export const LEAGUES: LeagueInfo[] = [
  {
    tier: 'bronze',
    label: 'Bronze I',
    shortLabel: 'Bronze',
    sp: 0,
    nextSp: 200,
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #92400e 100%)',
    glow: 'rgba(251, 191, 36, 0.55)',
    icon: '🥉',
    borderColor: 'rgba(251, 191, 36, 0.7)',
    shieldFrom: '#fcd34d',
    shieldTo: '#92400e'
  },
  {
    tier: 'silver',
    label: 'Silver I',
    shortLabel: 'Silver',
    sp: 200,
    nextSp: 400,
    gradient: 'linear-gradient(135deg, #f1f5f9 0%, #475569 100%)',
    glow: 'rgba(203, 213, 225, 0.6)',
    icon: '🥈',
    borderColor: 'rgba(203, 213, 225, 0.7)',
    shieldFrom: '#e2e8f0',
    shieldTo: '#475569'
  },
  {
    tier: 'gold',
    label: 'Gold I',
    shortLabel: 'Gold',
    sp: 400,
    nextSp: 700,
    gradient: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)',
    glow: 'rgba(253, 224, 71, 0.7)',
    icon: '🥇',
    borderColor: 'rgba(253, 224, 71, 0.8)',
    shieldFrom: '#fde047',
    shieldTo: '#d97706'
  },
  {
    tier: 'diamond',
    label: 'Diamond I',
    shortLabel: 'Diamond',
    sp: 700,
    nextSp: 1000,
    gradient: 'linear-gradient(135deg, #cffafe 0%, #06b6d4 100%)',
    glow: 'rgba(34, 211, 238, 0.75)',
    icon: '💎',
    borderColor: 'rgba(34, 211, 238, 0.8)',
    shieldFrom: '#cffafe',
    shieldTo: '#0891b2'
  },
  {
    tier: 'master',
    label: 'Master',
    shortLabel: 'Master',
    sp: 1000,
    nextSp: 1500,
    gradient: 'linear-gradient(135deg, #c4b5fd 0%, #6d28d9 100%)',
    glow: 'rgba(167, 139, 250, 0.75)',
    icon: '🟣',
    borderColor: 'rgba(167, 139, 250, 0.8)',
    shieldFrom: '#c4b5fd',
    shieldTo: '#6d28d9'
  },
  {
    tier: 'legend',
    label: 'Legend',
    shortLabel: 'Legend',
    sp: 1500,
    nextSp: null,
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 35%, #f97316 70%, #a855f7 100%)',
    glow: 'rgba(254, 243, 199, 0.9)',
    icon: '👑',
    borderColor: 'rgba(254, 243, 199, 0.8)',
    shieldFrom: '#fef3c7',
    shieldTo: '#a855f7'
  }
];

export function leagueForSp(sp: number): { current: LeagueInfo; next: LeagueInfo | null } {
  let current = LEAGUES[0];
  for (const l of LEAGUES) {
    if (sp >= l.sp) current = l;
  }
  const idx = LEAGUES.findIndex(l => l.tier === current.tier);
  const next = idx < LEAGUES.length - 1 ? LEAGUES[idx + 1] : null;
  return { current, next };
}

export function leagueProgress(sp: number): { current: LeagueInfo; next: LeagueInfo | null; pct: number; intoNext: number; totalToNext: number } {
  const { current, next } = leagueForSp(sp);
  if (!next) return { current, next: null, pct: 100, intoNext: 0, totalToNext: 0 };
  const totalToNext = next.sp - current.sp;
  const intoNext = Math.max(0, Math.min(totalToNext, sp - current.sp));
  const pct = Math.round((intoNext / totalToNext) * 100);
  return { current, next, pct, intoNext, totalToNext };
}

export function nextMilestoneSp(sp: number): number | null {
  const milestones = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500];
  for (const m of milestones) if (m > sp) return m;
  return null;
}

export function isMilestoneCrossed(prev: number, current: number): number | null {
  const milestones = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500];
  for (const m of milestones) {
    if (prev < m && current >= m) return m;
  }
  return null;
}