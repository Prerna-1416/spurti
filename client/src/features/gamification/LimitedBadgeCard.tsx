import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GamificationState,
  LIMITED_BADGE_THRESHOLD,
  getOrInitBadge,
  markBadgeSeen,
  saveState,
  simulatedBadgeProgress
} from './storage';

interface LimitedBadgeCardProps {
  email: string;
  state: GamificationState;
  setState: React.Dispatch<React.SetStateAction<GamificationState>>;
}

const TODAY_BADGES = [
  {
    id: 'research_pioneer_v1',
    title: 'Research Pioneer',
    description: 'Submit a research question in this week\'s reflection circle.',
    accent: '#c93a2a'
  },
  {
    id: 'early_bird_v1',
    title: 'Early Bird',
    description: 'Submit today\'s poll within the first 10 minutes of opening.',
    accent: '#d4a017'
  },
  {
    id: 'peer_mentor_v1',
    title: 'Peer Mentor',
    description: 'Help a fellow student on a stuck problem this week.',
    accent: '#4ea355'
  }
];

export const LimitedBadgeCard: React.FC<LimitedBadgeCardProps> = ({ email, state, setState }) => {
  const [activeBadgeId, setActiveBadgeId] = useState<string>(TODAY_BADGES[0].id);
  const [nowTick, setNowTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNowTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let next = state;
    let changed = false;
    for (const b of TODAY_BADGES) {
      if (!next.badgeUnlocks[b.id]) {
        next = getOrInitBadge(next, b.id, email);
        changed = true;
      }
    }
    if (changed) {
      setState(next);
      saveState(email, next);
    }
  }, [email, state, setState, nowTick]);

  const activeBadge = TODAY_BADGES.find(b => b.id === activeBadgeId) || TODAY_BADGES[0];
  const liveProgress = useMemo(() => simulatedBadgeProgress(email, activeBadgeId), [email, activeBadgeId, nowTick]);
  const lockedState = state.badgeUnlocks[activeBadgeId];
  const displayRank = lockedState?.simulatedRank ?? liveProgress.rank;
  const unlocked = displayRank <= LIMITED_BADGE_THRESHOLD;
  const isNewUnlock = lockedState && !lockedState.seenAt && unlocked;

  const handleClaim = () => {
    if (!unlocked) return;
    const next = markBadgeSeen(state, activeBadgeId);
    setState(next);
    saveState(email, next);
  };

  return (
    <div className={'gamify-card gamify-card--badge' + (unlocked ? ' is-unlocked' : ' is-locked')}>
      <div className="gamify-card__icon" aria-hidden="true" style={{ color: activeBadge.accent }}>
        <span className="badge-medal">🏅</span>
      </div>
      <div className="gamify-card__body">
        <span className="gamify-card__eyebrow">Limited Reward · First {LIMITED_BADGE_THRESHOLD}</span>
        <h3 className="gamify-card__title">{activeBadge.title}</h3>
        <p className="gamify-card__lede">{activeBadge.description}</p>

        <div className="badge-progress" role="progressbar" aria-valuemin="0" aria-valuemax={LIMITED_BADGE_THRESHOLD} aria-valuenow={Math.min(displayRank, LIMITED_BADGE_THRESHOLD)}>
          <div className="badge-progress__track">
            <div
              className="badge-progress__fill"
              style={{
                width: `${Math.min(100, (displayRank / LIMITED_BADGE_THRESHOLD) * 100)}%`,
                background: activeBadge.accent
              }}
            />
            <span className="badge-progress__cutoff" />
          </div>
          <div className="badge-progress__meta">
            <span><b>{Math.min(displayRank, LIMITED_BADGE_THRESHOLD)}</b> / {LIMITED_BADGE_THRESHOLD} claimed</span>
            <span className={unlocked ? 'badge-progress__state is-yes' : 'badge-progress__state is-no'}>
              {unlocked ? '🎉 You are in' : '⏳ Locked'}
            </span>
          </div>
        </div>

        <div className="badge-tabs">
          {TODAY_BADGES.map(b => {
            const liveR = simulatedBadgeProgress(email, b.id).rank;
            const ok = liveR <= LIMITED_BADGE_THRESHOLD;
            return (
              <button
                key={b.id}
                type="button"
                className={'badge-tab' + (b.id === activeBadgeId ? ' is-active' : '') + (ok ? ' is-ok' : '')}
                onClick={() => setActiveBadgeId(b.id)}
                title={b.title}
              >
                <span className="badge-tab__dot" style={{ background: b.accent }} />
                <span className="badge-tab__label">{b.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="badge-claim"
          onClick={handleClaim}
          disabled={!unlocked || !isNewUnlock}
        >
          {unlocked ? (isNewUnlock ? 'Claim badge' : '✓ Claimed') : 'Out of reach — try tomorrow'}
        </button>
      </div>

      <AnimatePresence>
        {unlocked && isNewUnlock && (
          <motion.div
            className="badge-celebrate"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            ✨ You're in the first {LIMITED_BADGE_THRESHOLD}!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};