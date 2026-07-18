import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { leagueProgress, LEAGUES, type LeagueInfo } from './leagues';
import { AnimatedCounter } from '../animations/AnimatedCounter';
import { ProgressBar } from '../animations/ProgressAnimator';

interface PremiumSPCardProps {
  totalSp: number;
  rank?: number;
  cohortSize?: number;
  todayDelta?: number;
  streakDays?: number;
  isReceiving?: boolean;
  isMilestone?: number | null;
  onMilestoneShown?: () => void;
}

export const PremiumSPCard: React.FC<PremiumSPCardProps> = ({
  totalSp,
  rank,
  cohortSize,
  todayDelta = 0,
  streakDays = 0,
  isReceiving = false,
  isMilestone = null,
  onMilestoneShown
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { current, next, pct, intoNext, totalToNext } = leagueProgress(totalSp);
  const [flyPlus, setFlyPlus] = useState<{ amount: number; key: number } | null>(null);
  const prevSpRef = useRef(totalSp);

  useEffect(() => {
    const prev = prevSpRef.current;
    if (totalSp > prev) {
      setFlyPlus({ amount: totalSp - prev, key: Date.now() });
      const t = setTimeout(() => setFlyPlus(null), 1800);
      prevSpRef.current = totalSp;
      return () => clearTimeout(t);
    }
    prevSpRef.current = totalSp;
  }, [totalSp]);

  useEffect(() => {
    if (isMilestone && onMilestoneShown) {
      const t = setTimeout(() => onMilestoneShown(), 3200);
      return () => clearTimeout(t);
    }
  }, [isMilestone, onMilestoneShown]);

  return (
    <div
      ref={cardRef}
      className={
        'premium-sp-card premium-sp-card--' + current.tier +
        (isReceiving ? ' is-receiving' : '') +
        (isMilestone ? ' is-milestone' : '')
      }
      style={{
        '--league-gradient': current.gradient,
        '--league-glow': current.glow,
        '--league-border': current.borderColor
      } as React.CSSProperties}
    >
      <div className="premium-sp-card__particles" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.span
            key={i}
            className="premium-sp-card__particle"
            animate={{
              y: [0, -16, 0],
              opacity: [0.3, 0.9, 0.3],
              x: [(i - 3) * 6]
            }}
            transition={{ duration: 2.4 + (i % 3) * 0.4, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="premium-sp-card__rays" aria-hidden="true" />

      <div className="premium-sp-card__head">
        <span className="premium-sp-card__eyebrow">
          <span className="premium-sp-card__star" aria-hidden="true">⭐</span>
          Spurti Points
        </span>
        <span className="premium-sp-card__league-badge">
          <span aria-hidden="true">{current.icon}</span>
          <span>{current.label}</span>
        </span>
      </div>

      <div className="premium-sp-card__value-row">
        <AnimatedCounter value={totalSp} className="premium-sp-card__value" format={n => Math.round(n).toString()} />
        <span className="premium-sp-card__sp-label">SP</span>
      </div>

      <AnimatePresence>
        {flyPlus && (
          <motion.span
            key={flyPlus.key}
            className="premium-sp-card__fly-plus"
            initial={{ y: 0, opacity: 0, scale: 0.6 }}
            animate={{ y: -50, opacity: [0, 1, 1, 0], scale: 1 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          >
            +{flyPlus.amount} ✨
          </motion.span>
        )}
      </AnimatePresence>

      <div className="premium-sp-card__meta">
        {todayDelta > 0 && (
          <motion.div
            className="premium-sp-card__today"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span aria-hidden="true">✨</span>
            <span>+{todayDelta} Today</span>
          </motion.div>
        )}
        {streakDays > 0 && (
          <motion.div
            className="premium-sp-card__streak"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span aria-hidden="true">🔥</span>
            <span>{streakDays}-day streak</span>
          </motion.div>
        )}
      </div>

      <div className="premium-sp-card__progress-block">
        <div className="premium-sp-card__progress-meta">
          <span className="premium-sp-card__progress-label">
            {next ? (
              <>Next: <b>{next.label}</b> in <b>{next.sp - totalSp} SP</b></>
            ) : (
              <b>👑 Max league — Legend</b>
            )}
          </span>
          <span className="premium-sp-card__progress-pct">{next ? `${pct}%` : '100%'}</span>
        </div>
        <div className="premium-sp-card__bar-wrap">
          <ProgressBar
            value={pct}
            color={current.tier === 'legend' ? '#fbbf24' : '#ffffff'}
            trailColor="rgba(255, 255, 255, 0.18)"
            thickness={8}
          />
          <span className="premium-sp-card__bar-shine" aria-hidden="true" />
        </div>
        {next && (
          <div className="premium-sp-card__progress-foot">
            <span>{intoNext} / {totalToNext} SP</span>
            <span>→ <b>{next.sp}</b></span>
          </div>
        )}
      </div>

      <div className="premium-sp-card__foot">
        {rank != null && cohortSize != null && (
          <div className="premium-sp-card__foot-cell">
            <span className="premium-sp-card__foot-eyebrow">Rank</span>
            <strong>#{rank} <em>of {cohortSize}</em></strong>
          </div>
        )}
        <div className="premium-sp-card__foot-cell premium-sp-card__foot-cell--right">
          <span className="premium-sp-card__foot-eyebrow">Next Milestone</span>
          <strong>
            <span aria-hidden="true">🏆</span>
            {next ? `${next.sp} SP` : '👑 Reached'}
          </strong>
        </div>
      </div>

      <AnimatePresence>
        {isMilestone && (
          <motion.div
            className="premium-sp-card__milestone-flash"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.4 }}
          >
            🎉 {isMilestone} SP!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};