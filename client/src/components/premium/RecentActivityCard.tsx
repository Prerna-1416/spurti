import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_META: Record<string, { emoji: string; color: string; bg: string }> = {
  attendance: { emoji: '✅', color: '#12805c', bg: 'rgba(18, 128, 92, 0.08)' },
  poll:        { emoji: '🗳️', color: '#176b87', bg: 'rgba(23, 107, 135, 0.08)' },
  session:     { emoji: '📚', color: '#6a3aa0', bg: 'rgba(106, 58, 160, 0.08)' },
  badge:       { emoji: '🏆', color: '#d4af37', bg: 'rgba(212, 175, 55, 0.1)' },
  streak:      { emoji: '🔥', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
  project:     { emoji: '📁', color: '#0f766e', bg: 'rgba(15, 118, 110, 0.08)' },
  login:       { emoji: '🌞', color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)' },
  research:    { emoji: '🔬', color: '#c93a2a', bg: 'rgba(201, 58, 42, 0.08)' }
};

interface Activity {
  id: number;
  type: keyof typeof TYPE_META;
  sp: number;
  label: string;
  timeAgo?: string;
}

interface RecentActivityCardProps {
  activities: Activity[];
  emptyHint?: string;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities, emptyHint }) => {
  return (
    <div className="recent-activity-card">
      <div className="recent-activity-card__head">
        <span className="recent-activity-card__eyebrow">⚡ Recent Activities</span>
        <span className="recent-activity-card__count">{activities.length} {activities.length === 1 ? 'event' : 'events'}</span>
      </div>

      {activities.length === 0 ? (
        <p className="recent-activity-card__hint">
          {emptyHint || 'No activity yet. Complete a poll, attend a session, or click ▶ Demo to see this feed come alive.'}
        </p>
      ) : (
        <ul className="recent-activity-card__list">
          <AnimatePresence initial={false}>
            {activities.slice(0, 8).map((a, i) => {
              const meta = TYPE_META[a.type] || TYPE_META.poll;
              return (
                <motion.li
                  key={a.id}
                  layout
                  initial={{ x: 60, opacity: 0, scale: 0.96 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: -40, opacity: 0, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 30, delay: i * 0.04 }}
                  style={{ '--row-color': meta.color, '--row-bg': meta.bg } as React.CSSProperties}
                >
                  <span className="recent-activity-card__emoji">{meta.emoji}</span>
                  <div className="recent-activity-card__body">
                    <strong>{a.label}</strong>
                    <em>{a.timeAgo || 'Just now'}</em>
                  </div>
                  <span className="recent-activity-card__sp">+{a.sp} SP</span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};