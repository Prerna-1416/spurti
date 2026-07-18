import express from 'express';
import Student from '../models/Student.js';
import SPTransaction from '../models/SPTransaction.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import MomentumSnapshot from '../models/MomentumSnapshot.js';

const router = express.Router();

const MEANINGFUL_CATEGORIES = new Set(['peer', 'documentation', 'sharing', 'mentoring', 'project']);
const DAY_MS = 24 * 60 * 60 * 1000;

function safeNum(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}
function clamp01(x) { return Math.max(0, Math.min(1, x)); }
function linearSlope(values) {
  const n = values.length;
  if (n < 2) return 0;
  let sx = 0, sy = 0, sxy = 0, sx2 = 0;
  for (let i = 0; i < n; i++) {
    sx += i; sy += values[i]; sxy += i * values[i]; sx2 += i * i;
  }
  const denom = n * sx2 - sx * sx;
  return denom === 0 ? 0 : (n * sxy - sx * sy) / denom;
}
function normalizeSlope(slope, scale) {
  return clamp01(0.5 + slope / (scale * 2));
}
function bucketState(score) {
  if (score >= 70) return 'high';
  if (score >= 30) return 'slowing';
  return 'lost';
}

function computeDailySpBuckets(transactions, daysBack) {
  const now = Date.now();
  const buckets = new Array(daysBack).fill(0);
  for (const tx of transactions) {
    const d = tx && tx.dateTime ? new Date(tx.dateTime) : null;
    if (!d || isNaN(d.getTime())) continue;
    const idx = Math.floor(daysBack - (now - d.getTime()) / DAY_MS);
    if (idx >= 0 && idx < daysBack) {
      const sp = safeNum(tx.appliedDelta, 0);
      if (sp > 0) buckets[idx] += sp;
    }
  }
  return buckets;
}

async function computeMomentumFor(student, dbTransactions) {
  const dailySp14 = computeDailySpBuckets(dbTransactions, 14);
  const trailing7 = dailySp14.slice(7, 14);
  const previous7 = dailySp14.slice(0, 7);
  const trailingTotal = trailing7.reduce((a, b) => a + b, 0);
  const previousTotal = previous7.reduce((a, b) => a + b, 0);

  const spVelocityNorm = normalizeSlope(linearSlope(trailing7), 2);

  const sevenDayAgo = new Date(Date.now() - 7 * DAY_MS);
  const fourteenDayAgo = new Date(Date.now() - 14 * DAY_MS);

  const attRecent = await AttendanceRecord.find({
    email: student.email,
    dateTime: { $gte: sevenDayAgo }
  }).select('qualified').lean();
  const attPrev = await AttendanceRecord.find({
    email: student.email,
    dateTime: { $gte: fourteenDayAgo, $lt: sevenDayAgo }
  }).select('qualified').lean();
  const attTrailingRate = attRecent.filter(a => a.qualified).length / 7;
  const attPreviousRate = attPrev.filter(a => a.qualified).length / 7;
  const attendanceTrend = clamp01(attTrailingRate - attPreviousRate + 0.5);

  const pollsRecent = dbTransactions.filter(t => {
    const d = t.dateTime ? new Date(t.dateTime) : null;
    return d && !isNaN(d.getTime()) && (Date.now() - d.getTime()) <= 7 * DAY_MS && /poll/i.test(String(t.category || ''));
  });
  const pollsPrev = dbTransactions.filter(t => {
    const d = t.dateTime ? new Date(t.dateTime) : null;
    if (!d || isNaN(d.getTime())) return false;
    const diff = Date.now() - d.getTime();
    return diff > 7 * DAY_MS && diff <= 14 * DAY_MS && /poll/i.test(String(t.category || ''));
  });
  const pollTrend = clamp01((pollsRecent.length - pollsPrev.length) / 7 + 0.5);

  const rankPct = (Number(student.rank || 0) / Math.max(1, Number(student.cohortSize || 1))) || 0.5;
  const rankDeltaNorm = clamp01((1 - rankPct) * 0.7 + 0.3);

  const meaningfulRecent = dbTransactions
    .filter(t => {
      const d = t.dateTime ? new Date(t.dateTime) : null;
      if (!d || isNaN(d.getTime())) return false;
      if ((Date.now() - d.getTime()) > 7 * DAY_MS) return false;
      return MEANINGFUL_CATEGORIES.has(String(t.category || '').toLowerCase()) && safeNum(t.appliedDelta, 0) > 0;
    })
    .reduce((s, t) => s + safeNum(t.appliedDelta, 0), 0);
  const totalRecent = dbTransactions
    .filter(t => {
      const d = t.dateTime ? new Date(t.dateTime) : null;
      if (!d || isNaN(d.getTime())) return false;
      if ((Date.now() - d.getTime()) > 7 * DAY_MS) return false;
      return safeNum(t.appliedDelta, 0) > 0;
    })
    .reduce((s, t) => s + safeNum(t.appliedDelta, 0), 0);
  const meaningfulSpRatio = totalRecent > 0 ? clamp01(meaningfulRecent / totalRecent) : 0;

  const raw =
    0.25 * spVelocityNorm * 100 +
    0.20 * attendanceTrend * 100 +
    0.15 * pollTrend * 100 +
    0.15 * rankDeltaNorm * 100 +
    0.10 * clamp01((Number(student.highestSpEver || 0) / 100) / 14) * 100 +
    0.15 * meaningfulSpRatio * 100;
  const score = Math.round(Math.max(0, Math.min(100, raw)));
  return { score, state: bucketState(score), meaningfulSpRatio, sparkPoints: dailySp14.map((sp, i) => ({ date: new Date(Date.now() - (13 - i) * DAY_MS).toISOString().slice(0, 10), sp })) };
}

router.get('/student/:id/momentum', async (req, res) => {
  try {
    const email = String(req.params.id || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ error: 'student id required' });
    const student = await Student.findOne({ email }).select('email name totalSp highestSpEver rank cohortSize').lean();
    if (!student) return res.status(404).json({ error: 'student not found' });

    const dbTransactions = await SPTransaction.find({ email }).sort({ dateTime: 1 }).lean();
    const result = await computeMomentumFor(student, dbTransactions);

    const snapshots = await MomentumSnapshot.find({ studentEmail: email })
      .sort({ date: 1 })
      .limit(30)
      .lean();

    res.json({
      student: { email: student.email, name: student.name },
      momentum_score: result.score,
      state: result.state,
      meaningful_sp_ratio: Math.round(result.meaningfulSpRatio * 100),
      sparkline_data: result.sparkPoints,
      snapshot_history: snapshots.map(s => ({ date: s.date, score: s.momentumScore, state: s.state })),
      calculated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('momentum error:', err);
    res.status(500).json({ error: err.message || 'momentum failed' });
  }
});

router.post('/student/:id/momentum/refresh', async (req, res) => {
  try {
    const email = String(req.params.id || '').toLowerCase().trim();
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ error: 'student not found' });
    const dbTransactions = await SPTransaction.find({ email }).sort({ dateTime: 1 }).lean();
    const result = await computeMomentumFor(student, dbTransactions);

    const todayIso = new Date().toISOString().slice(0, 10);
    await MomentumSnapshot.findOneAndUpdate(
      { studentEmail: email, date: todayIso },
      {
        studentEmail: email,
        date: todayIso,
        spEarned: result.sparkPoints.slice(-1)[0]?.sp || 0,
        meaningfulSp: Math.round(result.meaningfulSpRatio * (result.sparkPoints.slice(-1)[0]?.sp || 0)),
        momentumScore: result.score,
        state: result.state,
        computedAt: new Date()
      },
      { upsert: true, new: true }
    );
    res.json({ ok: true, score: result.score, state: result.state });
  } catch (err) {
    res.status(500).json({ error: err.message || 'momentum refresh failed' });
  }
});

export default router;