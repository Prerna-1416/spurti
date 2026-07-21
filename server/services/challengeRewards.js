import Challenge from '../models/Challenge.js';
import ChallengeAttempt from '../models/ChallengeAttempt.js';
import ChallengeBadge from '../models/ChallengeBadge.js';
import Student from '../models/Student.js';
import SPTransaction from '../models/SPTransaction.js';

// Reward schedule for the daily leaderboard. Values are PERCENTAGES of the
// student's CURRENT balance (not absolute). Solved attempts only.
const REWARD_PCT = { 1: 0.004, 2: 0.003, 3: 0.002 };   // 0.4%, 0.3%, 0.2%
const PARTICIPATION_PCT = 0.001;                       // 0.1%

// Idempotent: if `spAwarded` is true on an attempt, skip it. Safe to re-run.
export async function finalizeDay(date) {
  const challenge = await Challenge.findOne({ date, kind: 'n-queens' });
  if (!challenge) return { ok: false, reason: 'no challenge for date' };
  if (challenge.archivedAt) {
    return { ok: false, reason: 'already finalized', archivedAt: challenge.archivedAt };
  }

  // Rank attempts by (solved desc), (score asc), (durationMs asc), (submitServerTime asc)
  const attempts = await ChallengeAttempt.find({
    challengeId: challenge._id,
    submitServerTime: { $ne: null }
  }).sort({ solved: -1, score: 1, durationMs: 1, submitServerTime: 1 }).lean();

  // Assign ranks — only solved attempts count toward podium. Unsolved are
  // recorded but receive no SP and no rank.
  let rank = 0;
  const awarded = [];
  for (const att of attempts) {
    if (!att.solved) continue;
    rank++;
    att.rank = rank;
    const pct = REWARD_PCT[rank] || PARTICIPATION_PCT;
    const student = await Student.findOne({ email: att.email }).lean();
    if (!student) continue;
    const balance = Math.max(0, Number(student.totalSp) || 0);
    const delta = Math.max(1, Math.round(balance * pct));
    const newBalance = balance + delta;
    await Student.updateOne({ _id: student._id }, { $inc: { totalSp: delta, highestSpEver: delta } });
    await SPTransaction.create({
      email: att.email,
      studentId: student._id,
      category: 'manual',
      sessionLabel: `DailyChallenge:${date}`,
      deltaMode: 'absolute',
      deltaValue: delta,
      appliedDelta: delta,
      balanceAfter: newBalance,
      reason: rank <= 3
        ? `Daily Challenge ${date} — Rank ${rank}`
        : `Daily Challenge ${date} — Completed`,
      dateTime: new Date()
    });
    await ChallengeAttempt.updateOne({ _id: att._id }, {
      $set: { rank, spDelta: delta, spAwarded: true, rewardReason: `Rank ${rank}` }
    });
    awarded.push({ email: att.email, rank, delta });
  }

  await Challenge.updateOne({ _id: challenge._id }, {
    $set: {
      archivedAt: new Date(),
      winnerCount: awarded.length,
      participantCount: attempts.length
    }
  });

  await evaluateBadges(date);
  return { ok: true, ranked: awarded.length, archivedAt: new Date() };
}

// Awards badges based on the student's recent history. Runs after each day's
// finalize so it stays cheap. New badge kinds can be added by extending the
// switch below.
async function evaluateBadges(date) {
  // 1. first-solve: any solved attempt today
  const solvesToday = await ChallengeAttempt.find({ challengeDate: date, solved: true }).select('email').lean();
  for (const s of solvesToday) {
    await ChallengeBadge.updateOne(
      { email: s.email, kind: 'first-solve', level: 1 },
      { $setOnInsert: { email: s.email, kind: 'first-solve', level: 1, awardedAt: new Date(), challengeDate: date } },
      { upsert: true }
    ).catch(() => {});
  }
  // 2. three-in-a-row: solved yesterday, day before, and today
  const ymd = (d) => new Date(d).toISOString().slice(0, 10);
  const dt = new Date(date);
  for (let i = -2; i <= 0; i++) {
    const d = ymd(new Date(dt.getTime() + i * 86400000));
    const daySolves = await ChallengeAttempt.find({ challengeDate: d, solved: true }).select('email').lean();
    const emails = new Set(daySolves.map(s => s.email));
    if (i === 0) {
      for (const e of emails) {
        const ystr = ymd(new Date(dt.getTime() - 86400000));
        const dstr = ymd(new Date(dt.getTime() - 2 * 86400000));
        const ok = (await ChallengeAttempt.exists({ email: e, challengeDate: ystr, solved: true }))
                && (await ChallengeAttempt.exists({ email: e, challengeDate: dstr, solved: true }));
        if (ok) {
          await ChallengeBadge.updateOne(
            { email: e, kind: 'three-in-a-row', level: 1 },
            { $setOnInsert: { email: e, kind: 'three-in-a-row', level: 1, awardedAt: new Date(), challengeDate: date } },
            { upsert: true }
          ).catch(() => {});
        }
      }
    }
  }
}