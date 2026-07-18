import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StandingCardProps {
  rank: number;
  totalSp: number;
  pointsToTop50: number;
  pointsToNextRank: number;
  top50Cutoff: number;
  missedAttendance?: boolean;
  bestRank?: number;
}

const PATH_D = 'M 25,42 C 80,14 140,14 200,42 C 260,70 320,70 380,42 C 440,14 500,14 575,42';

const MILESTONES_CFG = [
  { label: '100 SP', sp: 100, pct: 0.2 },
  { label: '300 SP', sp: 300, pct: 0.5 },
  { label: '500 SP', sp: 500, pct: 0.8 },
  { label: 'Top 50', sp: Infinity, pct: 1.0, isDestination: true },
];

const MS_INFO: Record<number, { reward: string; desc: string }> = {
  100: { reward: 'Early Bird Badge', desc: 'Foundation' },
  300: { reward: 'Consistency Seal', desc: 'Building Momentum' },
  500: { reward: "Scholar's Mark", desc: 'Deep Engagement' },
};

interface Notif {
  id: number; sp: number; label: string;
}

function activityLabel(delta: number): string {
  if (delta >= 20) return 'Weekly Bonus';
  if (delta >= 10) return 'Attendance Completed';
  if (delta >= 5) return 'Poll Completed';
  return 'SP Earned';
}

function sparkPts(count: number, pts: { x: number; y: number }[]) {
  const result: { x: number; y: number; delay: number }[] = [];
  for (let i = 0; i < count; i++) {
    const pct = 0.05 + (i / count) * 0.7 + Math.random() * 0.15;
    const idx = Math.round(Math.min(pct, 1) * 100);
    const pos = pts[Math.min(idx, pts.length - 1)] || { x: 50, y: 30 };
    result.push({ x: pos.x, y: pos.y, delay: i * 1.0 + Math.random() * 0.6 });
  }
  return result;
}

export const StandingCard: React.FC<StandingCardProps> = ({
  rank, totalSp, pointsToTop50, pointsToNextRank, top50Cutoff, missedAttendance, bestRank,
}) => {
  const isTop50 = rank <= 50;
  const pathRef = useRef<SVGPathElement>(null);
  const [pts, setPts] = useState<{ x: number; y: number }[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [hoveredMs, setHoveredMs] = useState<number | null>(null);
  const [clickedMs, setClickedMs] = useState<number | null>(null);
  const [pathHovered, setPathHovered] = useState(false);
  const notifId = useRef(0);
  const prevPos = useRef({ x: 25, y: 42 });
  const prevSp = useRef(totalSp);
  const [isLeaping, setIsLeaping] = useState(false);
  const [leapFrom, setLeapFrom] = useState({ x: 25, y: 42 });

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    const arr: { x: number; y: number }[] = [];
    for (let i = 0; i <= 100; i++) arr.push(el.getPointAtLength((i / 100) * len));
    setPts(arr);
  }, []);

  const pct = useMemo(() => {
    if (isTop50 || pointsToTop50 <= 0) return 1;
    return Math.min(totalSp / Math.max(top50Cutoff, 1), 1);
  }, [totalSp, top50Cutoff, pointsToTop50, isTop50]);

  const pinIdx = useMemo(() => pts.length ? Math.min(Math.round(pct * 100), pts.length - 1) : 0, [pts, pct]);
  const pinPos = pts[pinIdx] || { x: 25, y: 42 };

  const milestones = useMemo(() => MILESTONES_CFG.map(m => {
    const idx = Math.round(m.pct * 100);
    const pos = pts[idx];
    return { ...m, x: pos?.x ?? 0, y: pos?.y ?? 0, reached: m.isDestination ? isTop50 : totalSp >= m.sp };
  }), [pts, totalSp, isTop50]);

  const [displayPts, setDisplayPts] = useState(pointsToNextRank);
  const prevPtsRef = useRef(pointsToNextRank);
  useEffect(() => {
    const from = prevPtsRef.current;
    const to = pointsToNextRank;
    if (from === to) return;
    const diff = from - to;
    if (diff <= 0) { setDisplayPts(to); prevPtsRef.current = to; return; }
    const dur = 800;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setDisplayPts(Math.round(from - diff * (1 - (1 - p) * (1 - p))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    prevPtsRef.current = to;
    return () => cancelAnimationFrame(raf);
  }, [pointsToNextRank]);

  useEffect(() => {
    if (totalSp > prevSp.current) {
      const g = totalSp - prevSp.current;
      const id = ++notifId.current;
      setNotifs(p => [...p, { id, sp: g, label: activityLabel(g) }]);
      setTimeout(() => setNotifs(p => p.filter(n => n.id !== id)), 2600);
      setLeapFrom(prevPos.current);
      setIsLeaping(true);
      setTimeout(() => setIsLeaping(false), 900);
    }
    prevSp.current = totalSp;
  }, [totalSp]);

  useEffect(() => { prevPos.current = pinPos; }, [pinPos]);

  useEffect(() => {
    if (clickedMs === null) return;
    const t = setTimeout(() => setClickedMs(null), 1000);
    return () => clearTimeout(t);
  }, [clickedMs]);

  const nextMs = useMemo(() => MILESTONES_CFG.find(m => !m.isDestination && totalSp < m.sp), [totalSp]);
  const progPct = useMemo(() => {
    if (isTop50 || pointsToTop50 <= 0) return 100;
    return Math.min(Math.round((totalSp / Math.max(top50Cutoff, 1)) * 100), 99);
  }, [totalSp, top50Cutoff, isTop50, pointsToTop50]);

  const sparkles = useMemo(() => pts.length ? sparkPts(4, pts) : [], [pts]);

  const particles = useMemo(() => Array.from({ length: 4 }).map((_, i) => ({
    ox: (i - 1.5) * 5, oy: (i % 2 === 0 ? -3 : 3), delay: i * 0.05,
  })), []);

  const pathStatus = missedAttendance ? 'Needs Attention' : 'On Track';
  const nextMsLabel = nextMs ? `${nextMs.sp} SP` : 'Top 50';

  return (
    <motion.section
      className="standing-v2"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="standing-v2__glare" aria-hidden="true" />

      <div className="standing-v2__head">
        <div className="standing-v2__head-left">
          <span className="standing-v2__eyebrow">Standing</span>
          <h3 className="standing-v2__rank">Rank #{rank}</h3>
          <p className="standing-v2__sub">
            {isTop50 ? 'You are in the Top 50.' : `${Math.ceil(displayPts)} SP to next rank`}
            <svg className="standing-v2__info-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="#9CA3AF" strokeWidth="0.8" />
              <text x="6" y="8" textAnchor="middle" fontSize="7" fontWeight="700" fill="#9CA3AF">i</text>
            </svg>
          </p>
        </div>
        <button className="standing-v2__action" type="button">View Details &gt;</button>
      </div>

      <div className="standing-v2__trail"
        onMouseEnter={() => setPathHovered(true)}
        onMouseLeave={() => setPathHovered(false)}
      >
        <AnimatePresence>
          {pathHovered && (
            <motion.div className="standing-v2__path-tip"
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -1 }}
              transition={{ duration: 0.15 }}
            >
              <span>Rank #{rank}</span>
              <span className="standing-v2__path-tip--muted">{totalSp} SP</span>
              <span className="standing-v2__path-tip--muted">
                {nextMs ? `${totalSp}/${nextMs.sp} to ${nextMs.label}` : 'Destination reached'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <svg viewBox="0 0 600 60" className="standing-v2__svg">
          <defs>
            <linearGradient id="sv2c" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <filter id="sv2g">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="sv2s"><feGaussianBlur stdDeviation="1" result="b" /></filter>
            <filter id="tt-shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.06" />
            </filter>
          </defs>

          <path ref={pathRef} d={PATH_D} fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />

          <motion.path
            d={PATH_D} fill="none" stroke="url(#sv2c)" strokeWidth="2" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: pct }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            style={{ filter: 'url(#sv2g)' }}
          />

          <motion.path
            d={PATH_D} fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: pct, opacity: isLeaping ? 0.12 : 0.05 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            style={{ filter: 'url(#sv2s)' }}
          />

          {isLeaping && particles.map(p => (
            <motion.circle
              key={`pt-${p.id}`}
              r="1.8" fill="#10B981" opacity={0.5}
              initial={{ x: leapFrom.x + p.ox, y: leapFrom.y + p.oy }}
              animate={{ x: pinPos.x + p.ox * 0.4, y: pinPos.y + p.oy * 0.4, opacity: 0 }}
              transition={{ duration: 0.7 + p.delay, ease: 'easeOut', delay: p.delay }}
            />
          ))}

          {sparkles.map((s, i) => (
            <motion.circle
              key={`sp-${i}`} r="1.2" fill="#34D399"
              cx={s.x} cy={s.y}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0], y: s.y - 4 }}
              transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
            />
          ))}

          {missedAttendance && (() => {
            const ri = Math.round(0.12 * 100);
            const rp = pts[Math.min(ri, pts.length - 1)] || { x: 90, y: 45 };
            return (
              <g>
                <rect x={rp.x - 7} y={rp.y - 6} width="14" height="12" rx="3" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.8" />
                <text x={rp.x} y={rp.y + 3} textAnchor="middle" fontSize="8" fill="#D97706" fontWeight="800">!</text>
              </g>
            );
          })()}

          {milestones.map((m, i) => {
            if (m.isDestination) {
              return (
                <g key={`ms-${i}`}>
                  <line x1={m.x} y1={m.y - 4} x2={m.x} y2={m.y + 6} stroke={isTop50 ? '#10B981' : '#3B82F6'} strokeWidth="1.5" />
                  <motion.g
                    style={{ transformOrigin: `${m.x}px ${m.y}px` }}
                    animate={{ rotate: [0, -5, 0, 5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <path d={`M ${m.x + 1},${m.y - 3} L ${m.x + 9},${m.y} L ${m.x + 1},${m.y + 3} Z`} fill={isTop50 ? '#10B981' : '#3B82F6'} opacity={isTop50 ? 0.9 : 0.7} />
                  </motion.g>
                </g>
              );
            }
            return (
              <g key={`ms-${i}`} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredMs(i)}
                onMouseLeave={() => setHoveredMs(null)}
                onClick={() => setClickedMs(i)}
              >
                <AnimatePresence>
                  {clickedMs === i && (
                    <motion.circle
                      cx={m.x} cy={m.y} r={m.reached ? 5 : 4}
                      fill="none" stroke="#10B981" strokeWidth="2"
                      initial={{ r: m.reached ? 5 : 4, opacity: 0.6 }}
                      animate={{ r: (m.reached ? 5 : 4) + 6, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  )}
                </AnimatePresence>
                <motion.circle
                  cx={m.x} cy={m.y} r={m.reached ? 5 : 4}
                  fill={m.reached ? '#10B981' : '#F9FAFB'}
                  stroke={m.reached ? '#34D399' : '#D1D5DB'}
                  strokeWidth={m.reached ? 1.5 : 1}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.25, delay: i * 0.06 }}
                  style={m.reached ? { filter: 'drop-shadow(0 0 5px rgba(16,185,129,0.4))' } : undefined}
                />
                {m.reached ? (
                  <svg x={m.x - 4} y={m.y - 4} width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M 2.5,6 L 5,8.5 L 9.5,3" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg x={m.x - 4} y={m.y - 4} width="8" height="10" viewBox="0 0 12 14" fill="none">
                    <path d="M 3,6 V 4 A 3,3 0 0 1 9,4 V 6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                    <rect x="2" y="6" width="8" height="6" rx="1" stroke="#9CA3AF" strokeWidth="1.5" />
                  </svg>
                )}
                <text x={m.x} y={m.y + 13} textAnchor="middle" fill={m.reached ? '#10B981' : '#9CA3AF'} fontSize="7" fontWeight="700">
                  {m.label}
                </text>
                <AnimatePresence>
                  {hoveredMs === i && (
                    <motion.g
                      initial={{ opacity: 0, y: -2, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -1, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                      <rect x={m.x - 36} y={m.y - 34} width="72" height="28" rx="6" fill="#FFF" stroke="#E5E7EB" strokeWidth="0.6" filter="url(#tt-shadow)" />
                      <text x={m.x} y={m.y - 24} textAnchor="middle" fill={m.reached ? '#10B981' : '#6B7280'} fontSize="6.5" fontWeight="800">
                        {m.reached ? '\u2713 Unlocked' : `${m.sp - totalSp} SP to unlock`}
                      </text>
                      <text x={m.x} y={m.y - 17} textAnchor="middle" fill="#9CA3AF" fontSize="6" fontWeight="600">
                        {m.reached ? (MS_INFO[m.sp]?.reward ?? 'Milestone') : (MS_INFO[m.sp]?.reward ?? `Reach ${m.sp} SP`)}
                      </text>
                      <text x={m.x} y={m.y - 11} textAnchor="middle" fill="#D1D5DB" fontSize="5.5" fontWeight="500">
                        {m.reached ? (MS_INFO[m.sp]?.desc ?? 'Completed') : `${totalSp}/${m.sp} SP`}
                      </text>
                    </motion.g>
                  )}
                </AnimatePresence>
              </g>
            );
          })}

          <motion.g
            animate={{ x: pinPos.x, y: pinPos.y }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.8 }}
          >
            <ellipse cx={0} cy={6} rx="5" ry="1.5" fill="rgba(245,158,11,0.12)" />
            <motion.g
              animate={isLeaping ? { scale: [1, 1.25, 0.9, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <circle cx={0} cy={0} r="7" fill="rgba(0,0,0,0.06)" style={{ filter: 'url(#sv2s)' }} transform="translate(0, 1)" />
              <circle cx={0} cy={0} r="7" fill="#FFF" stroke="#F59E0B" strokeWidth="2" />
              <circle cx={0} cy={0} r="3" fill="#F59E0B" />
            </motion.g>
            <motion.circle
              cx={0} cy={0} r="7" fill="none" stroke="#F59E0B" strokeWidth="1" opacity={0.3}
              animate={{ r: [7, 13], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', repeatDelay: 1.5 }}
            />
          </motion.g>
        </svg>

        <AnimatePresence>
          {notifs.map(n => (
            <motion.div
              key={n.id} className="standing-v2__toast"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: -12 }}
              exit={{ opacity: 0, y: -22 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            >
              <span className="standing-v2__toast-sp">+{n.sp} SP</span>
              <span className="standing-v2__toast-label">{n.label}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {missedAttendance && (
        <div className="standing-v2__block">
          <span className="standing-v2__block-icon">{'\u26A0'}</span>
          <span className="standing-v2__block-text">Route Delayed &middot; Complete today's poll to recover.</span>
        </div>
      )}

      <div className="standing-v2__suggested">
        <div className="standing-v2__suggested-label">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M 2,5 L 4.5,7.5 L 8,2" stroke="#6B7280" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>SUGGESTED PATH</span>
        </div>
        <div className="standing-v2__chips">
          <button className="standing-v2__chip" type="button">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M 2,5 L 4.5,7.5 L 8,2" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Attend Tomorrow
            <span className="standing-v2__chip-sp">+10 SP</span>
          </button>
          <span className="standing-v2__arrow">{'\u2193'}</span>
          <button className="standing-v2__chip" type="button">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M 2,5 L 4.5,7.5 L 8,2" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Today's Poll
            <span className="standing-v2__chip-sp">+5 SP</span>
          </button>
          <span className="standing-v2__arrow">{'\u2193'}</span>
          <button className="standing-v2__chip" type="button">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M 2,5 L 4.5,7.5 L 8,2" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Maintain Streak
            <span className="standing-v2__chip-sp">+5 SP</span>
          </button>
        </div>
        <div className="standing-v2__arrival">
          <span className="standing-v2__arrival-label">Estimated Arrival</span>
          <span className="standing-v2__arrival-value">Top 50</span>
          <span className="standing-v2__arrival-sub">This Week</span>
        </div>
      </div>

      <div className="standing-v2__status">
        <div className="standing-v2__stat">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M 2,5 L 4.5,7.5 L 8,2" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="standing-v2__stat--green">{pathStatus}</span>
        </div>
        <div className="standing-v2__stat">
          <span className="standing-v2__stat-text">Progress</span>
          <span className="standing-v2__stat--blue">{progPct}%</span>
        </div>
        <div className="standing-v2__stat">
          <span className="standing-v2__stat-text">Next</span>
          <span className="standing-v2__stat--purple">{nextMsLabel}</span>
        </div>
        <div className="standing-v2__stat">
          <span className="standing-v2__stat-text">Best</span>
          <span className="standing-v2__stat--blue">#{bestRank ?? rank}</span>
        </div>
      </div>
    </motion.section>
  );
};
