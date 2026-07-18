import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fireConfetti } from './ConfettiBurst';

export type RewardKind =
  | 'attendance' | 'poll' | 'quiz' | 'session' | 'assignment'
  | 'badge' | 'login' | 'project' | 'research' | 'streak'
  | 'chest' | 'legend';

export interface RewardSpec {
  kind: RewardKind;
  title: string;
  amount?: number;
  message: string;
  emoji?: string;
  flavor?: string;
}

interface RewardPopupProps {
  reward: RewardSpec | null;
  onClose: () => void;
  onCollected?: () => void;
}

const KIND_COLOR: Record<RewardKind, string> = {
  attendance: '#12805c',
  poll: '#176b87',
  quiz: '#176b87',
  session: '#6a3aa0',
  assignment: '#d97706',
  badge: '#d4af37',
  login: '#f97316',
  project: '#0f766e',
  research: '#c93a2a',
  streak: '#ef4444',
  chest: '#fbbf24',
  legend: '#fef3c7'
};

export const RewardPopup: React.FC<RewardPopupProps> = ({ reward, onClose, onCollected }) => {
  const [phase, setPhase] = useState<'idle' | 'collect' | 'flying' | 'done'>('idle');
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (reward) {
      setPhase('idle');
      setShowSparkles(false);
    }
  }, [reward]);

  if (!reward) return null;
  const accent = KIND_COLOR[reward.kind] || '#176b87';

  const handleCollect = () => {
    setPhase('collect');
    setShowSparkles(true);
    fireConfetti({ count: 80, duration: 1400 });
    setTimeout(() => fireConfetti({ count: 60, y: window.innerHeight * 0.6, spread: 110, duration: 1200 }), 200);
    onCollected?.();
    setTimeout(() => setPhase('flying'), 900);
    setTimeout(() => {
      const target = document.querySelector('.sp-card');
      if (target) {
        const rect = (target as HTMLElement).getBoundingClientRect();
        target.classList.add('is-flying-target');
        setTimeout(() => target.classList.remove('is-flying-target'), 1100);
      }
      onClose();
    }, 1700);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="reward-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className="reward-card"
          style={{ '--accent': accent } as React.CSSProperties}
          initial={{ scale: 0.7, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <div className="reward-card__halo" />
          {showSparkles && <div className="reward-card__sparkles" aria-hidden="true" />}
          <div className="reward-card__icon">
            {reward.emoji ?? '🎉'}
          </div>
          <div className="reward-card__eyebrow">Congratulations!</div>
          <h3 className="reward-card__title">{reward.title}</h3>
          <div className="reward-card__amount">
            {typeof reward.amount === 'number' && (
              <motion.span
                key={phase}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="reward-card__sp"
              >
                +{reward.amount} SP
              </motion.span>
            )}
          </div>
          <p className="reward-card__message">{reward.message}</p>
          {reward.flavor && <p className="reward-card__flavor">{reward.flavor}</p>}
          <button
            className="reward-card__collect"
            onClick={handleCollect}
            disabled={phase !== 'idle'}
          >
            {phase === 'idle' ? 'Collect Reward' : phase === 'collect' ? '✨ Receiving…' : 'Flying…'}
          </button>
        </motion.div>

        {phase === 'flying' && (
          <motion.div
            className="reward-flyer"
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: typeof window !== 'undefined' ? window.innerWidth / 2 - 80 : 0,
              y: typeof window !== 'undefined' ? -window.innerHeight / 2 + 80 : 0,
              scale: 0.4,
              opacity: 0.2
            }}
            transition={{ duration: 0.8, ease: 'easeIn' }}
          >
            <span className="reward-flyer__energy">+{reward.amount} SP</span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

let nextId = 0;
export function makeRewardId(): number { return ++nextId; }