import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { calculateMomentum } from './momentumEngine';

const STATE_META = {
  high: {
    label: 'High Momentum',
    accent: '#10B981',
    accentSoft: '#ECFDF5',
    arrow: '↗',
    tipTitle: 'Keep the streak alive.'
  },
  slowing: {
    label: 'Slowing Down',
    accent: '#F59E0B',
    accentSoft: '#FFFBEB',
    arrow: '→',
    tipTitle: 'Show up tomorrow to recover.'
  },
  lost: {
    label: 'Momentum Lost',
    accent: '#F87171',
    accentSoft: '#FEF2F2',
    arrow: '↘',
    tipTitle: 'One session today restarts it.'
  }
};

function Sparkline({ data, color }) {
  const W = 240;
  const H = 56;
  const pad = 4;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2;
  const max = Math.max(1, ...data.map(d => d.sp));
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;
  const points = data.map((d, i) => {
    const x = pad + i * step;
    const y = pad + (1 - d.sp / max) * innerH;
    return [x, y];
  });
  const pathLine = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');
  const pathArea = `${pathLine} L ${pad + (data.length - 1) * step} ${H - pad} L ${pad} ${H - pad} Z`;
  const id = 'momSparkGrad';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mm-sparkline" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={pathArea} fill={`url(#${id})`} />
      <path d={pathLine} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      {points.length > 0 && (() => {
        const [lx, ly] = points[points.length - 1];
        return <circle cx={lx} cy={ly} r="2.4" fill={color} />;
      })()}
    </svg>
  );
}

export const MomentumMeterCard = ({ profile, exp, onInfoClick }) => {
  const data = useMemo(() => calculateMomentum(profile || {}, exp || {}), [profile, exp]);
  const meta = STATE_META[data.state] || STATE_META.slowing;

  // Suggestion tied to the weakest factor
  const suggestion = (() => {
    switch (data.weakest_factor) {
      case 'sp_velocity':
        return `Your SP-earning pace has dropped. Show up to one session today to bounce back.`;
      case 'attendance':
        return `Your attendance dipped this week. Marking tomorrow's session will lift your momentum.`;
      case 'poll':
        return `Your poll participation dropped. Submit today's poll to recover momentum.`;
      case 'rank':
        return `Focus on one meaningful action this week to climb a rank.`;
      case 'streak':
        return `Show up tomorrow — one day protects the whole streak.`;
      case 'meaningful':
        return `Try one higher-weight action this week (help a peer, document, mentor). Meaningful actions compound.`;
      default:
        return `Keep showing up consistently.`;
    }
  })();

  return (
    <motion.div
      className={`mm-card mm-card--${data.state}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      style={{ '--mm-accent': meta.accent, '--mm-accent-soft': meta.accentSoft } as React.CSSProperties}
    >
      <div className="mm-card__head">
        <span className="mm-card__eyebrow">⚡ MOMENTUM METER</span>
        <button
          type="button"
          className="mm-card__info"
          onClick={onInfoClick}
          aria-label="What does this measure?"
          title="What does this measure?"
        >?</button>
      </div>

      <motion.div
        className="mm-status"
        initial={false}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="mm-status__dot" aria-hidden="true">{meta.arrow}</span>
        <span className="mm-status__label">{meta.label}</span>
        <span className="mm-status__score">{data.momentum_score}</span>
      </motion.div>

      <p className="mm-headline">{data.headline_message}</p>

      <div className="mm-spark-wrap">
        <Sparkline data={data.sparkline_data} color={meta.accent} />
        <div className="mm-spark-axis">
          <span>{data.sparkline_data[0]?.date.slice(5)}</span>
          <span>now</span>
        </div>
      </div>

      <p className="mm-suggestion">
        <span className="mm-suggestion__title">{meta.tipTitle}</span>
        <span className="mm-suggestion__body">{suggestion}</span>
      </p>

      <p className="mm-foot">
        Momentum recalculates daily · Based on last 7 vs previous 7 days
      </p>
    </motion.div>
  );
};