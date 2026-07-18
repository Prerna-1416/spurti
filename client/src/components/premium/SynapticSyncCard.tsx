import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './SynapticSyncCard.css';

interface SynapticSyncCardProps {
  completedSessions?: number;
  totalSessions?: number;
  onHovered?: (h: boolean) => void;
}

const NEURAL_DOTS = [
  { x: 24, y: 38 }, { x: 48, y: 18 }, { x: 72, y: 42 },
  { x: 44, y: 52 }, { x: 62, y: 56 }, { x: 32, y: 22 },
  { x: 56, y: 36 }, { x: 38, y: 44 }, { x: 66, y: 28 }
];
const NEURAL_LINKS = [
  [0, 1], [1, 2], [0, 3], [2, 4], [3, 5], [5, 6], [6, 7], [7, 8], [3, 6], [4, 8], [0, 5]
];

export const SynapticSyncCard: React.FC<SynapticSyncCardProps> = ({
  completedSessions = 0,
  totalSessions = 7,
}) => {
  const capped = Math.min(completedSessions, totalSessions);
  const pct = totalSessions > 0 ? Math.round((capped / totalSessions) * 100) : 0;
  const [hovered, setHovered] = useState(false);

  const nodeStates = useMemo(() => {
    return Array.from({ length: totalSessions }, (_, i) => {
      if (i < capped) return 'done' as const;
      if (i === capped) return 'current' as const;
      return 'future' as const;
    });
  }, [capped, totalSessions]);

  return (
    <motion.section
      className="synaptic-card lift"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1], delay: 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Neural synapsis engine"
    >
      <div className="synaptic-card__bg" aria-hidden="true" />
      <div className="synaptic-card__noise" aria-hidden="true" />
      <div className="synaptic-card__glow" aria-hidden="true" />

      {/* Neural matrix canvas (behind everything) */}
      <svg
        className="synaptic-card__matrix"
        viewBox="0 0 96 72"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="sc-core-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        {NEURAL_LINKS.map(([a, b], i) => {
          const from = NEURAL_DOTS[a];
          const to = NEURAL_DOTS[b];
          return (
            <motion.line
              key={`link-${i}`}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="rgba(129, 140, 248, 0.08)"
              strokeWidth="0.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: hovered ? 1 : 0.3 }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: i * 0.04 }}
            />
          );
        })}
        {NEURAL_DOTS.map((d, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={d.x} cy={d.y} r="1.6"
            fill="rgba(129, 140, 248, 0.12)"
            animate={{
              opacity: hovered ? [0.12, 0.5, 0.12] : 0.08,
              r: hovered ? [1.6, 2.4, 1.6] : 1.2
            }}
            transition={{ duration: 2 + (i * 0.15), repeat: hovered ? Infinity : 0, ease: 'easeInOut' }}
          />
        ))}
      </svg>

      {/* Breathing core sphere */}
      <div className="synaptic-card__core" aria-hidden="true">
        <div className="synaptic-card__core-sphere" />
      </div>

      {/* Content */}
      <header className="synaptic-card__head">
        <span className="synaptic-card__eyebrow">
          <span aria-hidden="true">{'\uD83D\uDCAC'}</span>
          <span>Neural Synapsis in Progress</span>
        </span>
      </header>

      <div className="synaptic-card__body">
        <p className="synaptic-card__copy">
          I&rsquo;m still getting to know how you learn. Give me a few more sessions and I&rsquo;ll personalize your learning journey.
        </p>

        {/* Sync meter */}
        <div className="synaptic-card__meter">
          <span className="synaptic-card__meter-label">
            Sync Integrity
            <span className="synaptic-card__meter-pct">{pct}%</span>
          </span>
          <div className="synaptic-card__bar-track">
            <motion.div
              className="synaptic-card__bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            >
              <div className="synaptic-card__bar-shine" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Node track */}
      <div className="synaptic-card__nodes" role="list">
        {nodeStates.map((state, i) => (
          <div
            key={i}
            role="listitem"
            className={
              'synaptic-node' +
              (state === 'done' ? ' is-done' : '') +
              (state === 'current' ? ' is-current' : '') +
              (state === 'future' ? ' is-future' : '')
            }
            aria-label={
              state === 'done' ? `Session ${i + 1} synced` :
              state === 'current' ? `Session ${i + 1} in progress` :
              `Session ${i + 1} pending`
            }
          >
            <div className="synaptic-node__ring">
              {state === 'done' && (
                <motion.svg
                  viewBox="0 0 16 16"
                  width="12" height="12"
                  className="synaptic-node__check"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.08 }}
                  aria-hidden="true"
                >
                  <motion.path
                    d="M3.5 8 L7 12 L13 4"
                    stroke="#FFFFFF"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </motion.svg>
              )}
              {state === 'current' && (
                <motion.span
                  className="synaptic-node__pulse"
                  aria-hidden="true"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
            </div>
            <span className="synaptic-node__label">
              {state === 'done' ? 'Synced' : state === 'current' ? 'Syncing' : `Queue ${i + 1}`}
            </span>
          </div>
        ))}
      </div>

      <footer className="synaptic-card__foot">
        <span className="synaptic-card__foot-text">
          {capped < totalSessions
            ? `${totalSessions - capped} more ${totalSessions - capped === 1 ? 'session' : 'sessions'} to unlock personalized insights`
            : 'Learning model stabilized. Insights active.'}
        </span>
      </footer>
    </motion.section>
  );
};
