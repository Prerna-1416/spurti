import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fireConfetti } from './ConfettiBurst';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const RARITY: Record<Achievement['rarity'], { color: string; gradient: string }> = {
  common:    { color: '#94a3b8', gradient: 'linear-gradient(135deg, #cbd5e1, #94a3b8)' },
  rare:      { color: '#3b82f6', gradient: 'linear-gradient(135deg, #60a5fa, #1d4ed8)' },
  epic:      { color: '#a855f7', gradient: 'linear-gradient(135deg, #c084fc, #6b21a8)' },
  legendary: { color: '#fbbf24', gradient: 'linear-gradient(135deg, #fde047, #d97706)' }
};

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
  if (!achievement) return null;
  const rarity = RARITY[achievement.rarity];

  const handleClaim = () => {
    fireConfetti({ count: 100, duration: 1500, spread: 100 });
    setTimeout(() => fireConfetti({ count: 50, y: window.innerHeight * 0.4, spread: 80 }), 250);
    setTimeout(onClose, 600);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="achievement-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="achievement-card"
          style={{ '--rarity-color': rarity.color } as React.CSSProperties}
          initial={{ rotateY: 180, scale: 0.6, opacity: 0 }}
          animate={{ rotateY: 0, scale: 1, opacity: 1 }}
          exit={{ rotateY: -180, scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="achievement-shine" />
          <div className="achievement-card__eyebrow" style={{ background: rarity.gradient }}>
            🏆 Achievement Unlocked
          </div>
          <div className="achievement-card__medal" style={{ background: rarity.gradient }}>
            <span>{achievement.emoji}</span>
          </div>
          <h3 className="achievement-card__title">{achievement.title}</h3>
          <p className="achievement-card__desc">{achievement.description}</p>
          <span className="achievement-card__rarity" style={{ color: rarity.color }}>
            {achievement.rarity.toUpperCase()}
          </span>
          <button className="achievement-card__claim" onClick={handleClaim}>
            Awesome!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};