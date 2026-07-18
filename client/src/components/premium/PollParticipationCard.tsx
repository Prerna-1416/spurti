import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface PollParticipationCardProps {
  email: string;
  pollCompletedDates: string[];
  onClaim: (sp: number) => void;
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(d.getDate() - day);
  return out;
}
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const PollParticipationCard: React.FC<PollParticipationCardProps> = ({
  pollCompletedDates,
  onClaim
}) => {
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => isoDate(today), [today]);
  const todayDow = today.getDay();
  const weekStart = useMemo(() => startOfWeek(today), [today]);
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const completedSet = useMemo(() => new Set(pollCompletedDates), [pollCompletedDates]);
  const completedThisWeek = useMemo(
    () => weekDays.filter(d => completedSet.has(isoDate(d))).length,
    [weekDays, completedSet]
  );
  const doneToday = completedSet.has(todayIso);

  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(doneToday);

  const handleClaim = () => {
    if (claiming || claimed) return;
    setClaiming(true);
    onClaim(10);
    setTimeout(() => {
      setClaiming(false);
      setClaimed(true);
    }, 900);
  };

  return (
    <motion.div
      className={'pp-card' + (claimed ? ' is-claimed' : '')}
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      <div className="pp-card__bg" aria-hidden="true" />
      <div className="pp-card__stars" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.span
            key={i}
            className="pp-card__star"
            animate={{ opacity: [0.1, 0.9, 0.1], scale: [0.6, 1.2, 0.6] }}
            transition={{
              duration: 2 + (i % 3) * 0.6,
              delay: (i * 0.35) % 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              left: `${6 + (i * 11) % 88}%`,
              top: `${8 + (i * 17) % 85}%`
            }}
          >✦</motion.span>
        ))}
      </div>

      {/* Header: "🗳 Your Voice Matters" */}
      <header className="pp-card__head">
        <div className="pp-card__eyebrow">
          <span className="pp-card__icon" aria-hidden="true">{'\uD83D\uDDF3'}</span>
          <span>Your Voice Matters</span>
        </div>
        <motion.span
          className="pp-card__head-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Help shape tomorrow\u2019s sessions.
        </motion.span>
      </header>

      {/* SVG speech bubbles + text */}
      <div className="pp-card__hero">
        <motion.div
          className="pp-card__speech"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          <svg viewBox="0 0 64 56" className="pp-card__speech-svg" aria-hidden="true">
            <defs>
              <linearGradient id="pp-sg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
              <linearGradient id="pp-sg2" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            {/* Bubble 1 */}
            <motion.path
              d="M10 18 C10 10 18 4 28 4 L36 4 C46 4 54 10 54 18 L54 30 C54 38 46 44 36 44 L34 44 L28 50 L28 44 C18 44 10 38 10 30 Z"
              fill="none"
              stroke="url(#pp-sg1)"
              strokeWidth="1.8"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.0, ease: 'easeOut', delay: 0.1 }}
            />
            {/* Bubble 2 overlapping */}
            <motion.path
              d="M4 24 C4 18 10 14 18 14 L20 14"
              fill="none"
              stroke="url(#pp-sg2)"
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
            />
            <motion.path
              d="M46 14 C54 14 60 18 60 24 L60 34 C60 40 54 44 46 44 L44 44 L40 48 L40 44 C34 44 30 40 30 34"
              fill="none"
              stroke="url(#pp-sg2)"
              strokeWidth="1.6"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            />
            {/* Connecting dots */}
            <motion.circle cx="24" cy="20" r="2" fill="#67e8f9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} />
            <motion.circle cx="40" cy="20" r="2" fill="#7dd3fc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
            <motion.circle cx="32" cy="30" r="2" fill="#38bdf8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} />
          </svg>
          {!claimed && (
            <motion.span
              className="pp-card__speech-pulse"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </motion.div>

        <div className="pp-card__hero-text">
          <motion.h3
            className="pp-card__title"
            key={claimed ? 'done' : 'pending'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {claimed ? 'Thanks for voting!' : 'Poll your perspective'}
          </motion.h3>
          <p className="pp-card__lede">
            {claimed
              ? 'Every response helps refine tomorrow\u2019s sessions.'
              : 'Your honest answers make the cohort stronger.'}
          </p>
        </div>
      </div>

      {/* Conversation Node Tracker — horizontal rail */}
      <div className="pp-card__nodes">
        <div className="pp-card__nodes-label">
          <span>Weekly participation</span>
          <span className="pp-card__nodes-count">
            <b>{completedThisWeek}</b> of 7
          </span>
        </div>
        <div className="pp-card__nodes-rail">
          {weekDays.map((d, i) => {
            const isFuture = i > todayDow && isoDate(d) !== todayIso;
            const isToday = isoDate(d) === todayIso;
            const isCompleted = completedSet.has(isoDate(d));
            return (
              <React.Fragment key={i}>
                {/* Connecting line between nodes */}
                {i > 0 && (
                  <motion.div
                    className={'pp-node-line' + (isCompleted || (i - 1 < weekDays.length && completedSet.has(isoDate(weekDays[i - 1])) && (isCompleted || isToday)) ? ' is-active' : '')}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  />
                )}
                <motion.div
                  className={
                    'pp-node' +
                    (isCompleted ? ' is-completed' : '') +
                    (isToday && !isCompleted ? ' is-current' : '') +
                    (isFuture ? ' is-future' : '') +
                    (isToday && isCompleted ? ' is-completed is-current' : '')
                  }
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 20 }}
                  title={isCompleted ? 'Completed' : isToday ? 'Today' : 'Upcoming'}
                >
                  <span className="pp-node__label">{DAY_LABELS[i]}</span>
                  <div className="pp-node__mark">
                    {isCompleted ? (
                      <motion.svg viewBox="0 0 16 16" width="10" height="10" fill="none">
                        <motion.path
                          d="M3.5 8.5 L7 12 L13 4"
                          stroke="#FFFFFF"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                      </motion.svg>
                    ) : isToday ? (
                      <motion.span
                        className="pp-node__pulse"
                        animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      />
                    ) : (
                      <span className="pp-node__dot" />
                    )}
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Vote Now button with intense blue glow */}
      <div className="pp-card__action">
        <div className="pp-card__action-glow" aria-hidden="true" />
        <div className="pp-card__action-meta">
          <span className="pp-card__action-eyebrow">Today\u2019s Bonus</span>
          <motion.div
            className="pp-card__action-sp"
            animate={claiming ? { scale: [1, 1.3, 0.8, 1.1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <span>+10</span>
            <span className="pp-card__action-sp-label">SP</span>
          </motion.div>
        </div>
        <motion.button
          type="button"
          className={'pp-card__vote-btn' + (claimed ? ' is-claimed' : '') + (claiming ? ' is-claiming' : '')}
          onClick={handleClaim}
          disabled={claimed || claiming}
          whileHover={claimed ? {} : { scale: 1.04 }}
          whileTap={claimed ? {} : { scale: 0.95 }}
        >
          <span className="pp-card__vote-btn-glow" aria-hidden="true" />
          <span className="pp-card__vote-btn-beam" aria-hidden="true" />
          {claimed ? (
            <span className="pp-card__vote-btn-label">
              <span className="pp-card__vote-btn-icon">{'\u2713'}</span>
              <span>Submitted</span>
            </span>
          ) : (
            <span className="pp-card__vote-btn-label">
              <span>Vote Now</span>
              <motion.span
                className="pp-card__vote-btn-arrow"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >{'\u2192'}</motion.span>
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
