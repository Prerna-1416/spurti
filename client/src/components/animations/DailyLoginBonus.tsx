import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fireConfetti } from './ConfettiBurst';

interface DailyLoginBonusProps {
  open: boolean;
  bonusSp: number;
  onCollect: () => void;
  onClose: () => void;
}

export const DailyLoginBonus: React.FC<DailyLoginBonusProps> = ({ open, bonusSp, onCollect, onClose }) => {
  if (!open) return null;

  const handleCollect = () => {
    fireConfetti({ count: 80, duration: 1400 });
    setTimeout(() => fireConfetti({ count: 50, y: window.innerHeight * 0.55, spread: 100 }), 200);
    onCollect();
  };

  return (
    <AnimatePresence>
      <motion.div className="login-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className="login-card"
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          <div className="login-sun" aria-hidden="true">🌞</div>
          <h2 className="login-title">Welcome back!</h2>
          <p className="login-lede">Ready to learn today?</p>
          <div className="login-bonus">
            <span className="login-bonus__label">Today's Bonus</span>
            <span className="login-bonus__value">+{bonusSp} SP</span>
          </div>
          <button className="login-collect" onClick={handleCollect}>
            Collect Reward
          </button>
          <button className="login-skip" onClick={onClose}>Maybe later</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};