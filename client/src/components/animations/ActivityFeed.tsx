import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ActivityEvent =
  | { id: number; type: 'attendance'; sp: number; label: string }
  | { id: number; type: 'poll'; sp: number; label: string }
  | { id: number; type: 'session'; sp: number; label: string }
  | { id: number; type: 'badge'; sp: number; label: string; emoji: string }
  | { id: number; type: 'streak'; sp: number; label: string }
  | { id: number; type: 'project'; sp: number; label: string };

const TYPE_INFO: Record<ActivityEvent['type'], { emoji: string; color: string }> = {
  attendance: { emoji: '✅', color: '#12805c' },
  poll: { emoji: '🗳️', color: '#176b87' },
  session: { emoji: '📚', color: '#6a3aa0' },
  badge: { emoji: '🏆', color: '#d4af37' },
  streak: { emoji: '🔥', color: '#ef4444' },
  project: { emoji: '📁', color: '#0f766e' }
};

interface ActivityFeedProps {
  events: ActivityEvent[];
  feedId?: string;
}

export const ActivityFeedPanel: React.FC<ActivityFeedProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <section className="activity-panel activity-panel--empty">
        <div className="activity-panel__head">
          <span className="activity-panel__eyebrow">Recent Activity</span>
          <span className="activity-panel__live">● Live</span>
        </div>
        <p className="activity-panel__hint">Complete a poll, attend a session, or click <b>▶ Demo</b> below to see this feed come alive.</p>
      </section>
    );
  }
  return (
    <section className="activity-panel">
      <div className="activity-panel__head">
        <span className="activity-panel__eyebrow">Recent Activity</span>
        <span className="activity-panel__live">● Live</span>
      </div>
      <ul className="activity-panel__list">
        <AnimatePresence initial={false}>
          {events.map(e => {
            const info = TYPE_INFO[e.type];
            return (
              <motion.li
                key={e.id}
                layout
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                style={{ '--evt-color': info.color } as React.CSSProperties}
              >
                <span className="activity-panel__emoji">{info.emoji}</span>
                <div className="activity-panel__body">
                  <strong>{e.label}</strong>
                  <em>+{e.sp} SP</em>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
};

interface ActivityFeedToastsProps {
  toasts: Array<ActivityEvent & { visible: boolean }>;
  onExpire: (id: number) => void;
}

export const ActivityFeedToasts: React.FC<ActivityFeedToastsProps> = ({ toasts, onExpire }) => {
  return (
    <div className="activity-toasts" aria-live="polite">
      <AnimatePresence>
        {toasts.filter(t => t.visible).slice(0, 3).map(t => {
          const info = TYPE_INFO[t.type];
          return (
            <motion.div
              key={t.id}
              className="activity-toast"
              style={{ '--evt-color': info.color } as React.CSSProperties}
              initial={{ x: 100, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              onAnimationComplete={() => {
                setTimeout(() => onExpire(t.id), 4200);
              }}
            >
              <span className="activity-toast__emoji">{info.emoji}</span>
              <div className="activity-toast__body">
                <strong>{t.label}</strong>
                <em>+{t.sp} SP</em>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

interface ActivityFeedControllerProps {
  events: ActivityEvent[];
  setEvents: React.Dispatch<React.SetStateAction<ActivityEvent[]>>;
  setRecentToast: (e: ActivityEvent) => void;
}

export const ActivityFeedController: React.FC<ActivityFeedControllerProps> = ({ events, setEvents, setRecentToast }) => {
  return null;
};

export function pushActivity(
  setEvents: React.Dispatch<React.SetStateAction<ActivityEvent[]>>,
  event: Omit<ActivityEvent, 'id'>,
  setRecentToast?: (e: ActivityEvent) => void
): void {
  const id = Date.now() + Math.random();
  const full = { ...event, id } as ActivityEvent;
  setEvents(prev => [full, ...prev].slice(0, 12));
  if (setRecentToast) {
    setRecentToast(full);
  }
}