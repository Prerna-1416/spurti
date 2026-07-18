const KEY_PREFIX = 'spurti_gamify_';

export interface GamificationState {
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null;
  pollCompletedDates: string[];
  skipTokens: {
    monthKey: string;
    used: number;
    history: Array<{ monthKey: string; used: number }>;
  };
  badgeUnlocks: Record<string, {
    unlockedAt: string | null;
    seenAt: string | null;
    simulatedRank: number | null;
  }>;
}

export const POLL_STREAK_BREAKER_AT_HOUR = 24;
export const SKIP_TOKENS_PER_MONTH = 3;
export const LIMITED_BADGE_THRESHOLD = 20;

export function getStorageKey(email: string): string {
  return KEY_PREFIX + (email || 'anon').toLowerCase();
}

function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function monthKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 7);
}

function emptyState(): GamificationState {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastStreakDate: null,
    pollCompletedDates: [],
    skipTokens: { monthKey: monthKey(), used: 0, history: [] },
    badgeUnlocks: {}
  };
}

export function loadState(email: string): GamificationState {
  if (typeof window === 'undefined') return emptyState();
  try {
    const raw = window.localStorage.getItem(getStorageKey(email));
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<GamificationState>;
    const base = emptyState();
    const merged: GamificationState = {
      ...base,
      ...parsed,
      skipTokens: { ...base.skipTokens, ...(parsed.skipTokens || {}) }
    };
    if (merged.skipTokens.monthKey !== monthKey()) {
      merged.skipTokens.history.push({
        monthKey: merged.skipTokens.monthKey,
        used: merged.skipTokens.used
      });
      merged.skipTokens = { monthKey: monthKey(), used: 0, history: merged.skipTokens.history.slice(-6) };
    }
    return merged;
  } catch {
    return emptyState();
  }
}

export function saveState(email: string, state: GamificationState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getStorageKey(email), JSON.stringify(state));
  } catch {
    // quota / privacy mode — ignore
  }
}

export function resetState(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(getStorageKey(email));
  } catch {
    // ignore
  }
}

export function getToday(): string {
  return todayISO();
}

export function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getCurrentMonthKey(): string {
  return monthKey();
}

export function timeUntilMidnight(): { hours: number; minutes: number; seconds: number; totalSeconds: number; expired: boolean } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(POLL_STREAK_BREAKER_AT_HOUR, 0, 0, 0);
  if (midnight.getTime() <= now.getTime()) {
    midnight.setDate(midnight.getDate() + 1);
  }
  const totalSeconds = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, totalSeconds, expired: totalSeconds === 0 };
}

export function formatCountdown(t: { hours: number; minutes: number; seconds: number }): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`;
}

export function isPollDoneToday(state: GamificationState): boolean {
  return state.pollCompletedDates.includes(todayISO());
}

export function recordPollCompletion(state: GamificationState, now: Date = new Date()): GamificationState {
  const today = now.toISOString().slice(0, 10);
  if (state.pollCompletedDates.includes(today)) return state;

  const yesterday = (() => {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  let newStreak = 1;
  if (state.lastStreakDate === yesterday) {
    newStreak = state.currentStreak + 1;
  } else if (state.lastStreakDate === today) {
    newStreak = Math.max(1, state.currentStreak);
  }

  const longest = Math.max(state.longestStreak, newStreak);

  return {
    ...state,
    currentStreak: newStreak,
    longestStreak: longest,
    lastStreakDate: today,
    pollCompletedDates: [...state.pollCompletedDates.slice(-29), today]
  };
}

export function computeStreakStatus(state: GamificationState): {
  alive: boolean;
  pendingToday: boolean;
  broken: boolean;
} {
  const today = todayISO();
  if (state.lastStreakDate === today) {
    return { alive: true, pendingToday: false, broken: false };
  }
  if (state.lastStreakDate === null) {
    return { alive: false, pendingToday: true, broken: false };
  }
  const last = new Date(state.lastStreakDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    return { alive: true, pendingToday: true, broken: false };
  }
  return { alive: false, pendingToday: true, broken: diffDays > 1 };
}

export function consumeSkipToken(state: GamificationState): { state: GamificationState; ok: boolean } {
  if (state.skipTokens.used >= SKIP_TOKENS_PER_MONTH) {
    return { state, ok: false };
  }
  return {
    state: {
      ...state,
      skipTokens: {
        ...state.skipTokens,
        used: state.skipTokens.used + 1
      }
    },
    ok: true
  };
}

export function getSkipTokensRemaining(state: GamificationState): number {
  return Math.max(0, SKIP_TOKENS_PER_MONTH - state.skipTokens.used);
}

export function hashStringToInt(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function simulatedBadgeProgress(seedKey: string, badgeId: string): {
  rank: number;
  threshold: number;
  locked: boolean;
} {
  const dayKey = new Date().toISOString().slice(0, 10);
  const h = hashStringToInt(`${badgeId}|${seedKey}|${dayKey}`);
  const base = h % 47;
  const drift = (hashStringToInt(`${badgeId}|${dayKey}`) % 5);
  const rank = Math.min(47, base + drift);
  return {
    rank,
    threshold: LIMITED_BADGE_THRESHOLD,
    locked: rank > LIMITED_BADGE_THRESHOLD
  };
}

export function recordBadgeUnlock(state: GamificationState, badgeId: string, rank: number): GamificationState {
  const prev = state.badgeUnlocks[badgeId];
  const today = todayISO();
  return {
    ...state,
    badgeUnlocks: {
      ...state.badgeUnlocks,
      [badgeId]: {
        unlockedAt: prev?.unlockedAt || today,
        seenAt: prev?.seenAt || null,
        simulatedRank: rank
      }
    }
  };
}

export function markBadgeSeen(state: GamificationState, badgeId: string): GamificationState {
  const prev = state.badgeUnlocks[badgeId];
  if (!prev) return state;
  return {
    ...state,
    badgeUnlocks: {
      ...state.badgeUnlocks,
      [badgeId]: { ...prev, seenAt: todayISO() }
    }
  };
}

export function getOrInitBadge(state: GamificationState, badgeId: string, seedKey: string): GamificationState {
  if (state.badgeUnlocks[badgeId]) return state;
  const progress = simulatedBadgeProgress(seedKey, badgeId);
  return recordBadgeUnlock(state, badgeId, progress.rank);
}