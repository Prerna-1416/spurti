import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MILESTONES = [3, 7, 15, 30, 60, 100];

interface StreakMilestoneProps {
  days: number;
  lastMilestone: number;
  isCelebrating?: boolean;
}

export function getNextMilestone(days: number): number {
  for (const m of MILESTONES) if (m > days) return m;
  return days;
}

export function isMilestoneToday(days: number): number | null {
  for (const m of MILESTONES) if (m === days) return m;
  return null;
}

export const StreakMilestone: React.FC<StreakMilestoneProps> = ({ days, isCelebrating }) => {
  const next = getNextMilestone(days);
  const pct = Math.max(0, Math.min(100, (days / next) * 100));
  const milestoneHit = isMilestoneToday(days);
  const milestoneLabel = milestoneHit
    ? `${milestoneHit}-DAY MILESTONE!`
    : days > 0 ? `${days} days and counting` : 'Start your streak today';

  return (
    <div className={'streak-milestone' + (isCelebrating ? ' is-celebrating' : '') + (milestoneHit ? ' is-milestone' : '')}>
      <div className="streak-milestone__flame" aria-hidden="true">
        <motion.span
          className="flame-core"
          animate={{
            scale: [1, 1.08, 0.96, 1],
            rotate: [-2, 2, -1, 0]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          🔥
        </motion.span>
        <AnimatePresence>
          {(isCelebrating || milestoneHit) && (
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="flame-ember"
                  initial={{ opacity: 0, y: 0, x: 0, scale: 0.4 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [-40 - (i % 4) * 10],
                    x: [(i - 6) * 6],
                    scale: [0.4, 1.2, 0.4]
                  }}
                  transition={{
                    duration: 1.6 + (i % 3) * 0.4,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 0.3
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="streak-milestone__meta">
        <span className="streak-milestone__count">{days}</span>
        <span className="streak-milestone__label">{days === 1 ? 'day streak' : 'day streak'}</span>
        <span className="streak-milestone__sub">{milestoneLabel}</span>
      </div>

      <div className="streak-milestone__progress">
        <div className="streak-milestone__bar">
          <motion.div
            className="streak-milestone__fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span className="streak-milestone__next">
          Next milestone: <b>{next}</b> days
        </span>
      </div>

      {milestoneHit && (
        <motion.div
          className="streak-milestone__badge"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        >
          🏆 Milestone {milestoneHit}
        </motion.div>
      )}
    </div>
  );
};