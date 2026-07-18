import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FACTORS = [
  { id: 'sp_velocity', label: 'SP earning pace (last 7d trend)', weight: '25%' },
  { id: 'attendance',   label: 'Attendance rate (7d vs prior 7d)',     weight: '20%' },
  { id: 'meaningful',   label: 'Meaningful SP ratio (peer / docs / mentor / project)', weight: '15%' },
  { id: 'poll',         label: 'Poll participation trend',           weight: '15%' },
  { id: 'rank',         label: 'Rank movement',                     weight: '15%' },
  { id: 'streak',       label: 'Streak stability',                   weight: '10%' }
];

export const MomentumInfoModal = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="mm-info-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="mm-info-modal"
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="mm-info-title"
          >
            <button className="mm-info-modal__close" onClick={onClose} aria-label="Close">×</button>
            <h3 id="mm-info-title" className="mm-info-modal__title">⚡ How is Momentum calculated?</h3>
            <p className="mm-info-modal__lede">
              Momentum is a 0-100 score that compares your last 7 days of activity against the 7 days before that. Six factors are blended, then bucketed into three states.
            </p>
            <ul className="mm-info-modal__factors">
              {FACTORS.map(f => (
                <li key={f.id} className="mm-info-modal__factor">
                  <span><b>{f.label}</b></span>
                  <span className="mm-info-modal__weight">{f.weight}</span>
                </li>
              ))}
            </ul>
            <p className="mm-info-modal__note">
              States: 🟢 ≥ 70 High Momentum · 🟡 30–69 Slowing Down · 🔴 &lt; 30 Momentum Lost. The card never re-shames — every state has an actionable nudge tied to your weakest factor.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};