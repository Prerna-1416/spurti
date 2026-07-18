import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AICompanionHeaderProps {
  studentName: string;
  personaLabel?: string;
  personaEmoji?: string;
  onPersonaClick?: () => void;
  hasPersona?: boolean;
  totalSp?: number;
  streakDays?: number;
}

const MICRO_QUOTES = [
  'Every expert was once a beginner.',
  'Small progress becomes big success.',
  'Learning compounds. One session today is enough.',
  'Show up. The rest takes care of itself.',
  'You are building momentum, one day at a time.',
  'Consistency is the quiet superpower.',
  'Today\u2019s effort is tomorrow\u2019s edge.'
];

const QUOTE_INTERVAL_MS = 5200;
const SPARKLE = '\u2728';

function pickGreeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return 'Burning the midnight oil';
  return 'Welcome back';
}

function pickFirstName(name: string): string {
  if (!name) return 'friend';
  const cleaned = String(name).trim();
  const first = cleaned.split(/\s+/)[0];
  return first || cleaned;
}

export const AICompanionHeader: React.FC<AICompanionHeaderProps> = ({
  studentName,
  personaLabel,
  personaEmoji,
  onPersonaClick,
  hasPersona = false,
  totalSp = 0,
  streakDays = 0
}) => {
  const greeting = useMemo(() => pickGreeting(), []);
  const firstName = useMemo(() => pickFirstName(studentName), [studentName]);

  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * MICRO_QUOTES.length));
  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % MICRO_QUOTES.length);
    }, QUOTE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.section
      className="ai-companion"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      aria-label="AI companion greeting"
    >
      <div className="ai-companion__halo" aria-hidden="true" />

      <div className="ai-companion__copy">
        <h1 className="ai-companion__hello">
          <motion.span
            className="ai-companion__wave"
            aria-hidden="true"
            animate={{ rotate: [0, 14, -8, 14, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3.4, ease: 'easeInOut' }}
          >
            {'\u{1F44B}'}
          </motion.span>
          <span className="ai-companion__greeting">{greeting}, </span>
          <span className="ai-companion__name">{firstName}</span>
        </h1>

        <div className="ai-companion__quote-shell" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={quoteIdx}
              className="ai-companion__quote"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
            >
              <span className="ai-companion__quote-mark" aria-hidden="true">{'\u201C'}</span>
              {MICRO_QUOTES[quoteIdx]}
              <span className="ai-companion__quote-mark ai-companion__quote-mark--end" aria-hidden="true">{'\u201D'}</span>
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="ai-companion__side">
        {streakDays > 0 && (
          <div className="ai-companion__stat" aria-label={`Streak: ${streakDays} days`}>
            <span className="ai-companion__stat-dot ai-companion__stat-dot--amber" aria-hidden="true" />
            <span className="ai-companion__stat-value">{streakDays}</span>
            <span className="ai-companion__stat-label">day streak</span>
          </div>
        )}

        <button
          type="button"
          className="ai-companion__persona"
          onClick={onPersonaClick}
          aria-label="Open AI Persona details"
          title="Tap to view your AI persona"
        >
          <span className="ai-companion__persona-emoji" aria-hidden="true">
            {personaEmoji || SPARKLE}
          </span>
          <span className="ai-companion__persona-text">
            <strong>{hasPersona ? (personaLabel || 'AI Persona') : 'AI Persona'}</strong>
            <em>Tap to view</em>
          </span>
          <motion.span
            className="ai-companion__sparkle"
            aria-hidden="true"
            animate={{ opacity: [0.4, 1, 0.4], rotate: [0, 14, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {SPARKLE}
          </motion.span>
        </button>
      </div>
    </motion.section>
  );
};