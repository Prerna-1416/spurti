import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { calculateHabitRadar, persistRadarSnapshot, pickPreviousWeekGhost } from './habitRadarEngine';

const TIER_COLORS = { strong: '#10B981', moderate: '#F59E0B', growth: '#FB923C' };

function polarPoint(cx, cy, radius, angleRad) {
  return [cx + radius * Math.cos(angleRad - Math.PI / 2), cy + radius * Math.sin(angleRad - Math.PI / 2)];
}

function buildShape(axes, cx, cy, radius) {
  const n = axes.length;
  if (n === 0) return '';
  const pts = axes.map((a, i) => {
    const angle = (i / n) * Math.PI * 2;
    const r = radius * (a.score / 100);
    return polarPoint(cx, cy, r, angle);
  });
  return pts.map(([x, y], i) => (i === 0 ? 'M ' + x + ' ' + y : 'L ' + x + ' ' + y)).join(' ') + ' Z';
}

function Radar({ current, ghost, size }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 36;
  const n = current.length;
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg viewBox={'0 0 ' + size + ' ' + size} width={size} height={size} className="hr-radar" role="img" aria-label="Habit radar chart">
      {rings.map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={radius * r} fill="none" stroke="#E5E7EB" strokeWidth="1" />
      ))}
      {current.map((_, i) => {
        const angle = (i / n) * Math.PI * 2;
        const [x, y] = polarPoint(cx, cy, radius, angle);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E5E7EB" strokeWidth="1" />;
      })}
      {ghost && (
        <motion.path
          d={buildShape(ghost, cx, cy, radius)}
          fill="rgba(209, 213, 219, 0.10)"
          stroke="#D1D5DB"
          strokeWidth="1.4"
          strokeDasharray="3 3"
          opacity="0.55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 0.6 }}
        />
      )}
      <motion.path
        d={buildShape(current, cx, cy, radius)}
        fill="rgba(8, 145, 178, 0.15)"
        stroke="#0891B2"
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
      {current.map((a, i) => {
        const angle = (i / n) * Math.PI * 2;
        const r = radius * (a.score / 100);
        const [x, y] = polarPoint(cx, cy, r, angle);
        return (
          <motion.circle
            key={a.name}
            cx={x} cy={y}
            r="3.6"
            fill={TIER_COLORS[a.tier] || '#0891B2'}
            stroke="#FFFFFF"
            strokeWidth="1.4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 + i * 0.06, duration: 0.3, type: 'spring' }}
          />
        );
      })}
      {current.map((a, i) => {
        const angle = (i / n) * Math.PI * 2;
        const [x, y] = polarPoint(cx, cy, radius + 22, angle);
        const cos = Math.cos(angle - Math.PI / 2);
        const anchor = cos > 0.2 ? 'start' : cos < -0.2 ? 'end' : 'middle';
        return (
          <g key={'lbl-' + a.name}>
            <text x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
                  fontSize="9" fontWeight="700" letterSpacing="0.06em"
                  fill="#374151">{a.name.toUpperCase()}</text>
            <text x={x} y={y + 12} textAnchor={anchor} dominantBaseline="middle"
                  fontSize="10" fontWeight="800" fill={TIER_COLORS[a.tier] || '#374151'}>{a.score}</text>
          </g>
        );
      })}
    </svg>
  );
}

export const HabitRadarCard = ({ profile, exp }) => {
  const [showGhost, setShowGhost] = useState(true);
  const baseData = useMemo(() => calculateHabitRadar(profile || {}, exp || {}), [profile, exp]);
  const email = profile && profile.student && profile.student.email;

  const ghost = useMemo(() => {
    if (!showGhost || !email) return null;
    const prior = pickPreviousWeekGhost(email, baseData.week_start_date);
    if (!prior || !prior.axes) return null;
    const order = ['Attendance', 'Polls', 'Consistency', 'Curiosity', 'Participation'];
    return order.map(name => ({ name, score: prior.axes[name] != null ? prior.axes[name] * 100 : 0 }));
  }, [email, baseData.week_start_date, showGhost]);

  useEffect(() => {
    if (!email) return;
    const axesObj = {};
    for (const a of baseData.axes) axesObj[a.name] = a.score / 100;
    persistRadarSnapshot(email, { week: baseData.week_start_date, axes: axesObj, ts: Date.now() });
  }, [email, baseData.week_start_date, baseData.axes]);

  const strongest = baseData.axes.find(a => a.name === baseData.strongest_habit);
  const growth = baseData.axes.find(a => a.name === baseData.growth_area);

  return (
    <motion.section
      className="hr-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="hr-card__head">
        <span className="hr-card__eyebrow">🎯 HABIT RADAR</span>
        <div className="hr-card__toggle" role="tablist">
          <button type="button" className={'hr-card__toggle-btn' + (showGhost ? ' is-active' : '')} onClick={() => setShowGhost(true)} aria-pressed={showGhost}>This Week vs Last</button>
          <button type="button" className={'hr-card__toggle-btn' + (!showGhost ? ' is-active' : '')} onClick={() => setShowGhost(false)} aria-pressed={!showGhost}>This Week Only</button>
        </div>
      </div>
      <div className="hr-card__body">
        <div className="hr-card__chart">
          <Radar current={baseData.axes} ghost={ghost} size={300} />
          {showGhost && ghost && (
            <div className="hr-card__legend">
              <span><i style={{ background: 'rgba(8,145,178,0.15)', borderColor: '#0891B2' }} /> This week</span>
              <span><i style={{ background: 'rgba(209,213,219,0.2)', borderColor: '#D1D5DB' }} /> Last week</span>
            </div>
          )}
        </div>
        <div className="hr-card__side">
          <div className="hr-card__pills">
            {strongest && (
              <div className="hr-pill hr-pill--strong">
                <span className="hr-pill__eyebrow">💪 Strongest Habit</span>
                <strong className="hr-pill__name">{strongest.name}</strong>
                <span className="hr-pill__meta">{strongest.score}% · {strongest.delta >= 0 ? '+' : ''}{(strongest.delta * 100).toFixed(0)}% vs last week</span>
              </div>
            )}
            {growth && (
              <div className="hr-pill hr-pill--growth">
                <span className="hr-pill__eyebrow">🎯 Growth Area</span>
                <strong className="hr-pill__name">{growth.name}</strong>
                <span className="hr-pill__meta">{growth.score}% · focus area, not weakness</span>
              </div>
            )}
          </div>
          <div className="hr-card__tip">
            <span className="hr-card__tip-eyebrow">💡 Micro-tip</span>
            <p className="hr-card__tip-body">{baseData.growth_tip}</p>
          </div>
        </div>
      </div>
      <div className="hr-card__axes">
        {baseData.axes.map(a => (
          <div key={a.name} className={'hr-axis-row hr-axis-row--' + a.tier}>
            <span className="hr-axis-row__name">{a.name}</span>
            <div className="hr-axis-row__bar">
              <div className="hr-axis-row__fill" style={{ width: a.score + '%', background: TIER_COLORS[a.tier] }} />
            </div>
            <span className="hr-axis-row__score">{a.score}</span>
            <span className={'hr-axis-row__delta ' + (a.delta >= 0 ? 'is-up' : 'is-down')}>
              {a.delta >= 0 ? '↑' : '↓'} {Math.abs(a.delta * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
      <p className="hr-card__foot">Updates weekly · Compared against your last 4 weeks</p>
    </motion.section>
  );
};