import React from 'react';
import { motion } from 'framer-motion';

export const PersonaSuggestions = ({ suggestions, personaLabel, personaEmoji }) => {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div className="persona-suggestions" aria-label={`Suggestions for ${personaLabel || 'your persona'}`}>
      <div className="persona-suggestions__head">
        <span className="persona-suggestions__eyebrow">
          <span aria-hidden="true">{personaEmoji || '🧠'}</span>
          <span>Suggestions for your {personaLabel || 'persona'}</span>
        </span>
      </div>
      <ol className="persona-suggestions__list">
        {suggestions.map((s, i) => (
          <motion.li
            key={s.id}
            className="persona-suggestions__item"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.4 }}
            style={{ '--suggest-accent': s.accent || '#7C3AED' }}
          >
            <span
              className="persona-suggestions__num"
              style={{ background: s.accent || '#7C3AED' }}
            >{i + 1}</span>
            <span className="persona-suggestions__label">{s.label}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
};