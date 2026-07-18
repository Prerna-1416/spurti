import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fireConfetti } from './ConfettiBurst';

interface LegendMomentProps {
  show: boolean;
  onClose: () => void;
}

export const LegendMoment: React.FC<LegendMomentProps> = ({ show, onClose }) => {
  const [phase, setPhase] = useState<'slow' | 'light' | 'badge' | 'celebrate' | 'close'>('slow');

  useEffect(() => {
    if (!show) { setPhase('slow'); return; }
    setPhase('slow');
    const t1 = setTimeout(() => setPhase('light'), 900);
    const t2 = setTimeout(() => setPhase('badge'), 1700);
    const t3 = setTimeout(() => {
      setPhase('celebrate');
      fireConfetti({ count: 200, duration: 3000, colors: ['#fde047', '#f97316', '#ef4444', '#a855f7', '#ffffff', '#fbbf24'] });
      setTimeout(() => fireConfetti({ count: 100, y: window.innerHeight * 0.6, spread: 140 }), 400);
      setTimeout(() => fireConfetti({ count: 100, y: window.innerHeight * 0.4, spread: 120 }), 900);
    }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show]);

  if (!show) return null;

  return (
    <motion.div className="legend-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="legend-vignette" />
      <div className="legend-rays" aria-hidden="true" />
      <motion.div
        className="legend-content"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      >
        <motion.div
          className="legend-medal"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="legend-medal__core">👑</div>
          <div className="legend-medal__halo" />
        </motion.div>
        <div className="legend-eyebrow">You did it.</div>
        <h2 className="legend-title">LEGEND ACHIEVED</h2>
        <p className="legend-message">1500 Spurti Points reached. The World Tree glows for you.</p>
        <button className="legend-close" onClick={onClose}>Enter the legend</button>
      </motion.div>
    </motion.div>
  );
};