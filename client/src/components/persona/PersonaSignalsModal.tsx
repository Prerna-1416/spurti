import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PERSONAS } from './personas.js';

function fmt(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (Math.abs(n) >= 100) return Math.round(n).toLocaleString();
  return Math.round(n * 10) / 10 + '';
}

function SignalRow({ label, value, hint, good }) {
  return (
    <div className={'pp-signal' + (good === true ? ' is-good' : good === false ? ' is-bad' : '')}>
      <span className="pp-signal__label">{label}</span>
      <span className="pp-signal__value">{fmt(value)}</span>
      <span className="pp-signal__hint">{hint}</span>
    </div>
  );
}

export function PersonaSignalsModal({ open, onClose, personaId, signals }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const persona = PERSONAS[personaId] || PERSONAS.learning;
  const s = signals || {};

  const contributionPct = Math.round((Number(s.contributionScore) || 0));
  const meaningfulPct = Math.round((Number(s.meaningfulSpRatio) || 0) * 100);

  const explainers = [];
  if (personaId === 'contributor') {
    explainers.push(`Your contribution_score is in the top tier — mostly from helping peers and documenting sessions.`);
    explainers.push(`Of your recent SP, ${meaningfulPct}% came from meaningful actions (not raw attendance/login).`);
  } else if (personaId === 'achiever') {
    explainers.push(`You're ranked ${s.rank || '—'} of ${s.cohortSize || '—'} in your cohort.`);
    explainers.push(`Your meaningful_sp_ratio is ${meaningfulPct}% — you're earning SP the right way.`);
  } else if (personaId === 'explorer') {
    explainers.push(`Your activity_diversity_score is ${s.activityDiversityScore || 0}% — you try many activity types.`);
  } else if (personaId === 'consistent_learner') {
    explainers.push(`Your attendance streak is ${s.attendanceStreak || 0} days — the chain is unbroken.`);
  } else if (personaId === 'curious_learner') {
    explainers.push(`Your poll_attempt_rate is ${s.pollAttemptRate || 0}% — you engage deeply with polls.`);
  } else if (personaId === 'recovering_learner') {
    explainers.push(`Recent attendance has slipped below 50%, and your SP trend is negative.`);
    explainers.push(`This is a nudge, not a label — show up to your next session and the trend flips.`);
  } else {
    explainers.push(`We need a few more days of activity data to lock in your persona.`);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pp-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="pp-modal"
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="pp-modal-title"
          >
            <button className="pp-modal__close" onClick={onClose} aria-label="Close">×</button>
            <span className="pp-modal__eyebrow">Why this persona?</span>
            <h3 id="pp-modal-title" className="pp-modal__title">
              <span aria-hidden="true">{persona.emoji}</span>
              <span>{persona.label}</span>
            </h3>

            <p className="pp-modal__lead">{persona.description}</p>

            <div className="pp-modal__explainers">
              {explainers.map((line, i) => (
                <p key={i} className="pp-modal__explainer">
                  <span aria-hidden="true">•</span>
                  <span>{line}</span>
                </p>
              ))}
            </div>

            <h4 className="pp-modal__section">Signals that fed the classifier</h4>
            <div className="pp-modal__signals">
              <SignalRow label="Contribution score"        value={`${contributionPct} / 100`} hint="Top 20% unlocks Contributor. Heuristic blend of meaningful SP, diversity, recent contribution SP." good={contributionPct >= 70} />
              <SignalRow label="Meaningful SP ratio (7d)"  value={`${meaningfulPct}%`}        hint="% of your recent SP earned via meaningful actions (not raw attendance/login)."        good={meaningfulPct >= 40} />
              <SignalRow label="Attendance rate"            value={`${s.attendanceRate || 0}%` }      hint="Sessions marked fully attended / total sessions."                                        good={(s.attendanceRate || 0) >= 70} />
              <SignalRow label="Poll attempt rate"          value={`${s.pollAttemptRate || 0}%`   }  hint="Poll questions answered / total questions asked."                                       good={(s.pollAttemptRate || 0) >= 70} />
              <SignalRow label="Activity diversity"         value={`${s.activityDiversityScore || 0}%`} hint="Number of different activity types tried this period, normalised."                  good={(s.activityDiversityScore || 0) >= 60} />
              <SignalRow label="SP trend (7d)"              value={`${fmt(s.spTrend7d)}`}            hint="Change in your SP balance over the last 7 days."                                        good={(s.spTrend7d || 0) > 0} />
              <SignalRow label="Attendance streak"          value={`${s.attendanceStreak || 0} d`}    hint="Days in a row you've shown up."                                                            good={(s.attendanceStreak || 0) >= 5} />
              <SignalRow label="Rank / cohort"              value={`${s.rank || '—'} / ${s.cohortSize || '—'}`} hint="Higher rank means more competitive cohort placement."                                good={(s.rank || 999) <= (s.cohortSize || 1) * 0.2} />
            </div>

            <p className="pp-modal__footnote">
              Personas recalculate every 7 days. The classification engine is a pure function — it can be swapped for an ML model later without changing this UI.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}