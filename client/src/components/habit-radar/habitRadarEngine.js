// Habit Radar engine — pure function reading existing profile data.
// Returns 5 axes (Attendance, Polls, Consistency, Curiosity, Participation)
// scored 0-100 with tier classification, plus strongest / growth-area detection.
//
// Ghost overlay: when localStorage has a prior snapshot for the same student,
// we surface previousWeekAxes so the radar can render the "last week" shape
// faintly behind the current shape.

const DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY_PREFIX = 'spurti_habit_radar_';

function safeNum(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

function tierFromScore(score) {
  if (score >= 70) return 'strong';
  if (score >= 40) return 'moderate';
  return 'growth';
}

function axis(name, score, delta) {
  return {
    name,
    score: Math.round(clamp01(score) * 100),
    delta: Math.round((delta || 0) * 100) / 100,
    tier: tierFromScore(score)
  };
}

function pct(numer, denom) {
  if (!denom || denom <= 0) return 0;
  return clamp01(numer / denom);
}

function inLastNDays(dateLike, days) {
  if (!dateLike) return false;
  const d = new Date(dateLike);
  if (isNaN(d.getTime())) return false;
  return (Date.now() - d.getTime()) <= days * DAY_MS;
}

function startOfWeek(d) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(d.getDate() - d.getDay());
  return out;
}

function isMeaningfulCategory(c) {
  return ['peer', 'documentation', 'sharing', 'mentoring', 'project', 'reflection']
    .includes(String(c || '').toLowerCase());
}

function isAdvancedPoll(p) {
  if (!p) return false;
  return safeNum(p.totalQuestions, 0) >= 3;
}

export function calculateHabitRadar(profile = {}, exp = {}) {
  const attendance = Array.isArray(profile.attendance) ? profile.attendance : [];
  const polls = Array.isArray(profile.polls) ? profile.polls : [];
  const transactions = Array.isArray(profile.transactions) ? profile.transactions : [];

  // ATTENDANCE axis: % of recent sessions attended (last 4 weeks)
  const recentAttended = attendance.filter(a => inLastNDays(a.dateTime, 28) && a.qualified).length;
  const recentAttendedTotal = attendance.filter(a => inLastNDays(a.dateTime, 28)).length;
  const attendanceScore = pct(recentAttended, Math.max(1, recentAttendedTotal));

  // POLLS axis: % polls attempted
  let totalPollQs = 0, attemptedPollQs = 0;
  for (const p of polls) {
    totalPollQs += safeNum(p.totalQuestions, 0);
    attemptedPollQs += safeNum(p.attemptedQuestions, 0);
  }
  const pollsScore = pct(attemptedPollQs, Math.max(1, totalPollQs));

  // CONSISTENCY axis: streak stability + variance over the last 14 days
  const dailySp14 = (() => {
    const buckets = new Array(14).fill(0);
    for (const tx of transactions) {
      const d = tx && tx.dateTime ? new Date(tx.dateTime) : null;
      if (!d || isNaN(d.getTime())) continue;
      const idx = 14 - 1 - Math.floor((Date.now() - d.getTime()) / DAY_MS);
      if (idx >= 0 && idx < 14) {
        const sp = safeNum(tx.appliedDelta, 0);
        if (sp > 0) buckets[idx] += sp;
      }
    }
    return buckets;
  })();
  const activeDays = dailySp14.filter(s => s > 0).length;
  const consistencyRaw = activeDays / 14;
  const streak = Number(exp.streakDays || 0);
  const streakNorm = clamp01(streak / 14);
  const consistencyScore = clamp01(0.6 * consistencyRaw + 0.4 * streakNorm);

  // CURIOSITY axis: advanced polls completed + meaningful-sp ratio in last 7d
  let advancedDone = 0, totalCompleted = 0;
  for (const p of polls) {
    if (safeNum(p.attemptedQuestions, 0) >= safeNum(p.totalQuestions, 0) && p.totalQuestions > 0) {
      totalCompleted++;
      if (isAdvancedPoll(p)) advancedDone++;
    }
  }
  const advancedRatio = pct(advancedDone, Math.max(1, totalCompleted));
  let meaningfulSp7 = 0, totalSp7 = 0;
  for (const t of transactions) {
    if (!inLastNDays(t.dateTime, 7)) continue;
    const v = safeNum(t.appliedDelta, 0);
    if (v <= 0) continue;
    totalSp7 += v;
    if (isMeaningfulCategory(String(t.category || ''))) meaningfulSp7 += v;
  }
  const meaningfulRatio7 = pct(meaningfulSp7, Math.max(1, totalSp7));
  const curiosityScore = clamp01(0.55 * advancedRatio + 0.45 * meaningfulRatio7);

  // PARTICIPATION axis: total engagement events in last 7d, normalized to a soft cap of 14
  const lastWeek = transactions.filter(t => inLastNDays(t.dateTime, 7)).length;
  const participationScore = clamp01(lastWeek / 14);

  // Previous-week (8..14 days ago) values for ghost overlay + deltas
  const prevRange = (dateLike) => {
    const diff = Date.now() - (dateLike ? new Date(dateLike).getTime() : 0);
    return diff > 7 * DAY_MS && diff <= 14 * DAY_MS;
  };
  const prevAttendance = pct(
    attendance.filter(a => prevRange(a.dateTime) && a.qualified).length,
    Math.max(1, attendance.filter(a => prevRange(a.dateTime)).length)
  );
  const prevPollsAttempts = polls.reduce((s, p) => prevRange(p.dateTime) ? s + safeNum(p.attemptedQuestions, 0) : s, 0);
  const prevPollsTotal = polls.reduce((s, p) => prevRange(p.dateTime) ? s + safeNum(p.totalQuestions, 0) : s, 0);
  const prevPollsScore = pct(prevPollsAttempts, Math.max(1, prevPollsTotal));
  const prevWeekTx = transactions.filter(t => prevRange(t.dateTime));
  const prevActiveDaysCount = (() => {
    const b = new Array(7).fill(0);
    for (const tx of prevWeekTx) {
      const d = new Date(tx.dateTime);
      if (isNaN(d.getTime())) continue;
      const idx = 7 - 1 - Math.floor((Date.now() - d.getTime() - 7 * DAY_MS) / DAY_MS);
      if (idx >= 0 && idx < 7) {
        const sp = safeNum(tx.appliedDelta, 0);
        if (sp > 0) b[idx] += sp;
      }
    }
    return b.filter(v => v > 0).length;
  })();
  const prevConsistency = prevActiveDaysCount / 7;
  const prevParticipation = clamp01(prevWeekTx.length / 14);
  let prevMeaningfulSp = 0, prevTotalSp = 0;
  for (const t of prevWeekTx) {
    const v = safeNum(t.appliedDelta, 0);
    if (v <= 0) continue;
    prevTotalSp += v;
    if (isMeaningfulCategory(String(t.category || ''))) prevMeaningfulSp += v;
  }
  const prevCuriosity = clamp01(0.55 * pct(0, 1) + 0.45 * pct(prevMeaningfulSp, Math.max(1, prevTotalSp)));

  const current = {
    Attendance: attendanceScore,
    Polls: pollsScore,
    Consistency: consistencyScore,
    Curiosity: curiosityScore,
    Participation: participationScore
  };
  const previous = {
    Attendance: prevAttendance,
    Polls: prevPollsScore,
    Consistency: prevConsistency,
    Curiosity: prevCuriosity,
    Participation: prevParticipation
  };

  const axes = [
    axis('Attendance',    current.Attendance,    current.Attendance    - previous.Attendance),
    axis('Polls',         current.Polls,         current.Polls         - previous.Polls),
    axis('Consistency',   current.Consistency,   current.Consistency   - previous.Consistency),
    axis('Curiosity',     current.Curiosity,     current.Curiosity     - previous.Curiosity),
    axis('Participation', current.Participation, current.Participation - previous.Participation)
  ];

  const strongest = axes.reduce((a, b) => (a.score > b.score ? a : b));
  const growth = axes.reduce((a, b) => (a.score < b.score ? a : b));

  const TIPS = {
    Attendance: 'Try attending the next session in full — even a 30-minute partial counts.',
    Polls: 'Submit one poll you would normally skip. Every answer moves the dial.',
    Consistency: 'Show up tomorrow to extend your streak — one day protects the whole chain.',
    Curiosity: 'Attempt one advanced poll this week. Depth of questions compounds your curiosity axis.',
    Participation: 'Try one new type of action this week (help a peer, document, share). Variety builds participation.'
  };
  const growthTip = TIPS[growth.name] || 'Keep showing up consistently. Small actions compound.';

  const weekStartIso = startOfWeek(new Date()).toISOString().slice(0, 10);
  return {
    axes,
    strongest_habit: strongest.name,
    growth_area: growth.name,
    growth_tip: growthTip,
    week_start_date: weekStartIso,
    previous_week_axes: previous
  };
}

export function persistRadarSnapshot(email, snapshot) {
  if (typeof window === 'undefined' || !email) return;
  try {
    const key = STORAGE_KEY_PREFIX + email.toLowerCase();
    const arr = JSON.parse(window.localStorage.getItem(key) || '[]');
    const filtered = arr.filter(e => Date.now() - (e.ts || 0) < 28 * 24 * 60 * 60 * 1000);
    filtered.push(snapshot);
    window.localStorage.setItem(key, JSON.stringify(filtered));
  } catch {}
}

export function pickPreviousWeekGhost(email, currentWeekIso) {
  if (typeof window === 'undefined' || !email) return null;
  try {
    const key = STORAGE_KEY_PREFIX + email.toLowerCase();
    const arr = JSON.parse(window.localStorage.getItem(key) || '[]');
    if (arr.length < 2) return null;
    for (let i = arr.length - 2; i >= 0; i--) {
      if (arr[i].week !== currentWeekIso) return arr[i];
    }
    return null;
  } catch { return null; }
}