import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PERSONAS, PERSONA_ACCENTS } from './personas.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function formatLastUpdated(d) {
  if (!d) return 'Updated just now';
  const diffMin = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (diffMin < 1) return 'Updated just now';
  if (diffMin < 60) return 'Updated ' + diffMin + ' min ago';
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return 'Updated ' + diffHr + ' hr ago';
  const diffDay = Math.floor(diffHr / 24);
  return 'Updated ' + diffDay + ' day' + (diffDay > 1 ? 's' : '') + ' ago';
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value || 0);
  const fromRef = useRef(value || 0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = fromRef.current;
    const delta = (value || 0) - from;
    const dur = 700;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + delta * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    fromRef.current = value || 0;
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return display;
}

function computeDailyMetrics(profile) {
  if (!profile) return { sessions: 0, polls: 0, spToday: 0, streak: 0 };
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = Date.now() - SEVEN_DAYS_MS;
  const sessionsToday = (profile.attendance || []).filter(a => {
    const t = a.dateTime || a.sessionDate;
    if (!t) return false;
    return new Date(t).toISOString().slice(0, 10) === today && a.qualified;
  }).length;
  const pollsToday = (profile.polls || []).filter(p => {
    const t = p.dateTime;
    if (!t) return false;
    return new Date(t).toISOString().slice(0, 10) === today;
  }).reduce((s, p) => s + Math.max(0, p.attemptedQuestions || 0), 0);
  const spToday = (profile.transactions || []).filter(tx => {
    const t = tx.dateTime;
    if (!t) return false;
    return new Date(t).toISOString().slice(0, 10) === today && (tx.appliedDelta || 0) > 0;
  }).reduce((s, tx) => s + (tx.appliedDelta || 0), 0);
  return { sessions: sessionsToday, polls: pollsToday, spToday, streak: 0 };
}

export function AIPersonaCard({ classification, profile, totalSp, streakDays = 0, onWhyClick, lastUpdated }) {
  const personaId = classification?.personaId || 'learning';
  const persona = PERSONAS[personaId] || PERSONAS.learning;
  const accent = PERSONA_ACCENTS[persona.accent] || PERSONA_ACCENTS.rose;
  const insufficient = !!classification?.insufficient;
  const unlockProgress = classification?.unlockProgress ?? Math.min(7, classification?.signals?.daysOfActivity || 0);
  const unlockTarget = classification?.unlockTarget ?? 7;

  const daily = useMemo(() => computeDailyMetrics(profile), [profile]);
  const spDisplay = AnimatedNumber({ value: totalSp || 0 });

  return (
    <motion.div
      id="ai-persona-card"
      className={'ai-persona-card' + (insufficient ? ' is-insufficient' : '')}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
    >
      <div className="ai-persona-card__bg" aria-hidden="true" />

      <div className="ai-persona-card__head">
        <div className="ai-persona-card__head-left">
          <span className="ai-persona-card__eyebrow">🧠 LEARNING PERSONA</span>
          <span className="ai-persona-card__ai-pill">
            <span aria-hidden="true">✨</span>
            <span>AI POWERED</span>
          </span>
        </div>
        <div className="ai-persona-card__sp">
          <span className="ai-persona-card__sp-eyebrow">Spurti Points</span>
          <span className="ai-persona-card__sp-value">{spDisplay.toLocaleString()}</span>
        </div>
      </div>

      <div className="ai-persona-card__body">
        <div
          className="ai-persona-card__persona-icon"
          style={{
            background: insufficient
              ? 'radial-gradient(circle, ' + accent.fill + ', transparent 70%)'
              : 'radial-gradient(circle, ' + accent.fill + ', transparent 70%), ' + persona.gradient,
            borderColor: accent.ring
          }}
        >
          <span className="ai-persona-card__persona-emoji" aria-hidden="true">{persona.emoji}</span>
          <span className="ai-persona-card__persona-ring" style={{ borderColor: accent.ring }} />
        </div>

        <div className="ai-persona-card__body-text">
          <h3 className="ai-persona-card__name">{persona.label}</h3>
          <p className="ai-persona-card__desc">{persona.description}</p>
        </div>
      </div>

      <div className="ai-persona-card__metrics" aria-label="Today's engagement">
        <div className="ai-persona-card__metric">
          <span className="ai-persona-card__metric-value" style={{ color: daily.sessions > 0 ? '#10B981' : 'rgba(255,255,255,0.5)' }}>{daily.sessions}</span>
          <span className="ai-persona-card__metric-label">sessions today</span>
        </div>
        <div className="ai-persona-card__metric-sep" />
        <div className="ai-persona-card__metric">
          <span className="ai-persona-card__metric-value" style={{ color: daily.polls > 0 ? '#3B82F6' : 'rgba(255,255,255,0.5)' }}>{daily.polls}</span>
          <span className="ai-persona-card__metric-label">polls today</span>
        </div>
        <div className="ai-persona-card__metric-sep" />
        <div className="ai-persona-card__metric">
          <span className="ai-persona-card__metric-value" style={{ color: daily.spToday > 0 ? '#FBBF24' : 'rgba(255,255,255,0.5)' }}>+{daily.spToday}</span>
          <span className="ai-persona-card__metric-label">SP today</span>
        </div>
        <div className="ai-persona-card__metric-sep" />
        <div className="ai-persona-card__metric">
          <span className="ai-persona-card__metric-value" style={{ color: streakDays > 0 ? '#F97316' : 'rgba(255,255,255,0.5)' }}>🔥 {streakDays}</span>
          <span className="ai-persona-card__metric-label">day streak</span>
        </div>
      </div>

      <div className="ai-persona-card__mission">
        <div className="ai-persona-card__mission-head">
          <span className="ai-persona-card__mission-eyebrow">{insufficient ? 'KEEP SHOWING UP' : 'THIS WEEK\'S MISSION'}</span>
          <button type="button" className="ai-persona-card__why" onClick={onWhyClick} aria-label="Why this persona?">
            <span aria-hidden="true">ⓘ</span>
            <span>WHY THIS PERSONA?</span>
          </button>
        </div>
        {insufficient ? (
          <p className="ai-persona-card__insufficient-text">
            Your persona unlocks after {unlockTarget - unlockProgress} more day{(unlockTarget - unlockProgress) > 1 ? 's' : ''} of activity. Keep showing up.
          </p>
        ) : (
          <div className="ai-persona-card__mission-row">
            <p className="ai-persona-card__mission-text">{persona.mission.text}</p>
            <div className="ai-persona-card__mission-progress">
              <div className="ai-persona-card__bar-track">
                <motion.div
                  className="ai-persona-card__bar-fill"
                  style={{ background: accent.bar, boxShadow: '0 0 10px ' + accent.bar }}
                  initial={{ width: 0 }}
                  animate={{ width: Math.min(100, (persona.mission.progress / persona.mission.target) * 100) + '%' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <span className="ai-persona-card__mission-counter" style={{ color: accent.text }}>
                {persona.mission.progress}/{persona.mission.target}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="ai-persona-card__foot">
        <span>{formatLastUpdated(lastUpdated)}</span>
        <span className="ai-persona-card__foot-sep">·</span>
        <span>Recalculates every 7 days</span>
      </div>
    </motion.div>
  );
}