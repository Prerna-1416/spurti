import crypto from 'crypto';
import express from 'express';
import Student from '../models/Student.js';
import Challenge from '../models/Challenge.js';
import ChallengeAttempt from '../models/ChallengeAttempt.js';
import ChallengeBadge from '../models/ChallengeBadge.js';
import { ensureTodaysChallenge } from '../services/challengeScheduler.js';
import { buildPuzzle, validateSolution, computeScore, countConflicts } from '../services/challengeGenerator.js';

const router = express.Router();

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function publicChallenge(challenge) {
  // Strip server-only fields (seed, solution) from anything sent to the client.
  return {
    date: challenge.date,
    kind: challenge.kind,
    n: challenge.n,
    preplaced: challenge.preplaced
  };
}

// GET /api/challenge/today — public shape: today's puzzle, attempt status for this user, countdown to next.
router.get('/today', async (req, res) => {
  const email = normalizeEmail(req.query.email);
  if (!email) return res.status(400).json({ error: 'email required' });
  const challenge = await ensureTodaysChallenge();
  const attempt = await ChallengeAttempt.findOne({ challengeId: challenge._id, email }).lean();
  // Countdown: midnight UTC of the next day
  const now = new Date();
  const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  res.json({
    challenge: publicChallenge(challenge),
    attempt: attempt ? {
      started: !!attempt.startServerTime,
      submitted: !!attempt.submitServerTime,
      solved: attempt.solved,
      score: attempt.score,
      rank: attempt.rank,
      spDelta: attempt.spDelta,
      durationMs: attempt.durationMs,
      moves: attempt.moves
    } : null,
    countdownMs: nextMidnight.getTime() - now.getTime(),
    participantCount: challenge.participantCount
  });
});

// POST /api/challenge/start { email } — record start time, return server-start timestamp + per-attempt token.
// The token is required to submit — prevents replay attacks across users / days.
router.post('/start', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ error: 'email required' });
  const student = await Student.findOne({ email }).lean();
  if (!student) return res.status(404).json({ error: 'student not found' });
  if (student.status === 'excused') return res.status(403).json({ error: 'account excused' });
  const challenge = await ensureTodaysChallenge();
  // Already attempted? return prior state — no new start, no second attempt.
  const existing = await ChallengeAttempt.findOne({ challengeId: challenge._id, email }).lean();
  if (existing) return res.json({
    challenge: publicChallenge(challenge),
    attempt: existing,
    started: !!existing.startServerTime,
    submitted: !!existing.submitServerTime
  });
  const startServerTime = new Date();
  const startToken = crypto.randomBytes(16).toString('hex');
  const attempt = await ChallengeAttempt.create({
    challengeId: challenge._id,
    challengeDate: challenge.date,
    email,
    studentId: student._id,
    startServerTime,
    startToken,
    moves: 0
  });
  await Challenge.updateOne({ _id: challenge._id }, { $inc: { participantCount: 1 } });
  res.json({ challenge: publicChallenge(challenge), attempt: { startServerTime: attempt.startServerTime, startToken: attempt.startToken } });
});

// POST /api/challenge/submit { email, placement, moves, startToken, clientDurationMs }
// Validates server-side, scores, stores. Idempotent — re-submitting returns the existing attempt.
router.post('/submit', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const placement = req.body?.placement;
  const moves = Number(req.body?.moves || 0);
  const startToken = String(req.body?.startToken || '');
  const clientDurationMs = Number(req.body?.clientDurationMs || 0);
  if (!email || !Array.isArray(placement) || !startToken) {
    return res.status(400).json({ error: 'email, placement, and startToken are required' });
  }
  const student = await Student.findOne({ email }).lean();
  if (!student) return res.status(404).json({ error: 'student not found' });
  const challenge = await Challenge.findOne({ kind: 'n-queens', archivedAt: null }).sort({ date: -1 }).lean();
  if (!challenge) return res.status(404).json({ error: 'no active challenge' });
  const attempt = await ChallengeAttempt.findOne({ challengeId: challenge._id, email });
  if (!attempt) return res.status(403).json({ error: 'start the challenge before submitting' });
  if (attempt.startToken !== startToken) return res.status(403).json({ error: 'invalid start token' });
  if (attempt.submitServerTime) return res.json({ attempt: { ...attempt.toObject() }, alreadySubmitted: true });

  // Server-derived duration (resilient to client clock tampering).
  const submitServerTime = new Date();
  const durationMs = submitServerTime.getTime() - attempt.startServerTime.getTime();
  if (durationMs < 0 || durationMs > 6 * 3600 * 1000) {
    return res.status(400).json({ error: 'duration outside acceptable range' });
  }
  if (clientDurationMs && Math.abs(clientDurationMs - durationMs) > 30 * 60 * 1000) {
    return res.status(400).json({ error: 'client/server duration mismatch too large' });
  }

  const v = validateSolution(placement, challenge.preplaced, challenge.n);
  const conflicts = countConflicts(placement, challenge.n).total;
  const solved = v.ok;
  const score = solved ? computeScore({ solved: true, conflicts: 0, durationMs })
                       : computeScore({ solved: false, conflicts, durationMs });

  attempt.placement = placement;
  attempt.moves = moves;
  attempt.solved = solved;
  attempt.score = score;
  attempt.durationMs = durationMs;
  attempt.submitServerTime = submitServerTime;
  attempt.rewardReason = solved ? 'Completed' : (v.reason || 'Invalid');
  await attempt.save();

  res.json({
    ok: true,
    solved,
    score,
    durationMs,
    conflicts,
    validationReason: v.ok ? null : v.reason
  });
});

// GET /api/challenge/leaderboard/:date — archived leaderboard, or live ranking for today if unarchived.
router.get('/leaderboard/:date', async (req, res) => {
  const date = req.params.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'invalid date' });
  const challenge = await Challenge.findOne({ date, kind: 'n-queens' }).lean();
  if (!challenge) return res.json({ date, entries: [], archived: false, challenge: null });
  const attempts = await ChallengeAttempt.find({ challengeId: challenge._id, submitServerTime: { $ne: null } })
    .sort({ solved: -1, score: 1, durationMs: 1, submitServerTime: 1 })
    .limit(50).lean();
  // Mask emails for privacy.
  const mask = (e) => {
    const [u, d] = String(e).split('@');
    if (!d) return 'anon';
    return `${u.slice(0, 2)}${'*'.repeat(Math.max(2, u.length - 2))}@${d}`;
  };
  res.json({
    date,
    archived: !!challenge.archivedAt,
    challenge: publicChallenge(challenge),
    entries: attempts.map((a, i) => ({
      rank: i + 1,
      name: a.email.split('@')[0],
      maskedEmail: mask(a.email),
      solved: a.solved,
      score: a.score,
      durationMs: a.durationMs,
      spDelta: a.spDelta,
      rewardReason: a.rewardReason
    }))
  });
});

// GET /api/challenge/history — last N archived challenges.
router.get('/history', async (_req, res) => {
  const list = await Challenge.find({ kind: 'n-queens' }).sort({ date: -1 }).limit(14).lean();
  res.json(list.map(c => ({
    date: c.date,
    n: c.n,
    archived: !!c.archivedAt,
    winnerCount: c.winnerCount,
    participantCount: c.participantCount
  })));
});

// GET /api/challenge/badges?email — student's earned challenge badges.
router.get('/badges', async (req, res) => {
  const email = normalizeEmail(req.query.email);
  if (!email) return res.status(400).json({ error: 'email required' });
  const badges = await ChallengeBadge.find({ email }).sort({ awardedAt: -1 }).lean();
  res.json(badges);
});

// GET /api/challenge/personal?email — personal best score, streak, total solves.
router.get('/personal', async (req, res) => {
  const email = normalizeEmail(req.query.email);
  if (!email) return res.status(400).json({ error: 'email required' });
  const solves = await ChallengeAttempt.find({ email, solved: true }).sort({ submitServerTime: -1 }).lean();
  const best = solves.length ? Math.min(...solves.map(s => s.score)) : null;
  const streak = computeStreak(solves);
  const totalSolves = solves.length;
  res.json({ bestScore: best, currentStreak: streak, totalSolves, lastSolveIso: solves[0]?.submitServerTime || null });
});

function computeStreak(solvesDesc) {
  // Solves are sorted newest first. Walk backwards from today and count
  // consecutive UTC days that have a solve.
  let streak = 0;
  let day = new Date();
  for (;;) {
    const key = day.toISOString().slice(0, 10);
    if (solvesDesc.some(s => s.challengeDate === key)) {
      streak++;
      day = new Date(day.getTime() - 86400000);
    } else break;
    if (streak > 365) break;
  }
  return streak;
}

export default router;