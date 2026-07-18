import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PERSONAS, PERSONA_ACCENTS } from './personas.js';

function formatDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return '—'; }
}

export const PersonaHistoryTab = ({ classification, history = [], lastUpdated }) => {
  const personaId = classification?.personaId || 'learning';
  const persona = PERSONAS[personaId] || PERSONAS.learning;
  const accent = PERSONA_ACCENTS[persona.accent] || PERSONA_ACCENTS.rose;

  const reversedHistory = useMemo(() => [...history].reverse(), [history]);

  return (
    <section className="persona-tab">
      <div className="persona-tab__current">
        <div
          className="persona-tab__current-icon"
          style={{
            background: `radial-gradient(circle, ${accent.fill}, transparent 70%), ${persona.gradient}`,
            borderColor: accent.ring
          }}
        >
          <span aria-hidden="true">{persona.emoji}</span>
        </div>
        <div className="persona-tab__current-text">
          <span className="persona-tab__current-eyebrow">CURRENT PERSONA</span>
          <h3 className="persona-tab__current-name">{persona.label}</h3>
          <p className="persona-tab__current-desc">{persona.description}</p>
          <span className="persona-tab__current-meta">
            Set {formatDate(lastUpdated)} · recalculates every 7 days
          </span>
        </div>
      </div>

      <div className="persona-tab__mission-block">
        <span className="persona-tab__section-eyebrow">ACTIVE MISSION</span>
        <h4 className="persona-tab__mission-text">{persona.mission.text}</h4>
        <div className="persona-tab__mission-bar">
          <div className="persona-tab__mission-track">
            <motion.div
              className="persona-tab__mission-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (persona.mission.progress / persona.mission.target) * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ background: accent.bar, boxShadow: `0 0 12px ${accent.bar}` }}
            />
          </div>
          <span className="persona-tab__mission-counter" style={{ color: accent.text }}>
            {persona.mission.progress} / {persona.mission.target}
          </span>
        </div>
      </div>

      <div className="persona-tab__history">
        <span className="persona-tab__section-eyebrow">HISTORY</span>
        {reversedHistory.length === 0 ? (
          <div className="persona-tab__history-empty">
            <p>
              Your persona will start showing here once you have a few weeks of activity on record.
              Classifications roll over automatically.
            </p>
          </div>
        ) : (
          <ul className="persona-tab__history-list">
            {reversedHistory.map((entry, i) => {
              const p = PERSONAS[entry.personaId] || PERSONAS.learning;
              const a = PERSONA_ACCENTS[p.accent] || PERSONA_ACCENTS.rose;
              return (
                <li key={i} className="persona-tab__history-item">
                  <span
                    className="persona-tab__history-emoji"
                    style={{ background: `radial-gradient(circle, ${a.fill}, transparent 70%)`, borderColor: a.ring }}
                  >
                    {p.emoji}
                  </span>
                  <div className="persona-tab__history-body">
                    <strong>{p.label}</strong>
                    <span className="persona-tab__history-meta">
                      {formatDate(entry.assignedAt)}
                      {entry.missionCompleted ? ' · ✓ Mission complete' : ' · Mission in progress'}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="persona-tab__footnote">
        Personas are computed from your activity signals: attendance rate, poll attempt rate, activity diversity, SP trend,
        contribution score (heuristic blend of meaningful SP and recent contribution-style transactions), and meaningful SP ratio
        (% of recent SP from meaningful actions). Recalculated every 7 days.
      </p>
    </section>
  );
};