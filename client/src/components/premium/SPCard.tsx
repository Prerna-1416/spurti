import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { leagueProgress } from './leagues';
import { AnimatedCounter } from '../animations/AnimatedCounter';
import { ProgressBar } from '../animations/ProgressAnimator';

interface SPCardProps {
  totalSp: number;
  rank?: number;
  cohortSize?: number;
  todayDelta?: number;
  streakDays?: number;
  isReceiving?: boolean;
}

const TROPHY_GRADIENT = 'linear-gradient(160deg, #fef3c7 0%, #fde047 25%, #f59e0b 50%, #d97706 75%, #92400e 100%)';

export const SPCard: React.FC<SPCardProps> = ({
  totalSp,
  rank,
  cohortSize,
  todayDelta = 0,
  isReceiving = false
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

  return (
    <div
      ref={cardRef}
      className={'sp-card sp-card--' + current.tier + (isReceiving ? ' is-receiving' : '')}
      style={{
        '--league-glow': current.glow,
        '--league-shield-from': current.shieldFrom,
        '--league-shield-to': current.shieldTo
      } as React.CSSProperties}
    >
      <div className="sp-card__bg-grid" aria-hidden="true" />
      <div className="sp-card__stars" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            className="sp-card__star"
            animate={{ opacity: [0.1, 0.9, 0.1], scale: [0.6, 1.2, 0.6] }}
            transition={{
              duration: 1.8 + (i % 3) * 0.6,
              delay: (i * 0.3) % 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              left: `${5 + (i * 8.3) % 90}%`,
              top: `${8 + (i * 13) % 85}%`
            }}
          >
            ✦
          </motion.span>
        ))}
      </div>

      <div className="sp-card__particles" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.span
            key={i}
            className="sp-card__particle"
            animate={{
              y: [0, -100, -200],
              opacity: [0, 0.8, 0],
              x: [(i - 4) * 6]
            }}
            transition={{
              duration: 3.4 + (i % 3) * 0.6,
              delay: i * 0.4,
              repeat: Infinity,
              ease: 'easeOut'
            }}
            style={{ left: `${10 + (i * 11) % 80}%`, bottom: '8px' }}
          />
        ))}
      </div>

      <div className="sp-card__head">
        <div className="sp-card__eyebrow">
          <span aria-hidden="true">⭐</span>
          <span>Spurti Points</span>
        </div>
        <div
          className="sp-card__league-shield"
          title={current.label}
        >
          <span aria-hidden="true">{current.icon}</span>
          <span className="sp-card__league-shield-label">{current.shortLabel}</span>
        </div>
      </div>

      <div className="sp-card__body">
        <div className="sp-card__value-block">
          <div className="sp-card__value-row">
            <AnimatedCounter value={totalSp} className="sp-card__value" format={n => Math.round(n).toString()} />
            <span className="sp-card__sp-label">SP</span>
          </div>

          <AnimatePresence>
            {todayDelta > 0 && (
              <motion.div
                className="sp-card__today"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.4 }}
              >
                <motion.span
                  className="sp-card__today-pulse"
                  animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  +{todayDelta} Today
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="sp-card__trophy-wrap"
          animate={{ rotate: isReceiving ? [0, -8, 8, -4, 0] : 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          <motion.div
            className="sp-card__trophy"
            whileHover={{ rotate: 5, scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
          >
            <div className="sp-card__trophy-shine" aria-hidden="true" />
            <div className="sp-card__trophy-emoji" aria-hidden="true">🏆</div>
            <div className="sp-card__trophy-glow" aria-hidden="true" />
            <motion.span
              className="sp-card__trophy-sparkle"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ top: '14%', right: '14%' }}
            >✦</motion.span>
            <motion.span
              className="sp-card__trophy-sparkle"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              style={{ top: '52%', left: '8%' }}
            >✦</motion.span>
            <motion.span
              className="sp-card__trophy-sparkle"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              style={{ bottom: '18%', right: '20%' }}
            >✦</motion.span>
          </motion.div>
        </motion.div>
      </div>

      <div className="sp-card__mini-stats">
        <motion.div
          className="sp-card__mini-card"
          whileHover={{ y: -2, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          <span className="sp-card__mini-eyebrow">🏆 Rank</span>
          <strong className="sp-card__mini-value">
            {rank != null && cohortSize != null ? (
              <>{rank} <em>of {cohortSize}</em></>
            ) : (
              <em>—</em>
            )}
          </strong>
        </motion.div>
        <motion.div
          className="sp-card__mini-card sp-card__mini-card--league"
          style={{
            background: `linear-gradient(135deg, ${current.shieldFrom}22, ${current.shieldTo}33)`,
            borderColor: `${current.borderColor}`
          }}
          whileHover={{ y: -2, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          <span className="sp-card__mini-eyebrow">Current League</span>
          <strong className="sp-card__mini-value">
            <span aria-hidden="true">{current.icon}</span>
            <span>{current.label}</span>
          </strong>
        </motion.div>
      </div>

      <div className="sp-card__progress">
        <div className="sp-card__progress-meta">
          <span className="sp-card__progress-text">
            <b>{intoNext}</b> / {totalToNext > 0 ? totalToNext : current.sp} SP
          </span>
          <span className="sp-card__progress-pct">{next ? `${pct}%` : '100%'}</span>
        </div>
        <div className="sp-card__bar-wrap">
          <div className="sp-card__bar-track">
            <motion.div
              className="sp-card__bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          <span className="sp-card__bar-sweep" aria-hidden="true" />
        </div>
      </div>

      <div className="sp-card__foot">
        <div className="sp-card__foot-cell sp-card__foot-cell--right">
          <span className="sp-card__foot-eyebrow">🎯 Next Milestone</span>
          <strong>
            <span aria-hidden="true" className="sp-card__milestone-star">★</span>
            {next ? `${next.sp} SP` : '👑 Reached'}
          </strong>
        </div>
      </div>

      <AnimatePresence>
        {flyPlus && (
          <motion.span
            key={flyPlus.key}
            className="sp-card__fly-plus"
            initial={{ y: 0, opacity: 0, scale: 0.6 }}
            animate={{ y: -50, opacity: [0, 1, 1, 0], scale: 1 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          >
            +{flyPlus.amount} ✨
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};