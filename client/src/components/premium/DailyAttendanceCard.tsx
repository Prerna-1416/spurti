import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MICRO_COPY = [
  'Today\u2019s session is complete. That is the whole job.',
  'Every learning journey begins with showing up.',
  'You invested in yourself today.',
  'Small, steady, undeniable.',
  'Your future self is taking notes.'
];
const COPY_INTERVAL_MS = 4500;
const SP_REWARD = 10;
const GEO_PARTICLES = 14;

interface DailyAttendanceCardProps {
  email: string;
  pollCompletedDates: string[];
  onClaim: (sp: number) => void;
  streakDays?: number;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0.10, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
    osc1.connect(master);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 1.2);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.18);
    osc2.connect(master);
    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.9);

    const ctx2 = new (window.AudioContext || (window as any).webkitAudioContext)();
    const noise = ctx2.createBufferSource();
    const buf = ctx2.createBuffer(1, ctx2.sampleRate * 0.06, ctx2.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx2.sampleRate * 0.012));
    noise.buffer = buf;
    const ng = ctx2.createGain();
    ng.gain.setValueAtTime(0.035, ctx2.currentTime);
    ng.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.1);
    noise.connect(ng);
    ng.connect(ctx2.destination);
    noise.start(ctx2.currentTime);
  } catch { /* audio unavailable */ }
}

function getTier(days: number): { level: number; title: string } {
  if (days >= 30) return { level: 6, title: 'LEGEND' };
  if (days >= 21) return { level: 5, title: 'MASTER' };
  if (days >= 14) return { level: 4, title: 'DEDICATED' };
  if (days >= 7) return { level: 3, title: 'CONSISTENT' };
  if (days >= 3) return { level: 2, title: 'EXPLORER' };
  return { level: 1, title: 'BEGINNER' };
}

// Intact geode capsule (future node)
const GEO_PATH = 'M36 8 C36 8 44 4 52 4 C60 4 68 8 68 8 L68 44 C68 44 60 48 52 48 C44 48 36 44 36 44 Z';
const GEO_FACETS = [
  'M38 10 L66 10 L66 42 L38 42 Z',
  'M36 8 L38 10 L38 42 L36 44 Z',
  'M68 8 L66 10 L66 42 L68 44 Z',
  'M42 14 L62 14 L62 38 L42 38 Z',
];
// Fractured geode — cracked paths
const FRAC_PATHS = [
  'M36 8 C36 8 44 4 52 4 C60 4 68 8 68 8 L68 44 C68 44 60 48 52 48 C44 48 36 44 36 44 Z',
  'M52 4 L50 16 L54 26 L47 34 L52 48',
  'M54 26 L64 24',
  'M50 16 L40 18',
  'M47 34 L56 36',
];

export const DailyAttendanceCard: React.FC<DailyAttendanceCardProps> = ({
  pollCompletedDates,
  onClaim,
  streakDays = 0
}) => {
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => isoDate(today), [today]);
  const completedSet = useMemo(() => new Set(pollCompletedDates), [pollCompletedDates]);
  const doneToday = completedSet.has(todayIso);
  const tier = useMemo(() => getTier(streakDays), [streakDays]);
  const progressPct = useMemo(() => {
    const weekCompleted = pollCompletedDates.filter(d => {
      const dt = new Date(d);
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return dt >= weekAgo;
    }).length;
    return Math.min(weekCompleted / 7, 1);
  }, [pollCompletedDates]);

  const [claimed, setClaimed] = useState(doneToday);
  const [claiming, setClaiming] = useState(false);
  const [copyIdx, setCopyIdx] = useState(() => Math.floor(Math.random() * MICRO_COPY.length));
  const [displayedSp, setDisplayedSp] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'fracturing' | 'shattered'>('idle');
  const [showInitConfetti, setShowInitConfetti] = useState(true);
  const particleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowInitConfetti(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const nodeStates = useMemo(() => {
    if (claimed || doneToday) return ['done', 'done', 'future'] as const;
    if (streakDays >= 1) return ['done', 'current', 'future'] as const;
    return ['future', 'future', 'future'] as const;
  }, [claimed, doneToday, streakDays]);

  useEffect(() => {
    const id = setInterval(() => {
      setCopyIdx((i) => (i + 1) % MICRO_COPY.length);
    }, COPY_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!claiming) { setDisplayedSp(0); return; }
    const start = performance.now();
    const duration = 700;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplayedSp(Math.round(eased * SP_REWARD));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [claiming]);

  const handleClaim = () => {
    if (claiming || claimed) return;
    playChime();
    setClaiming(true);
    setPhase('fracturing');
    onClaim(SP_REWARD);

    setTimeout(() => setPhase('shattered'), 350);
    setTimeout(() => {
      setClaiming(false);
      setClaimed(true);
      setPhase('idle');
    }, 1200);
  };

  const particles = useMemo(() => {
    if (phase !== 'shattered') return [];
    return Array.from({ length: GEO_PARTICLES }, (_, i) => {
      const angle = (Math.PI * 2 * i) / GEO_PARTICLES + (Math.random() - 0.5) * 0.6;
      const dist = 40 + Math.random() * 80;
      const colors = ['#FCD34D', '#A78BFA', '#FDE68A', '#C084FC', '#DDD6FE', '#818CF8'];
      return {
        id: i, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
        color: colors[i % colors.length],
        shape: (['diamond', 'circle', 'square'] as const)[i % 3],
        size: 2.5 + Math.random() * 4.5, delay: Math.random() * 0.18, rot: Math.random() * 360,
      };
    });
  }, [phase]);

  const initParticles = useMemo(() => {
    if (!showInitConfetti) return [];
    const count = 22;
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 30 + Math.random() * 70;
      const isViolet = i % 2 === 0;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        color: isViolet ? '#A78BFA' : '#FCD34D',
        shape: isViolet ? ('diamond' as const) : ('circle' as const),
        size: 2 + Math.random() * 3,
        delay: Math.random() * 0.3,
        rot: Math.random() * 360,
      };
    });
  }, [showInitConfetti]);

  // SVG ring circumference
  const R = 32;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - progressPct);

  return (
    <motion.article
      className="da-card lift"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className="da-card__bg" aria-hidden="true" />
      <div className="da-card__coords" aria-hidden="true" />
      <div className="da-card__noise" aria-hidden="true" />
      <div className="da-card__glow" aria-hidden="true" />

      {/* ===== LEFT: Learner Identity Matrix ===== */}
      <div className="da-card__identity">
        <div className="da-card__avatar-wrap">
          {/* Outer breathing ring */}
          <div className="da-card__avatar-ring-outer" aria-hidden="true" />
          {/* Progress ring SVG */}
          <svg viewBox="0 0 76 76" className="da-card__avatar-ring-progress" aria-hidden="true">
            <defs>
              <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#818CF8" />
              </linearGradient>
            </defs>
            <circle cx="38" cy="38" r={R} fill="none" stroke="rgba(196,181,253,0.12)" strokeWidth="3" />
            <motion.circle
              cx="38" cy="38" r={R}
              fill="none"
              stroke="url(#ring-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            />
          </svg>
          {/* Avatar */}
          <div className="da-card__avatar">
            <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
              <circle cx="20" cy="15" r="7" fill="rgba(255,255,255,0.3)" />
              <ellipse cx="20" cy="34" rx="12" ry="8" fill="rgba(255,255,255,0.15)" />
            </svg>
          </div>
        </div>

        <div className="da-card__shield">
          <svg viewBox="0 0 100 28" className="da-card__shield-svg" aria-hidden="true">
            <defs>
              <linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
              </linearGradient>
            </defs>
            <rect x="2" y="3" width="96" height="22" rx="11" fill="url(#shield-grad)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" />
          </svg>
          <span className="da-card__shield-text">
            {'\uD83C\uDFC6'} LVL {tier.level} - {tier.title}
          </span>
        </div>

        <div className="da-card__stats">
          <span className="da-card__stats-eyebrow">Today's Harvest</span>
          <motion.div
            className="da-card__stats-sp"
            animate={claiming ? { scale: [1, 1.18, 0.96, 1.06, 1] } : { scale: 1 }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
          >
            <span className="da-card__stats-sp-value">
              {claiming ? `+${displayedSp}` : `+${SP_REWARD}`}
            </span>
            <span className="da-card__stats-sp-label">SP</span>
          </motion.div>
          <span className="da-card__stats-subtext">Based on Engagement</span>
        </div>
      </div>

      {/* Glass divider */}
      <div className="da-card__divider" aria-hidden="true" />

      {/* ===== RIGHT: Quantum Vanguard Path ===== */}
      <div className="da-card__path">
        <header className="da-card__path-head">
          <div className="da-card__path-eyebrow">
            <motion.span
              className="da-card__path-spark"
              aria-hidden="true"
              animate={{ scale: [1, 1.16, 1], rotate: [0, 12, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {'\u2728'}
            </motion.span>
            <span>You showed up today</span>
          </div>
          {streakDays > 0 && (
            <motion.div
              className="da-card__path-streak"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span aria-hidden="true">{'\u{1F525}'}</span>
              <span>{streakDays}d</span>
            </motion.div>
          )}
        </header>

        {/* Horizon path line + nodes */}
        <div className="da-card__path-track">
          <div className="da-card__path-line" aria-hidden="true">
            <motion.div
              className="da-card__path-line-fill"
              initial={{ width: '0%' }}
              animate={{ width: nodeStates[1] === 'current' ? '50%' : nodeStates[0] === 'done' ? '25%' : '0%' }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            />
          </div>

          {/* Mount confetti burst from current node */}
          <AnimatePresence>
            {showInitConfetti && initParticles.length > 0 && (
              <motion.div
                className="da-card__mount-confetti"
                aria-hidden="true"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {initParticles.map((p) => (
                  <motion.span
                    key={p.id}
                    className={'da-card__mount-particle da-card__mount-particle--' + p.shape}
                    style={{
                      background: p.color,
                      boxShadow: `0 0 7px ${p.color}`,
                      width: p.size,
                      height: p.size,
                    }}
                    initial={{ x: 0, y: 0, opacity: 0.9, scale: 0.2, rotate: 0 }}
                    animate={{
                      x: p.x,
                      y: p.y,
                      opacity: [0.9, 0.7, 0],
                      scale: [0.2, 1.1, 0.3],
                      rotate: [0, p.rot, p.rot * 1.5],
                    }}
                    transition={{ duration: 0.8 + p.delay, delay: p.delay, ease: [0.25, 1, 0.5, 1] }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Node 1 — Past */}
          <div className={'da-card__node' + (nodeStates[0] === 'done' ? ' is-done' : ' is-idle')}>
            <div className="da-card__node-marker">
              {nodeStates[0] === 'done' ? (
                <motion.svg viewBox="0 0 28 28" width="28" height="28" className="da-card__node-emerald"
                  initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }} aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="eshard-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#A78BFA" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                  <polygon points="14,2 26,14 14,26 2,14" fill="url(#eshard-grad)"
                    stroke="rgba(167,139,250,0.4)" strokeWidth="1" />
                  <motion.path d="M10 14 L14 18 L19 11" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.2 }} />
                </motion.svg>
              ) : (
                <div className="da-card__node-dot" />
              )}
            </div>
            <span className="da-card__node-label">Week Start</span>
          </div>

          {/* Node 2 — Current */}
          <div className={'da-card__node' + (nodeStates[1] === 'current' ? ' is-current' : nodeStates[1] === 'done' ? ' is-done' : ' is-idle')}>
            <div className="da-card__node-marker">
              {nodeStates[1] === 'done' ? (
                <motion.svg viewBox="0 0 28 28" width="28" height="28" className="da-card__node-emerald"
                  initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }} aria-hidden="true"
                >
                  <polygon points="14,2 26,14 14,26 2,14" fill="url(#eshard-grad)"
                    stroke="rgba(167,139,250,0.4)" strokeWidth="1" />
                  <motion.path d="M10 14 L14 18 L19 11" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.2 }} />
                </motion.svg>
              ) : (
                <>
                  <div className="da-card__node-radar" aria-hidden="true">
                    <span className="da-card__node-radar-ring" />
                  </div>
                  <motion.div
                    className="da-card__node-badge"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    Active Objective
                  </motion.div>
                </>
              )}
            </div>
            <span className="da-card__node-label">Today</span>
          </div>

          {/* Node 3 — Future / Geode capsule */}
          <div
            className={
              'da-card__node da-card__node--geode' +
              (phase === 'fracturing' ? ' is-fracturing' : '') +
              (phase === 'shattered' ? ' is-shattered' : '') +
              (claimed ? ' is-claimed' : '')
            }
            onClick={handleClaim}
            role="button"
            tabIndex={claimed ? -1 : 0}
            aria-label={claimed ? 'Reward claimed' : 'Collect reward'}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClaim(); }}
          >
            <div className="da-card__node-marker">
              <div className="da-card__geode" aria-hidden="true">
                <div className="da-card__geode-glow" />
                <svg viewBox="0 0 104 52" className="da-card__geode-svg">
                  <defs>
                    <linearGradient id="geo-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
                      <stop offset="50%" stopColor="rgba(255,255,255,0.04)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
                    </linearGradient>
                    <radialGradient id="geo-core" cx="50%" cy="42%" r="32%">
                      <stop offset="0%" stopColor="rgba(244,63,94,0.20)" />
                      <stop offset="60%" stopColor="rgba(219,39,119,0.06)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="52" cy="26" rx="28" ry="18" fill="url(#geo-core)" />
                  {(phase === 'fracturing' || phase === 'shattered' ? FRAC_PATHS : [GEO_PATH, ...GEO_FACETS]).map((d, i) => {
                    const isCrack = phase === 'fracturing' || phase === 'shattered';
                    const isFacet = !isCrack && i > 0;
                    const isOutline = !isCrack && i === 0;
                    return (
                      <motion.path
                        key={i}
                        d={d}
                        fill={isCrack && i === 0 ? 'rgba(255,255,255,0.06)' : isFacet ? 'rgba(255,255,255,0.04)' : 'none'}
                        stroke={
                          isCrack && i > 0 ? 'rgba(255,255,255,0.20)' :
                          isOutline ? 'rgba(255,255,255,0.15)' :
                          isFacet ? 'rgba(255,255,255,0.08)' : 'none'
                        }
                        strokeWidth={isCrack && i > 0 ? '1.2' : '0.6'}
                        initial={{ opacity: 1 }}
                        animate={
                          phase === 'shattered' && i < 2
                            ? i === 0
                              ? { x: -20, y: 6, rotate: -12, opacity: 0, scale: 0 }
                              : { x: 18, y: -4, rotate: 10, opacity: 0, scale: 0 }
                            : {}
                        }
                        transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1], delay: i * 0.035 }}
                      />
                    );
                  })}
                  {/* Internal glitter */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <motion.circle
                      key={`gl-${i}`}
                      cx={38 + i * 9 + Math.sin(i * 2.1) * 5}
                      cy={20 + i * 3 + Math.cos(i * 1.7) * 2}
                      r="1.1"
                      fill="rgba(255,255,255,0.30)"
                      animate={{ opacity: [0.15, 0.5, 0.15] }}
                      transition={{ duration: 1.8 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  ))}
                </svg>
              </div>
            </div>
            <span className="da-card__node-label">
              {claimed ? 'Claimed' : 'Reward'}
            </span>
          </div>
        </div>

        {/* Microcopy */}
        <div className="da-card__path-microcopy" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={copyIdx}
              className="da-card__path-copy"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
            >
              {MICRO_COPY[copyIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Particles overlay */}
      <AnimatePresence>
        {phase === 'shattered' && (
          <motion.div
            ref={particleRef}
            className="da-card__particles"
            aria-hidden="true"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className={'da-card__particle da-card__particle--' + p.shape}
                style={{
                  background: p.color,
                  boxShadow: `0 0 8px ${p.color}`,
                  width: p.size,
                  height: p.size,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.3, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: [1, 1, 0],
                  scale: [0.3, 1.2, 0.4],
                  rotate: [0, p.rot, p.rot * 2],
                }}
                transition={{ duration: 0.9 + p.delay, delay: p.delay, ease: [0.25, 1, 0.5, 1] }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};
