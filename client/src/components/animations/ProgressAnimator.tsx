import React from 'react';
import { motion } from 'framer-motion';

interface ProgressAnimatorProps {
  value: number;
  max?: number;
  thickness?: number;
  size?: number;
  color?: string;
  trailColor?: string;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressAnimatorProps> = ({
  value, max = 100, color = '#176b87', trailColor = 'rgba(15, 23, 42, 0.08)',
  thickness = 8, className
}) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={className} style={{
      position: 'relative', width: '100%', height: thickness,
      background: trailColor, borderRadius: 999, overflow: 'hidden'
    }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          borderRadius: 999,
          boxShadow: `0 0 12px ${color}66`
        }}
      />
    </div>
  );
};

export const ProgressRing: React.FC<ProgressAnimatorProps & { label?: React.ReactNode }> = ({
  value, max = 100, color = '#176b87', trailColor = 'rgba(15, 23, 42, 0.08)',
  size = 64, thickness = 6, showLabel = true, label, className
}) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className={className} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={trailColor} strokeWidth={thickness} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={thickness} fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      {showLabel && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid', placeItems: 'center',
          fontSize: size * 0.22, fontWeight: 800, color: '#172033'
        }}>
          {label ?? `${Math.round(pct)}%`}
        </div>
      )}
    </div>
  );
};