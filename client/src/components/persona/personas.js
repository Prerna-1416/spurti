export const PERSONA_ACCENTS = {
  cyan:    { ring: '#0D9488', fill: 'rgba(13, 148, 136, 0.16)', text: '#5EEAD4', bar: '#0D9488', chip: 'rgba(13, 148, 136, 0.2)' },
  amber:   { ring: '#D97706', fill: 'rgba(217, 119, 6, 0.16)',  text: '#FCD34D', bar: '#D97706', chip: 'rgba(217, 119, 6, 0.2)' },
  emerald: { ring: '#059669', fill: 'rgba(5, 150, 105, 0.16)',  text: '#6EE7B7', bar: '#059669', chip: 'rgba(5, 150, 105, 0.2)' },
  blue:    { ring: '#6366F1', fill: 'rgba(99, 102, 241, 0.16)',  text: '#A5B4FC', bar: '#6366F1', chip: 'rgba(99, 102, 241, 0.2)' },
  coral:   { ring: '#D4653F', fill: 'rgba(212, 101, 63, 0.16)',  text: '#FDBA74', bar: '#D4653F', chip: 'rgba(212, 101, 63, 0.2)' },
  rose:    { ring: '#BE185D', fill: 'rgba(190, 24, 93, 0.16)',   text: '#F9A8D4', bar: '#BE185D', chip: 'rgba(190, 24, 93, 0.2)' }
};

export const PERSONAS = {
  explorer: {
    id: 'explorer',
    label: 'Explorer',
    emoji: '🧭',
    description: 'You try many different activities and learn broadly.',
    accent: 'cyan',
    gradient: 'linear-gradient(135deg, #0D9488, #0F766E)',
    mission: { text: 'Complete 3 new activity types this week', progress: 0, target: 3 }
  },
  achiever: {
    id: 'achiever',
    label: 'Achiever',
    emoji: '🏆',
    description: 'You chase the top of the leaderboard with focus.',
    accent: 'amber',
    gradient: 'linear-gradient(135deg, #D97706, #B45309)',
    mission: { text: 'Reach Top 20 in your cohort', progress: 0, target: 1 }
  },
  consistent_learner: {
    id: 'consistent_learner',
    label: 'Consistent Learner',
    emoji: '🔥',
    description: 'You show up every day. The chain is your superpower.',
    accent: 'emerald',
    gradient: 'linear-gradient(135deg, #059669, #065F46)',
    mission: { text: "Maintain your streak — don't break the chain", progress: 0, target: 7 }
  },
  curious_learner: {
    id: 'curious_learner',
    label: 'Curious Learner',
    emoji: '🔍',
    description: 'You dive into every poll and ask sharp questions.',
    accent: 'blue',
    gradient: 'linear-gradient(135deg, #6366F1, #4338CA)',
    mission: { text: 'Answer 2 advanced polls this week', progress: 0, target: 2 }
  },
  recovering_learner: {
    id: 'recovering_learner',
    label: 'Recovering Learner',
    emoji: '🌱',
    description: 'You are bouncing back. One session at a time.',
    accent: 'coral',
    gradient: 'linear-gradient(135deg, #D4653F, #9C3411)',
    mission: { text: 'Attend your next 3 sessions to bounce back', progress: 0, target: 3 }
  },
  contributor: {
    id: 'contributor',
    label: 'Contributor',
    emoji: '🤝',
    description: 'You lift others up while you learn. The cohort is stronger because of you.',
    accent: 'rose',
    gradient: 'linear-gradient(135deg, #BE185D, #831843)',
    mission: { text: 'Help 2 teammates this week', progress: 0, target: 2 }
  },
  learning: {
    id: 'learning',
    label: 'Learning Your Style',
    emoji: '🔍',
    description: 'We are still learning how you learn. Your AI persona unlocks after 7 days of activity.',
    accent: 'rose',
    gradient: 'linear-gradient(135deg, #57534E, #292524)',
    mission: { text: 'Keep showing up — your persona unlocks soon', progress: 0, target: 7 }
  }
};