// Persona-driven suggestion generator.
// Returns an array of { id, label, accent, reason } objects that fit the
// current persona + the student's actual recent activity signals.
//
// Kept as a pure function so the rule engine can be swapped for ML later.

const PERSONA_TIPS = {
  explorer: [
    'Try a different session tomorrow — pick one you have not attended yet.',
    'Post a question in the chat this week — your curiosity is your strength.',
    'Pick one new activity type (e.g. document a session or help a peer) and try it once.'
  ],
  achiever: [
    'You are close to the next rank — every +5 SP this week gets you there.',
    'Attend tomorrow\'s session in full to bank the +10 attendance credit.',
    'Skip the easy "+5" actions this week — meaningful actions compound faster.'
  ],
  consistent_learner: [
    "Don't break the chain — your streak is your biggest edge.",
    'Show up tomorrow even if it is only for the first 10 minutes.',
    'Check off one attendance tomorrow to extend your streak to {next}.'
  ],
  curious_learner: [
    'Answer the next poll with a one-sentence justification — depth > speed.',
    'Read one of the optional readings mentioned in this week\'s session.',
    'Try answering a poll before scrolling the chat — depth compounds.'
  ],
  recovering_learner: [
    'Show up to your next session — that is all it takes today.',
    'Don\'t worry about rank right now. Just one attendance to reset the trend.',
    'Skip the leaderboard for a week. Focus only on showing up.'
  ],
  contributor: [
    'Help one teammate today — even a 5-minute reply counts.',
    'Document what you learned in 3 bullets — your cohort benefits from it.',
    'Reply thoughtfully to one poll discussion today (not just upvote).'
  ],
  learning: [
    'Show up for 7 days in a row to unlock your AI persona.',
    'Mix different activity types (attendance + polls + docs) to learn your style.',
    'Keep your streak alive — your persona calibrates on consistency.'
  ]
};

const PERSONA_ACCOUNTS = {
  explorer:           '#06B6D4',
  achiever:           '#F59E0B',
  consistent_learner: '#10B981',
  curious_learner:    '#3B82F6',
  recovering_learner: '#FB923C',
  contributor:        '#E11D48',
  learning:           '#7C3AED'
};

function pickTips(personaId, signals = {}) {
  const tips = PERSONA_TIPS[personaId] || PERSONA_TIPS.learning;
  if (!tips || tips.length === 0) return [];

  if (personaId === 'consistent_learner' && typeof signals.attendanceStreak === 'number') {
    return tips.map(t => t.replace('{next}', String(signals.attendanceStreak + 1)));
  }
  return tips;
}

export function generatePersonaSuggestions(profile, classification) {
  if (!profile || !classification) return [];
  const personaId = classification.personaId || 'learning';
  const signals = classification.signals || {};
  const tips = pickTips(personaId, signals);

  const pool = [];
  const accent = PERSONA_ACCOUNTS[personaId] || '#7C3AED';

  for (let i = 0; i < tips.length; i++) {
    pool.push({
      id: `${personaId}-${i}`,
      label: tips[i],
      accent,
      reason: personaId,
      source: 'persona'
    });
  }

  const extras = [];

  if (signals.attendanceStreak != null && personaId !== 'consistent_learner' && personaId !== 'learning') {
    extras.push({
      id: 'streak-context',
      label: `Your streak is ${signals.attendanceStreak} day${signals.attendanceStreak === 1 ? '' : 's'}. Keep it going tomorrow.`,
      accent: '#10B981',
      reason: 'streak',
      source: 'signal'
    });
  }

  if (signals.contributionScore >= 70 && personaId !== 'contributor') {
    extras.push({
      id: 'contribute-context',
      label: 'You have a high contribution score this week. Keep documenting and helping peers.',
      accent: '#E11D48',
      reason: 'contribution',
      source: 'signal'
    });
  }

  if (signals.spTrend7d != null && signals.spTrend7d < 0 && personaId !== 'recovering_learner') {
    extras.push({
      id: 'sp-trend-context',
      label: `Your SP trend this week is ${signals.spTrend7d}. One full attendance tomorrow flips it.`,
      accent: '#FB923C',
      reason: 'trend',
      source: 'signal'
    });
  }

  return [...pool, ...extras].slice(0, 5);
}