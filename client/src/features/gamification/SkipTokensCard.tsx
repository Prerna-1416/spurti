import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GamificationState,
  SKIP_TOKENS_PER_MONTH,
  consumeSkipToken,
  getCurrentMonthKey,
  getSkipTokensRemaining,
  saveState
} from './storage';

interface SkipTokensCardProps {
  email: string;
  hasQuizToday: boolean;
  onSkip?: () => void;
  state: GamificationState;
  setState: React.Dispatch<React.SetStateAction<GamificationState>>;
}

export const SkipTokensCard: React.FC<SkipTokensCardProps> = ({ email, hasQuizToday, onSkip, state, setState }) => {
  const [justUsed, setJustUsed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const remaining = useMemo(() => getSkipTokensRemaining(state), [state]);
  const monthName = useMemo(() => {
    const d = new Date(`${getCurrentMonthKey()}-01T00:00:00`);
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [state.skipTokens.monthKey]);

  const handleSkip = () => {
    if (!hasQuizToday) return;
    if (remaining <= 0) return;
    const { state: next, ok } = consumeSkipToken(state);
    if (!ok) return;
    setState(next);
    saveState(email, next);
    setJustUsed(true);
    setConfirming(false);
    setTimeout(() => setJustUsed(false), 1600);
    onSkip?.();
  };

  return (
    <div className={'gamify-card gamify-card--skip' + (remaining === 0 ? ' is-empty' : '')}>
      <div className="gamify-card__icon" aria-hidden="true">
        <span className="skip-tokens-icon">⏭</span>
      </div>
      <div className="gamify-card__body">
        <span className="gamify-card__eyebrow">Action Budget · {monthName}</span>
        <h3 className="gamify-card__title">
          {remaining > 0
            ? `${remaining} of ${SKIP_TOKENS_PER_MONTH} skip tokens left`
            : 'No skip tokens left this month'}
        </h3>
        <p className="gamify-card__lede">
          Use a token to bypass today's quiz without breaking your streak.
          Tokens refill on the 1st of each month.
        </p>

        <div className="skip-chips" role="group" aria-label="Skip tokens">
          {Array.from({ length: SKIP_TOKENS_PER_MONTH }).map((_, i) => {
            const used = i < state.skipTokens.used;
            return (
              <motion.span
                key={i}
                className={'skip-chip' + (used ? ' is-used' : '')}
                initial={false}
                animate={justUsed && i === state.skipTokens.used - 1 ? { scale: [1, 1.3, 0.9], rotate: [0, 8, 0] } : {}}
                transition={{ duration: 0.5 }}
                title={used ? 'Used this month' : 'Available'}
              >
                {used ? '✕' : '◉'}
              </motion.span>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {!confirming ? (
            <motion.button
              key="use-btn"
              type="button"
              className="skip-btn"
              onClick={() => setConfirming(true)}
              disabled={remaining === 0 || !hasQuizToday}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!hasQuizToday
                ? 'No quiz today'
                : remaining === 0
                  ? 'Out of skips — wait for next month'
                  : 'Use a skip token'}
            </motion.button>
          ) : (
            <motion.div
              key="confirm"
              className="skip-confirm"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              <span>Use one of your {remaining} tokens for today's quiz?</span>
              <div className="skip-confirm__actions">
                <button type="button" className="skip-confirm__yes" onClick={handleSkip}>Yes, skip it</button>
                <button type="button" className="skip-confirm__no" onClick={() => setConfirming(false)}>Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {state.skipTokens.history.length > 0 && (
          <details className="skip-history">
            <summary>Previous months</summary>
            <ul>
              {state.skipTokens.history.slice().reverse().map(h => (
                <li key={h.monthKey}>
                  <span>{h.monthKey}</span>
                  <span>{h.used} of {SKIP_TOKENS_PER_MONTH} used</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
      <AnimatePresence>
        {justUsed && (
          <motion.div
            className="skip-flash"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            Skipped for today ✓
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};