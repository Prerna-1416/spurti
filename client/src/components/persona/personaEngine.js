import { PERSONAS } from './personas.js';

export { PERSONAS } from './personas.js';

export function classifyPersona(profile, exp) {
  const student = profile?.student || {};
  const polls = Array.isArray(profile?.polls) ? profile.polls : [];
  const transactions = Array.isArray(profile?.transactions) ? profile.transactions : [];
  const attendance = Array.isArray(profile?.attendance) ? profile.attendance : [];

  const totalSp = Number(student.totalSp) || 0;
  const rank = Number(student.rank) || 0;
  const cohortSize = Math.max(1, Number(student.cohortSize) || 1);
  const attendanceStreak = Number(exp?.streakDays) || 0;
  const daysOfActivity = Math.min(7, attendance.length || transactions.length || 1);

  const totalPolls = polls.reduce((s, p) => s + (Number(p.totalQuestions) || 0), 0);
  const attemptedPolls = polls.reduce((s, p) => s + (Number(p.attemptedQuestions) || 0), 0);
  const pollAttemptRate = totalPolls > 0 ? attemptedPolls / totalPolls : 0;

  const attendedSessions = attendance.filter(a => a && a.qualified).length;
  const totalSessions = attendance.length;
  const attendanceRate = totalSessions > 0 ? attendedSessions / totalSessions : 0;

  const activityTypes = new Set();
  for (const t of transactions) {
    if (!t || !t.category) continue;
    activityTypes.add(String(t.category).toLowerCase());
  }
  activityTypes.add(attendance.length > 0 ? 'attendance' : '');
  activityTypes.add(polls.length > 0 ? 'polls' : '');
  activityTypes.delete('');
  const activityDiversityScore = Math.min(1, activityTypes.size / 6);

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const recentTx = transactions.filter(t => t && t.dateTime && (now - new Date(t.dateTime).getTime()) <= sevenDaysMs);
  const recentBalance = recentTx.length > 0 ? Number(recentTx[recentTx.length - 1].balanceAfter) || 0 : totalSp;
  const olderBalance = recentTx.length > 0 ? Number(recentTx[0].balanceAfter) || recentBalance : totalSp;
  const spTrend7d = recentBalance - olderBalance;

  const recentPositiveCategories = ['attendance', 'polls', 'session', 'project'];
  const recentMeaningfulSp = recentTx
    .filter(t => recentPositiveCategories.includes(String(t.category || '').toLowerCase()))
    .reduce((s, t) => s + Math.max(0, Number(t.appliedDelta) || 0), 0);
  const recentTotalSp = recentTx.reduce((s, t) => {
    const d = Number(t.appliedDelta) || 0;
    return s + (d < 0 ? 0 : d);
  }, 0);
  const meaningfulSpRatio = recentTotalSp > 0 ? Math.min(1, recentMeaningfulSp / recentTotalSp) : 0;

  const contributionKeywords = /peer|help|share|mentor|document|knowledge/i;
  let recentContributionSp = 0;
  for (const t of recentTx) {
    const reason = String(t.reason || '') + ' ' + String(t.category || '');
    if (contributionKeywords.test(reason)) {
      recentContributionSp += Math.max(0, Number(t.appliedDelta) || 0);
    }
  }
  const contributionScore = Math.min(100, Math.round(
    (meaningfulSpRatio * 40) +
    (activityDiversityScore * 25) +
    Math.min(35, recentContributionSp / 4)
  ));

  const rankPct = cohortSize > 0 ? rank / cohortSize : 1;
  const rankTrend7d = 0;

  const signals = {
    attendanceRate: Math.round(attendanceRate * 100),
    pollAttemptRate: Math.round(pollAttemptRate * 100),
    activityDiversityScore: Math.round(activityDiversityScore * 100),
    spTrend7d,
    rankTrend7d,
    contributionScore,
    meaningfulSpRatio: Math.round(meaningfulSpRatio * 100),
    attendanceStreak,
    rank,
    cohortSize,
    totalSp,
    recentContributionSp,
    recentMeaningfulSp,
    recentTotalSp,
    daysOfActivity
  };

  if (daysOfActivity < 7) {
    return {
      personaId: 'learning',
      signals,
      unlockProgress: daysOfActivity,
      unlockTarget: 7,
      insufficient: true
    };
  }

  if (attendanceRate < 0.5 && spTrend7d < 0) {
    return { personaId: 'recovering_learner', signals, unlockProgress: 7, unlockTarget: 7 };
  }
  if (contributionScore >= 70 && meaningfulSpRatio >= 0.4) {
    return { personaId: 'contributor', signals, unlockProgress: 7, unlockTarget: 7 };
  }
  if (pollAttemptRate > 0.8) {
    return { personaId: 'curious_learner', signals, unlockProgress: 7, unlockTarget: 7 };
  }
  if (activityDiversityScore >= 0.66) {
    return { personaId: 'explorer', signals, unlockProgress: 7, unlockTarget: 7 };
  }
  if (rankPct <= 0.2 && meaningfulSpRatio >= 0.3 && totalSp > 0) {
    return { personaId: 'achiever', signals, unlockProgress: 7, unlockTarget: 7 };
  }
  if (attendanceStreak >= 5) {
    return { personaId: 'consistent_learner', signals, unlockProgress: 7, unlockTarget: 7 };
  }
  return { personaId: 'explorer', signals, unlockProgress: 7, unlockTarget: 7 };
}

export function getMissionProgress(personaId, profile, exp) {
  const signals = exp?.personaSignals;
  const persona = PERSONAS[personaId];
  if (!persona) return persona.mission;

  const totalSp = Number(profile?.student?.totalSp) || 0;
  const rank = Number(profile?.student?.rank) || 0;
  const cohortSize = Math.max(1, Number(profile?.student?.cohortSize) || 1);
  const attendanceStreak = Number(exp?.streakDays) || 0;

  switch (personaId) {
    case 'explorer': {
      const types = new Set();
      for (const t of profile?.transactions || []) {
        if (t && t.category) types.add(String(t.category).toLowerCase());
      }
      return { ...persona.mission, progress: Math.min(persona.mission.target, types.size || 1) };
    }
    case 'achiever': {
      const targetRank = Math.max(1, Math.round(cohortSize * 0.2));
      return {
        ...persona.mission,
        progress: rank > 0 && rank <= targetRank ? 1 : 0,
        target: targetRank
      };
    }
    case 'consistent_learner': {
      return { ...persona.mission, progress: Math.min(persona.mission.target, attendanceStreak) };
    }
    case 'curious_learner': {
      const polls = profile?.polls || [];
      let advanced = 0;
      for (const p of polls) {
        if (p && p.totalQuestions >= 3 && p.attemptedQuestions >= p.totalQuestions) advanced++;
      }
      return { ...persona.mission, progress: Math.min(persona.mission.target, advanced) };
    }
    case 'recovering_learner': {
      const recentAttended = (profile?.attendance || []).filter(a => a && a.qualified).length;
      return { ...persona.mission, progress: Math.min(persona.mission.target, recentAttended) };
    }
    case 'contributor': {
      const contributionKeywords = /peer|help|share|mentor|document|knowledge/i;
      let helps = 0;
      for (const t of profile?.transactions || []) {
        if (t && contributionKeywords.test(String(t.reason || '') + ' ' + String(t.category || ''))) helps++;
      }
      return { ...persona.mission, progress: Math.min(persona.mission.target, helps) };
    }
    default:
      return persona.mission;
  }
}