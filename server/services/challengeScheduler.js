import Challenge from '../models/Challenge.js';
import { buildPuzzle } from './challengeGenerator.js';
import { finalizeDay } from './challengeRewards.js';

// Lightweight in-process scheduler. Runs every minute:
//  1. Ensure today's challenge exists (idempotent — safe to call repeatedly).
//  2. If past midnight UTC and yesterday's challenge is unarchived, finalize it.
// Designed as a single-tick function so we can stop it in tests.

const TICK_MS = 60 * 1000;

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayUTC() {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

let _handle = null;

export async function ensureTodaysChallenge() {
  const date = todayUTC();
  const existing = await Challenge.findOne({ date, kind: 'n-queens' });
  if (existing) return existing;
  const p = buildPuzzle(date);
  const doc = await Challenge.create({
    date: p.date, kind: p.kind, n: p.n, preplaced: p.preplaced,
    solution: p.solution, seed: p.seed, generatedAt: new Date()
  });
  console.log(`[challenge] generated ${p.n}-queens puzzle for ${date}`);
  return doc;
}

async function tick() {
  try {
    await ensureTodaysChallenge();
    const y = yesterdayUTC();
    const yc = await Challenge.findOne({ date: y, kind: 'n-queens' });
    if (yc && !yc.archivedAt) {
      const r = await finalizeDay(y);
      if (r.ok) console.log(`[challenge] finalized ${y}: ${r.ranked} ranked`);
    }
  } catch (err) {
    console.error('[challenge] tick failed:', err?.message);
  }
}

export function startChallengeScheduler() {
  if (_handle) return;
  tick(); // fire immediately on boot
  _handle = setInterval(tick, TICK_MS);
  console.log('[challenge] scheduler started');
}

export function stopChallengeScheduler() {
  if (_handle) { clearInterval(_handle); _handle = null; }
}
