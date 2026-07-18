import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fireConfetti } from './ConfettiBurst';

export type ChestTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';

interface ChestOpeningProps {
  tier: ChestTier | null;
  rewardLabel: string;
  rewardEmoji?: string;
  onClose: () => void;
}

const TIER: Record<ChestTier, { color: string; gradient: string; glow: string; label: string }> = {
  bronze:    { color: '#a16207', gradient: 'linear-gradient(135deg, #fbbf24, #92400e)', glow: 'rgba(251, 191, 36, 0.7)', label: 'Bronze Chest' },
  silver:    { color: '#64748b', gradient: 'linear-gradient(135deg, #e2e8f0, #475569)', glow: 'rgba(226, 232, 240, 0.7)', label: 'Silver Chest' },
  gold:      { color: '#d97706', gradient: 'linear-gradient(135deg, #fde047, #d97706)', glow: 'rgba(253, 224, 71, 0.7)', label: 'Gold Chest' },
  diamond:   { color: '#06b6d4', gradient: 'linear-gradient(135deg, #cffafe, #0891b2)', glow: 'rgba(34, 211, 238, 0.7)', label: 'Diamond Chest' },
  legendary: { color: '#fef3c7', gradient: 'linear-gradient(135deg, #fef3c7, #fbbf24, #f97316, #a855f7)', glow: 'rgba(254, 243, 199, 0.9)', label: 'Legendary Chest' }
};

export const ChestOpening: React.FC<ChestOpeningProps> = ({ tier, rewardLabel, rewardEmoji = '✨', onClose }) => {
  const [phase, setPhase] = useState<'idle' | 'shake' | 'glow' | 'open' | 'reveal'>('idle');

  useEffect(() => {
    if (!tier) { setPhase('idle'); return; }
    setPhase('shake');
    const t1 = setTimeout(() => setPhase('glow'), 1200);
    const t2 = setTimeout(() => setPhase('open'), 2000);
    const t3 = setTimeout(() => {
      setPhase('reveal');
      const t = TIER[tier];
      fireConfetti({ count: 100, duration: 1800, colors: [t.color, '#fbbf24', '#fef3c7', '#ffffff'] });
      setTimeout(() => fireConfetti({ count: 60, y: window.innerHeight * 0.5, spread: 120 }), 200);
    }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [tier]);

  if (!tier) return null;
  const t = TIER[tier];

  return (
    <AnimatePresence>
      <motion.div
        className="chest-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={`chest-stage chest-stage--${phase}`}
          style={{ '--chest-color': t.color, '--chest-glow': t.glow } as React.CSSProperties}
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          <div className="chest-dimming" />
          <div className="chest-rays" aria-hidden="true" />
          <motion.div
            className="chest-box"
            animate={
              phase === 'shake' ? { x: [0, -8, 8, -6, 6, -3, 3, 0], rotate: [0, -2, 2, -1, 1, 0] } :
              phase === 'glow' ? { scale: [1, 1.08, 1] } :
              phase === 'open' ? { scale: [1, 0.9, 1.2, 1] } :
              { scale: 0.6, opacity: 0.4, y: 60 }
            }
            transition={{ duration: phase === 'shake' ? 1.1 : phase === 'glow' ? 0.6 : phase === 'open' ? 0.5 : 0.8, ease: 'easeInOut' }}
          >
            <div className="chest-box__lid" />
            <div className="chest-box__body" style={{ background: t.gradient }} />
            <div className="chest-box__lock">🔒</div>
          </motion.div>

          {phase === 'reveal' && (
            <motion.div
              className="chest-reward"
              initial={{ y: 30, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            >
              <div className="chest-reward__eyebrow">{t.label}</div>
              <div className="chest-reward__emoji">{rewardEmoji}</div>
              <div className="chest-reward__label">{rewardLabel}</div>
              <button className="chest-reward__claim" onClick={onClose}>
                Collect
              </button>
            </motion.div>
          )}

          {phase === 'shake' && <div className="chest-hint">Day {tier === 'bronze' ? 1 : tier === 'silver' ? 3 : tier === 'gold' ? 7 : tier === 'diamond' ? 15 : 30} reward unlocked…</div>}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};