import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GamificationState,
  SKIP_TOKENS_PER_MONTH,
  computeStreakStatus,
  formatCountdown,
  getSkipTokensRemaining,
  isPollDoneToday,
  loadState,
  recordPollCompletion,
  saveState,
  timeUntilMidnight
} from './storage';

interface StreakCardProps {
  email: string;
  hasPollsToday: boolean;
  onComplete?: () => void;
  state: GamificationState;
  setState: React.Dispatch<React.SetStateAction<GamificationState>>;
}

export const StreakCard: React.FC<StreakCardProps> = ({ email, hasPollsToday, onComplete, state, setState }) => {
  const [tick, setTick] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = useMemo(() => timeUntilMidnight(), [tick]);
  const status = useMemo(() => computeStreakStatus(state), [state]);
  const doneToday = useMemo(() => isPollDoneToday(state), [state]);

  const handleComplete = () => {
    const next = recordPollCompletion(state);
    setState(next);
    saveState(email, next);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
    onComplete?.();
  };

  const broken = status.broken;
  const canComplete = !doneToday && !broken;
  const streakDisplay = broken ? 0 : state.currentStreak;

  return (
    <div className={'gamify-card gamify-card--streak' + (doneToday ? ' is-completed' : '') + (broken ? ' is-broken' : '')}>
      <div className="gamify-card__icon" aria-hidden="true">
        <span className="flame">🔥</span>
        <span className="streak-count">{streakDisplay}</span>
      </div>
      <div className="gamify-card__body">
        <span className="gamify-card__eyebrow">Time-limited Streak</span>
        <h3 className="gamify-card__title">
          {doneToday
            ? `Streak locked in for today`
            : broken
              ? `Streak broken at ${state.longestStreak} days`
              : `${streakDisplay}-day streak — keep it alive`}
        </h3>
        <p className="gamify-card__lede">
          Complete today's micro-lesson before midnight or your {state.longestStreak || streakDisplay}-day streak resets.
        </p>
        <div className="streak-countdown" aria-live="polite">
          <span className="streak-countdown__label">Resets in</span>
          <span className="streak-countdown__value">{formatCountdown(countdown)}</span>
        </div>
        <div className="streak-actions">
          <button
            type="button"
            className="streak-btn"
            onClick={handleComplete}
            disabled={!canComplete}
          >
            {doneToday ? '✓ Done for today' : broken ? 'Restart streak' : "Complete today's micro-lesson"}
          </button>
          <span className="streak-meta">
            Longest: <b>{state.longestStreak}</b>
          </span>
        </div>
      </div>
      <AnimatePresence>
        {justSaved && (
          <motion.div
            className="streak-celebrate"
            initial={{ opacity: 0, scale: 0.6, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -20 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
          >
            +1 day 🔥
          </motion.div>
        )}
      </AnimatePresence>
      {!hasPollsToday && !doneToday && !broken && (
        <p className="gamify-card__hint">No poll is open right now — your streak stays safe until one opens.</p>
      )}
    </div>
  );
};