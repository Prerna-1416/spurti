import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_LABELS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MICRO_COPY = [
  'Every streak starts with a single day.',
  'Four days in — you are building momentum.',
  'A full week of showing up changes everything.',
  'Consistency is not flashy. It works.',
  'You are training your future self.',
  'Small daily wins compound into habits.'
];

const COPY_INTERVAL_MS = 4500;

interface WeeklyStreakTrackerProps {
  email: string;
  pollCompletedDates: string[];
  onCompleteToday?: () => void;
  doneToday?: boolean;
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

export const WeeklyStreakTracker: React.FC<WeeklyStreakTrackerProps> = ({
  pollCompletedDates, doneToday
}) => {
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => isoDate(today), [today]);
  const todayDow = today.getDay();
  const weekStart = useMemo(() => startOfWeek(today), [today]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const completedSet = useMemo(() => new Set(pollCompletedDates), [pollCompletedDates]);
  const completedThisWeek = days.filter(d => completedSet.has(isoDate(d))).length;
  const remaining = 7 - completedThisWeek;
  const isFullWeek = remaining === 0;

  const [hovered, setHovered] = useState<number | null>(null);
  const [copyIdx, setCopyIdx] = useState(() => Math.floor(Math.random() * MICRO_COPY.length));

  useEffect(() => {
    const id = setInterval(() => {
      setCopyIdx((i) => (i + 1) % MICRO_COPY.length);
    }, COPY_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const todayCompleted = completedSet.has(todayIso);

  return (
    <motion.section
      className="ws-heatmap lift"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1], delay: 0.06 }}
      aria-label="Weekly progress heatmap"
    >
      <div className="ws-heatmap__bg" aria-hidden="true" />
      <div className="ws-heatmap__noise" aria-hidden="true" />
      <div className="ws-heatmap__glow" aria-hidden="true" />

      {/* Header */}
      <header className="ws-heatmap__head">
        <div className="ws-heatmap__eyebrow">
          <motion.span
            className="ws-heatmap__spark"
            aria-hidden="true"
            animate={{ scale: [1, 1.16, 1], rotate: [0, 12, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {'\u2728'}
          </motion.span>
          <span>{isFullWeek ? 'Perfect week' : 'Your weekly rhythm'}</span>
        </div>
        <div className="ws-heatmap__head-count" aria-live="polite">
          <span className="ws-heatmap__head-count-val">{completedThisWeek}</span>
          <span className="ws-heatmap__head-count-target">/7</span>
        </div>
      </header>

      {/* Hero — SVG checkmark + microcopy */}
      <div className="ws-heatmap__hero">
        <div className="ws-heatmap__check-wrap">
          <motion.div
            className="ws-heatmap__check-aura"
            aria-hidden="true"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
          />
          <motion.div
            className="ws-heatmap__check-aura ws-heatmap__check-aura--ring"
            aria-hidden="true"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1], delay: 0.35 }}
          />
          <motion.div
            className="ws-heatmap__check-core"
            initial={false}
            animate={todayCompleted ? { scale: [0.6, 1.18, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          >
            <svg viewBox="0 0 72 72" className="ws-heatmap__check-svg" aria-hidden="true">
              <defs>
                <linearGradient id="ws-check-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#FDE68A" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="36" cy="36" r="28"
                fill="none"
                stroke="url(#ws-check-grad)"
                strokeOpacity="0.35"
                strokeWidth="1.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
              />
              <motion.path
                d="M22 36 L32 46 L50 26"
                stroke="url(#ws-check-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1], delay: 0.55 }}
              />
            </svg>
            {!todayCompleted && (
              <motion.span
                className="ws-heatmap__check-pulse"
                aria-hidden="true"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </motion.div>
        </div>

        <div className="ws-heatmap__hero-text">
          <h3 className="ws-heatmap__title">
            {todayCompleted ? 'Today\u2019s done.' : 'Show up today'}
          </h3>
          <div className="ws-heatmap__microcopy-shell" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={copyIdx}
                className="ws-heatmap__microcopy"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
              >
                {MICRO_COPY[copyIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Heatmap cells */}
      <div className="ws-heatmap__row" role="list">
        {days.map((d, i) => {
          const isToday = isoDate(d) === todayIso;
          const isFuture = i > todayDow && !isToday;
          const isCompleted = completedSet.has(isoDate(d));
          const dayLabel = DAY_LABELS_FULL[i];
          let tooltip = '';
          if (isCompleted) tooltip = `${dayLabel} completed`;
          else if (isToday && doneToday) tooltip = `${dayLabel} \u2014 done today`;
          else if (isToday) tooltip = `${dayLabel} \u2014 today`;
          else if (isFuture) tooltip = `${dayLabel} \u2014 upcoming`;

          return (
            <div
              key={i}
              role="listitem"
              className={
                'ws-cell' +
                (isCompleted ? ' is-completed' : '') +
                (isToday ? ' is-today' : '') +
                (isFuture ? ' is-future' : '')
              }
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered((h) => (h === i ? null : h))}
              tabIndex={isFuture ? -1 : 0}
              aria-label={tooltip}
            >
              <div className="ws-cell__block">
                {isToday && !isCompleted && (
                  <>
                    <motion.span
                      className="ws-cell__halo"
                      aria-hidden="true"
                      animate={{ scale: [1, 1.25, 1], opacity: [0.55, 0, 0.55] }}
                      transition={{ duration: 2.0, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <span className="ws-cell__halo-ring" aria-hidden="true" />
                  </>
                )}
                {isCompleted && (
                  <motion.svg
                    viewBox="0 0 16 16"
                    width="14"
                    height="14"
                    className="ws-cell__check"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.06 * i }}
                    aria-hidden="true"
                  >
                    <motion.path
                      d="M3.5 8.5 L7 12 L13 4.5"
                      stroke="#FFFFFF"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </motion.svg>
                )}
              </div>
              <span className="ws-cell__label">{DAY_LABELS_SHORT[i]}</span>

              <AnimatePresence>
                {hovered === i && tooltip && (
                  <motion.span
                    className="ws-cell__tooltip"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                    role="tooltip"
                  >
                    {tooltip}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="ws-heatmap__foot">
        <div className="ws-heatmap__legend">
          <span className="ws-heatmap__legend-chip ws-heatmap__legend-chip--done" />
          <em>Completed</em>
          <span className="ws-heatmap__legend-chip ws-heatmap__legend-chip--today" />
          <em>Today</em>
          <span className="ws-heatmap__legend-chip ws-heatmap__legend-chip--future" />
          <em>Upcoming</em>
        </div>
        {remaining > 0 ? (
          <span className="ws-heatmap__hint">
            {remaining} {remaining === 1 ? 'day' : 'days'} to a perfect week
          </span>
        ) : (
          <motion.span
            className="ws-heatmap__hint ws-heatmap__hint--win"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            All 7 days. Beautifully done.
          </motion.span>
        )}
      </footer>
    </motion.section>
  );
};
