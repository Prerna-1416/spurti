import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fireConfetti } from '../animations/ConfettiBurst';
import { leagueForSp } from './leagues';

interface MilestoneCelebrationProps {
  milestone: number | null;
  totalSp: number;
  onClose: () => void;
}

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({ milestone, totalSp, onClose }) => {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    if (!milestone) return;
    setPhase('in');
    const t1 = setTimeout(() => {
      setPhase('hold');
      fireConfetti({ count: 120, duration: 2200, colors: ['#fde047', '#f97316', '#ef4444', '#a855f7', '#3b82f6', '#ffffff', '#fbbf24'] });
      setTimeout(() => fireConfetti({ count: 80, y: window.innerHeight * 0.5, spread: 130 }), 300);
      setTimeout(() => fireConfetti({ count: 80, y: window.innerHeight * 0.3, spread: 100 }), 700);
    }, 400);
    const t2 = setTimeout(() => setPhase('out'), 2800);
    const t3 = setTimeout(() => onClose(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [milestone, onClose]);

  if (!milestone) return null;

  const { current, next } = leagueForSp(totalSp);
  const rewards: Array<{ emoji: string; label: string }> = [];
  if (next) {
    rewards.push({ emoji: '✨', label: `Approaching ${next.label} league` });
  } else {
    rewards.push({ emoji: '👑', label: 'Legend league reached' });
  }
  if (milestone >= 300) rewards.push({ emoji: '🏆', label: 'New milestone badge' });
  if (milestone >= 500) rewards.push({ emoji: '🌳', label: 'Tree growth boost' });

  return (
    <AnimatePresence>
      <motion.div
        className="milestone-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'out' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: phase === 'in' ? 0.4 : 0.4 }}
      >
        <div className="milestone-rays" aria-hidden="true" />
        <motion.div
          className="milestone-content"
          initial={{ scale: 0.6, opacity: 0, y: 30 }}
          animate={{
            scale: phase === 'out' ? 1.1 : 1,
            opacity: phase === 'out' ? 0 : 1,
            y: phase === 'out' ? -10 : 0
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="milestone-trophy"
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            🏆
          </motion.div>
          <span className="milestone-eyebrow">🎉 Milestone Reached!</span>
          <h2 className="milestone-sp">
            <span className="milestone-sp__number">{milestone}</span>
            <span className="milestone-sp__label">Spurti Points</span>
          </h2>
          <span className="milestone-league">
            Current league: <b>{current.icon} {current.label}</b>
          </span>

          <div className="milestone-rewards">
            <span className="milestone-rewards__eyebrow">Rewards Unlocked</span>
            <ul>
              {rewards.map((r, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
                >
                  <span className="milestone-rewards__emoji">{r.emoji}</span>
                  <span>{r.label}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <button className="milestone-close" onClick={onClose}>Keep going →</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};