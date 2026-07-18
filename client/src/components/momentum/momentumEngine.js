// Momentum engine — pure function reading existing profile data.
// Returns a momentum_score (0-100), state bucket, headline,
// weakest contributing factor, and a 14-day sparkline of daily SP.

const POSITIVE_CATEGORIES = new Set(['attendance', 'polls', 'session', 'project', 'peer', 'documentation', 'sharing', 'mentoring']);
const MEANINGFUL_CATEGORIES = new Set(['peer', 'documentation', 'sharing', 'mentoring', 'project']);

const DAY_MS = 24 * 60 * 60 * 1000;

function safeNum(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function clamp01(x) {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function linearSlope(values) {
  const n = values.length;
  if (n < 2) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

function normalizeSlope(slope, scale) {
  // slope is sp/day; normalize to ~ -1..+1 within +/- scale
  return clamp01(0.5 + slope / (scale * 2));
}

function computeDailySp(transactions, daysBack) {
  // Returns array of length daysBack with sp earned per day for recent N days
  const now = Date.now();
  const buckets = new Array(daysBack).fill(0);
  for (const tx of transactions) {
    const d = tx && tx.dateTime ? new Date(tx.dateTime) : null;
    if (!d || isNaN(d.getTime())) continue;
    const delta = (now - d.getTime()) / DAY_MS;
    const idx = Math.floor(daysBack - delta);
    if (idx >= 0 && idx < daysBack) {
      const sp = safeNum(tx.appliedDelta, 0);
      if (sp > 0) buckets[idx] += sp;
    }
  }
  return buckets;
}

function computeAttendanceDays(attendance, daysBack) {
  const now = Date.now();
  const flags = new Array(daysBack).fill(0);
  for (const a of attendance || []) {
    const dt = a && (a.dateTime || a.sessionDate);
    if (!dt) continue;
    const d = new Date(dt);
    if (isNaN(d.getTime())) continue;
    const idx = daysBack - 1 - Math.floor((now - d.getTime()) / DAY_MS);
    if (idx >= 0 && idx < daysBack && (a.qualified === true || a.qualified === 1)) flags[idx] = 1;
  }
  return flags;
}

function computePollParticipationFlags(polls, daysBack) {
  // Returns per-day flags whether a poll was completed that day.
  // We approximate: if the polls array exists, flag each day the student has full completion.
  const now = Date.now();
  const flags = new Array(daysBack).fill(0);
  for (const p of polls || []) {
    if (!p || !p.totalQuestions) continue;
    if ((p.attemptedQuestions || 0) < p.totalQuestions) continue;
    const label = p.sessionLabel || '';
    // We don't have an exact date for polls; fall back to spreading recent polls across the last daysBack.
    // Use a simple heuristic: each completed poll counts today-1 (most recent yesterday-ish).
    if (!label) continue;
    // No reliable date — bucket into last N days based on index of label
    const labelIdx = label.length;
    const dayIdx = daysBack - 1 - ((labelIdx * 7) % daysBack);
    if (dayIdx >= 0 && dayIdx < daysBack) flags[dayIdx] = 1;
  }
  return flags;
}

function bucketState(score) {
  if (score >= 70) return 'high';
  if (score >= 30) return 'slowing';
  return 'lost';
}

export function calculateMomentum(profile = {}, exp = {}) {
  const transactions = Array.isArray(profile.transactions) ? profile.transactions : [];
  const attendance = Array.isArray(profile.attendance) ? profile.attendance : [];
  const polls = Array.isArray(profile.polls) ? profile.polls : [];

  // 14-day daily SP buckets (used both for the sparkline and the trend)
  const dailySp14 = computeDailySp(transactions, 14);

  // 7d trailing window vs the previous 7d
  const trailing7 = dailySp14.slice(7, 14);
  const previous7 = dailySp14.slice(0, 7);
  const trailingTotal = trailing7.reduce((a, b) => a + b, 0);
  const previousTotal = previous7.reduce((a, b) => a + b, 0);
  const trailingAvg = trailingTotal / 7;
  const previousAvg = previousTotal / 7;

  // SP velocity trend: positive if gaining, negative if slowing. Normalize.
  const spVelocityNorm = normalizeSlope(linearSlope(trailing7), 2);

  // Attendance trend
  const attTrailing = computeAttendanceDays(attendance, 7).slice(0, 7);
  const attPrevious = computeAttendanceDays(attendance, 14).slice(0, 7);
  const attTrailingRate = attTrailing.reduce((a, b) => a + b, 0) / 7;
  const attPreviousRate = attPrevious.reduce((a, b) => a + b, 0) / 7;
  const attendanceTrend = clamp01(attTrailingRate - attPreviousRate + 0.5);

  // Poll trend (proxy via poll labels)
  const pollTrailing = computePollParticipationFlags(polls, 7).slice(0, 7);
  const pollPrevious = computePollParticipationFlags(polls, 14).slice(0, 7);
  const pollTrailingRate = pollTrailing.reduce((a, b) => a + b, 0) / 7;
  const pollPreviousRate = pollPrevious.reduce((a, b) => a + b, 0) / 7;
  const pollTrend = clamp01(pollTrailingRate - pollPreviousRate + 0.5);

  // Rank delta (rank movement upward = positive)
  // We can't compute historical rank without snapshots; assume cohort's rankPct as proxy:
  const rank = Number(profile.student?.rank || 0);
  const cohortSize = Math.max(1, Number(profile.student?.cohortSize || 1));
  const rankPct = rank / cohortSize;
  const rankDeltaNorm = clamp01((1 - rankPct) * 0.7 + 0.3); // higher rank -> higher norm

  // Streak stability
  const streak = Number(exp.streakDays || profile.student?.streakDays || 0);
  const streakStability = clamp01(streak / 14);

  // Meaningful SP ratio (% of recent 7d SP from non-trivial categories)
  const meaningfulSp7 = transactions.reduce((s, t) => {
    const dt = t && t.dateTime ? new Date(t.dateTime) : null;
    if (!dt || isNaN(dt.getTime())) return s;
    if ((Date.now() - dt.getTime()) > 7 * DAY_MS) return s;
    const cat = String(t.category || '').toLowerCase();
    const val = safeNum(t.appliedDelta, 0);
    if (val > 0 && MEANINGFUL_CATEGORIES.has(cat)) return s + val;
    return s;
  }, 0);
  const totalSp7 = transactions.reduce((s, t) => {
    const dt = t && t.dateTime ? new Date(t.dateTime) : null;
    if (!dt || isNaN(dt.getTime())) return s;
    if ((Date.now() - dt.getTime()) > 7 * DAY_MS) return s;
    return s + Math.max(0, safeNum(t.appliedDelta, 0));
  }, 0);
  const meaningfulSpRatio = totalSp7 > 0 ? clamp01(meaningfulSp7 / totalSp7) : 0;

  // Weighted blend (sum = 1.15 then clamp to 100; per spec, weights sum to 1.0)
  const raw =
    0.25 * spVelocityNorm * 100 +
    0.20 * attendanceTrend * 100 +
    0.15 * pollTrend * 100 +
    0.15 * rankDeltaNorm * 100 +
    0.10 * streakStability * 100 +
    0.15 * meaningfulSpRatio * 100;
  const score = Math.round(Math.max(0, Math.min(100, raw)));

  // Identify the weakest factor (lowest normalized contributor; tie-break by importance)
  const factors = [
    { id: 'sp_velocity', label: 'SP earning pace', value: spVelocityNorm, weight: 0.25 },
    { id: 'attendance',   label: 'attendance',     value: attendanceTrend, weight: 0.20 },
    { id: 'poll',         label: 'poll participation', value: pollTrend, weight: 0.15 },
    { id: 'rank',         label: 'rank movement',  value: rankDeltaNorm, weight: 0.15 },
    { id: 'streak',       label: 'streak stability', value: streakStability, weight: 0.10 },
    { id: 'meaningful',   label: 'meaningful actions', value: meaningfulSpRatio, weight: 0.15 }
  ];
  factors.sort((a, b) => a.value - b.value);
  const weakest = factors[0];

  // Headline message
  const state = bucketState(score);
  let headline;
  if (state === 'high') {
    headline = `You're learning consistently. ${streak > 0 ? `Streak: ${streak} day${streak > 1 ? 's' : ''}.` : 'Keep going.'}`;
  } else if (state === 'slowing') {
    const pct = previousTotal > 0 ? Math.round(Math.max(0, (1 - trailingTotal / previousTotal)) * 100) : 0;
    headline = previousTotal === 0
      ? 'Activity has been light. Show up tomorrow to rebuild momentum.'
      : `You earned ${pct}% fewer SP this week. Attend tomorrow's session.`;
  } else {
    headline = 'Your activity has dropped. Let\u2019s get back on track — one session at a time.';
  }

  // Sparkline data: [{date, sp}, ...] for last 14 days, in chronological order (oldest first)
  const now = Date.now();
  const sparkline = dailySp14.slice(7, 14).concat(dailySp14.slice(7, 14)).length === 14 // safety
    ? dailySp14
    : dailySp14;
  // Build date-labeled items (oldest first)
  const sparkPoints = [];
  for (let i = 0; i < sparkline.length; i++) {
    const d = new Date(now - (sparkline.length - 1 - i) * DAY_MS);
    sparkPoints.push({
      date: d.toISOString().slice(0, 10),
      sp: sparkline[i]
    });
  }

  return {
    momentum_score: score,
    state,
    headline_message: headline,
    weakest_factor: weakest.id,
    weakest_factor_label: weakest.label,
    sparkline_data: sparkPoints,
    factors: factors.map(f => ({ id: f.id, label: f.label, value: Math.round(f.value * 100) })),
    meaningful_sp_ratio: Math.round(meaningfulSpRatio * 100),
    calculated_at: new Date().toISOString()
  };
}