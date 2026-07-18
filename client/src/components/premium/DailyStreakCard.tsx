import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyStreakCardProps {
  streakDays: number;
  bestStreak: number;
  onClaimMilestone?: (milestone: number, sp: number) => void;
}

const MILESTONES = [
  { days: 3,   sp: 20,  label: '3 Days' },
  { days: 7,   sp: 40,  label: '7 Days' },
  { days: 15,  sp: 75,  label: '15 Days' },
  { days: 30,  sp: 150, label: '30 Days' },
  { days: 100, sp: 300, label: '100 Days' }
];

function pickMessage(days: number, best: number): { title: string; tagline: string } {
  if (days === 0) return { title: 'Start your streak today', tagline: 'One day. That is all it takes.' };
  if (days === 1) return { title: 'Day one — well begun!', tagline: 'Come back tomorrow to keep it going.' };
  if (days === 2) return { title: "You're on Fire!", tagline: 'Two days down. The flame is alive.' };
  if (days < 7)  return { title: 'Burning Bright!',       tagline: `${days} days and counting.` };
  if (days < 15) return { title: 'Week-Long Inferno!',    tagline: 'A full week of consistency.' };
  if (days < 30) return { title: 'Blazing Trail!',        tagline: 'You are rewriting the rules.' };
  if (days < 100) return { title: 'Legendary Inferno!',    tagline: `${days} days. Pure willpower.` };
  return { title: 'Mythic Flame!', tagline: `${days} days. Beyond legendary.` };
}

function nextMilestone(days: number): number | null {
  for (const m of MILESTONES) if (m.days > days) return m.days;
  return null;
}

export const DailyStreakCard: React.FC<DailyStreakCardProps> = ({
  streakDays,
  bestStreak,
  onClaimMilestone
}) => {
  const msg = useMemo(() => pickMessage(streakDays, bestStreak), [streakDays, bestStreak]);
  const next = useMemo(() => nextMilestone(streakDays), [streakDays]);
  const nextSp = useMemo(() => MILESTONES.find(m => m.days === next)?.sp || 0, [next]);
  const currentTier = useMemo(() => {
    if (streakDays >= 100) return MILESTONES[4];
    if (streakDays >= 30)  return MILESTONES[3];
    if (streakDays >= 15)  return MILESTONES[2];
    if (streakDays >= 7) return MILESTONES[1];
    if (streakDays >= 3) return MILESTONES[0];
    return null;
  }, [streakDays]);

  return (
    <motion.div
      className="ds-card"
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      <div className="ds-card__bg" aria-hidden="true" />
      <div className="ds-card__stars" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.span
            key={i}
            className="ds-card__star"
            animate={{ opacity: [0.1, 1, 0.1], scale: [0.6, 1.4, 0.6] }}
            transition={{
              duration: 1.8 + (i % 3) * 0.5,
              delay: (i * 0.25) % 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              left: `${4 + (i * 9.5) % 92}%`,
              top: `${6 + (i * 13) % 88}%`
            }}
          >✦</motion.span>
        ))}
      </div>
      <div className="ds-card__embers" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            className="ds-card__ember"
            animate={{
              y: [0, -90, -180, -260],
              x: [(i - 6) * 6, (i - 6) * 12, (i - 6) * 8, (i - 6) * 4],
              opacity: [0, 1, 0.8, 0],
              scale: [0.4, 1, 0.8, 0.5]
            }}
            transition={{
              duration: 3.4 + (i % 4) * 0.6,
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'easeOut'
            }}
            style={{
              left: `${30 + (i * 5) % 40}%`,
              bottom: '20%'
            }}
          />
        ))}
      </div>

      <div className="ds-card__head">
        <div className="ds-card__eyebrow">
          <span className="ds-card__fire-mini">🔥</span>
          <span>Daily Streak</span>
        </div>
        <AnimatePresence>
          {currentTier && (
            <motion.div
              className="ds-card__tier-badge"
              key={currentTier.days}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            >
              <span aria-hidden="true">🏆</span>
              <span>{currentTier.label}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="ds-card__hero">
        <div className="ds-card__count-block">
          <motion.div
            className="ds-card__count-row"
            key={streakDays}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
          >
            <span className="ds-card__count-number">{streakDays}</span>
            <span className="ds-card__count-label">days</span>
          </motion.div>
          <motion.h3
            className="ds-card__title"
            key={msg.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {msg.title}
          </motion.h3>
          <p className="ds-card__lede">{msg.tagline}</p>
        </div>

        <div className="ds-card__flame-wrap">
          <div className="ds-card__flame-glow" aria-hidden="true" />
          <motion.div
            className="ds-card__flame"
            animate={{
              scale: [1, 1.06, 0.97, 1.02, 1],
              rotate: [-2, 2, -1, 1, 0],
              y: [0, -2, 0, -1, 0]
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="ds-card__flame-emoji" aria-hidden="true">🔥</span>
          </motion.div>
          <div className="ds-card__flame-ring" aria-hidden="true" />
        </div>
      </div>

      <div className="ds-card__stats">
        <div className="ds-card__stat-cell">
          <span className="ds-card__stat-eyebrow">Best Streak</span>
          <div className="ds-card__stat-value">
            <motion.span
              key={bestStreak}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            >
              {bestStreak}
            </motion.span>
            <span className="ds-card__stat-unit">days</span>
          </div>
          <span className="ds-card__stat-sub">personal record</span>
        </div>

        <div className="ds-card__ring-wrap">
          <svg viewBox="0 0 80 80" className="ds-card__ring">
            <defs>
              <linearGradient id="ds-ring-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r="32" stroke="rgba(254, 215, 170, 0.2)" strokeWidth="6" fill="none" />
            <motion.circle
              cx="40" cy="40" r="32"
              stroke="url(#ds-ring-grad)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="201"
              initial={{ strokeDashoffset: 201 }}
              animate={{ strokeDashoffset: 201 - (201 * (next ? Math.min(100, (streakDays / next) * 100) : 100)) / 100 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', filter: 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.6))' }}
            />
            <text x="40" y="38" textAnchor="middle" fontSize="14" fontWeight="900" fill="#fef3c7">
              {next ? `${streakDays}/${next}` : 'MAX'}
            </text>
            <text x="40" y="52" textAnchor="middle" fontSize="8" fontWeight="700" fill="rgba(254, 215, 170, 0.7)">
              {next ? 'to next' : 'legendary'}
            </text>
          </svg>
        </div>
      </div>

      <div className="ds-card__milestones">
        <span className="ds-card__milestones-label">Milestones</span>
        <div className="ds-card__milestone-row">
          {MILESTONES.map(m => {
            const reached = streakDays >= m.days;
            const isCurrent = next === m.days;
            return (
              <motion.div
                key={m.days}
                className={
                  'ds-milestone' +
                  (reached ? ' is-reached' : '') +
                  (isCurrent ? ' is-current' : '')
                }
                whileHover={{ y: -2 }}
              >
                <span className="ds-milestone__days">{m.days}</span>
                <span className="ds-milestone__sp">+{m.sp}</span>
                {isCurrent && (
                  <motion.span
                    className="ds-milestone__pulse"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                {reached && <span className="ds-milestone__check" aria-hidden="true">✓</span>}
              </motion.div>
            );
          })}
        </div>
      </div>

      {next && (
        <motion.button
          type="button"
          className="ds-card__btn"
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onClaimMilestone?.(next, nextSp)}
        >
          <span className="ds-card__btn-shine" aria-hidden="true" />
          <span>Reach {next} days</span>
          <span className="ds-card__btn-sp">+{nextSp} SP</span>
          <motion.span
            className="ds-card__btn-arrow"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >→</motion.span>
        </motion.button>
      )}
    </motion.div>
  );
};