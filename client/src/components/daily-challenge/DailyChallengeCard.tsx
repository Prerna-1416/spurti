import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// Daily Challenge — N-Queens module
// Client-side board + game flow. All authoritative logic lives
// on the server (challengeGenerator.js). The client NEVER
// decides if a solution is valid — only renders state from
// the server and shows the user's current placement.
// ============================================================

const REWARD_PCT = { 1: '0.4%', 2: '0.3%', 3: '0.2%' };
const PARTICIPATION_PCT = '0.1%';

function fmt2(n) { return String(n).padStart(2, '0'); }

function useCountdown(targetMs) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const remain = Math.max(0, targetMs - now);
  const totalSec = Math.floor(remain / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${fmt2(h)}:${fmt2(m)}:${fmt2(s)}`;
}

// ============================================================
// NQueensBoard
// ============================================================
function NQueensBoard({ n, preplaced, placement, locked, onPlace, onPick, disabled, conflicts }) {
  const cols = Array.from({ length: n }, (_, i) => i);
  const rowAt = (r, c) => {
    const isLocked = locked[r] === c;
    const placed = placement[r] === c;
    const underAttack = conflicts?.attack?.some(([rr, cc]) => rr === r && cc === c);
    return { isLocked, placed, underAttack };
  };
  return (
    <div className="dc-board-wrap">
      <div className="dc-board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, aspectRatio: `${n}/${n}` }}>
        {Array.from({ length: n }, (_, r) =>
          cols.map(c => {
            const { isLocked, placed, underAttack } = rowAt(r, c);
            const isAlt = (r + c) % 2 === 1;
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                className={`dc-cell${isAlt ? ' dc-cell--alt' : ''}${placed ? ' dc-cell--queen' : ''}${isLocked ? ' dc-cell--locked' : ''}${underAttack ? ' dc-cell--attack' : ''}`}
                onClick={() => !disabled && !isLocked && onPlace(r, c)}
                aria-label={`row ${r + 1} column ${c + 1}`}
              >
                {placed && (
                  <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden="true">
                    <path d="M12 2 L13.5 8 L19 9.5 L14.5 13.5 L15.5 19 L12 16 L8.5 19 L9.5 13.5 L5 9.5 L10.5 8 Z" fill="currentColor" />
                    <circle cx="12" cy="12" r="1.5" fill="#fff" />
                  </svg>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================================
// CountdownPill
// ============================================================
function CountdownPill({ targetMs }) {
  const txt = useCountdown(targetMs);
  return (
    <div className="dc-countdown" aria-live="polite">
      <span className="dc-countdown__label">Next challenge in</span>
      <span className="dc-countdown__time">{txt}</span>
    </div>
  );
}

// ============================================================
// DailyChallengeCard
// ============================================================
export function DailyChallengeCard({ email }) {
  const API = (window.location.pathname.startsWith('/spurti') ? '/spurti' : '') + '/api';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [today, setToday] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [countdownMs, setCountdownMs] = useState(0);
  const [placement, setPlacement] = useState([]);
  const [startToken, setStartToken] = useState(null);
  const [serverStart, setServerStart] = useState(null);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const startTimeRef = useRef(null);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API}/challenge/today?email=${encodeURIComponent(email)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'failed to load');
      setToday(j.challenge);
      setAttempt(j.attempt);
      setCountdownMs(j.countdownMs);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [API, email]);

  useEffect(() => { if (email) fetchToday(); }, [email, fetchToday]);

  const handleStart = async () => {
    setBusy(true); setError(null); setResult(null);
    try {
      const r = await fetch(`${API}/challenge/start`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'failed to start');
      setStartToken(j.attempt.startToken);
      setServerStart(new Date(j.attempt.startServerTime));
      // Initialize placement from preplaced
      const p = j.challenge.preplaced.map(v => v == null ? null : v);
      setPlacement(p);
      setMoves(0);
      startTimeRef.current = Date.now();
      setAttempt({ started: true, submitted: false });
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const handlePlace = (r, c) => {
    setPlacement(prev => {
      const next = [...prev];
      // Toggle: same column in same row removes; otherwise replace.
      if (next[r] === c) next[r] = null;
      else next[r] = c;
      return next;
    });
    setMoves(m => m + 1);
  };

  const handleSubmit = async () => {
    setBusy(true); setError(null);
    try {
      const clientDurationMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      const r = await fetch(`${API}/challenge/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, placement, moves, startToken, clientDurationMs })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'submit failed');
      setResult(j);
      // Refresh attempt state
      const t = await fetch(`${API}/challenge/today?email=${encodeURIComponent(email)}`);
      const tj = await t.json();
      setAttempt(tj.attempt);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  // Local conflicts hint — purely advisory, the server still validates.
  const conflicts = useMemo(() => {
    const n = today?.n || 0;
    const attack = [];
    if (!placement.length) return { attack };
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (placement[i] == null || placement[j] == null) continue;
        if (placement[i] === placement[j]) { attack.push([i, placement[i]]); attack.push([j, placement[j]]); }
        else if (Math.abs(placement[i] - placement[j]) === Math.abs(i - j)) {
          attack.push([i, placement[i]]); attack.push([j, placement[j]]);
        }
      }
    }
    return { attack };
  }, [placement, today]);

  if (loading) {
    return <section className="dc-card dc-card--loading"><span>Loading today's challenge…</span></section>;
  }
  if (error) {
    return <section className="dc-card dc-card--error"><span>⚠ {error}</span><button onClick={fetchToday}>Retry</button></section>;
  }
  if (!today) return null;

  const n = today.n;
  const locked = today.preplaced;
  const started = !!attempt?.started;
  const submitted = !!attempt?.submitted;
  const solved = !!attempt?.solved;

  return (
    <section className="dc-card">
      <div className="dc-card__glare" aria-hidden="true" />
      <header className="dc-card__head">
        <div className="dc-card__head-left">
          <span className="dc-card__eyebrow">Daily Challenge</span>
          <h3 className="dc-card__title">{n}-Queens &middot; {today.date}</h3>
        </div>
        <CountdownPill targetMs={Date.now() + countdownMs} />
      </header>

      {!started && (
        <div className="dc-intro">
          <p>Place one queen per row so that no two queens attack each other.</p>
          <p className="dc-intro__hint">Pre-placed (locked) queens must stay where they are.</p>
          <button type="button" className="dc-btn dc-btn--primary" onClick={handleStart} disabled={busy}>Start challenge</button>
        </div>
      )}

      {started && !submitted && (
        <>
          <NQueensBoard n={n} preplaced={locked} placement={placement} locked={locked} onPlace={handlePlace} disabled={busy} conflicts={conflicts} />
          <div className="dc-toolbar">
            <span className="dc-toolbar__moves">Moves: <b>{moves}</b></span>
            <button type="button" className="dc-btn dc-btn--ghost" onClick={() => { setPlacement(locked.map(v => v == null ? null : v)); setMoves(0); }}>Reset</button>
            <button type="button" className="dc-btn dc-btn--primary" onClick={handleSubmit} disabled={busy}>Submit</button>
          </div>
        </>
      )}

      <AnimatePresence>
        {submitted && (
          <motion.div className="dc-result"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
          >
            <NQueensBoard n={n} preplaced={locked} placement={attempt.rank ? Array(n).fill(null) : placement} locked={locked} onPlace={() => {}} disabled={true} conflicts={{}} />
            <div className="dc-result__body">
              <div className="dc-result__title">{solved ? '✅ Solved!' : '❌ Not yet'}</div>
              <div className="dc-result__stats">
                <span>Score: <b>{attempt.score ?? '—'}</b></span>
                <span>Time: <b>{fmtDuration(attempt.durationMs)}</b></span>
                <span>Moves: <b>{attempt.moves ?? '—'}</b></span>
                <span>Rank: <b>{attempt.rank ?? '—'}</b></span>
              </div>
              {attempt.spDelta ? (
                <div className="dc-result__sp">+{attempt.spDelta} SP awarded</div>
              ) : solved ? (
                <div className="dc-result__sp dc-result__sp--pending">SP will be awarded after the leaderboard finalizes at midnight UTC.</div>
              ) : null}
              {result?.validationReason && <div className="dc-result__hint">{result.validationReason}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DailyChallengeStats email={email} attempt={attempt} />
    </section>
  );
}

function fmtDuration(ms) {
  if (!ms && ms !== 0) return '—';
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${fmt2(s)}s`;
}

// ============================================================
// Personal stats row (best / streak / total)
// ============================================================
function DailyChallengeStats({ email, attempt }) {
  const API = (window.location.pathname.startsWith('/spurti') ? '/spurti' : '') + '/api';
  const [data, setData] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API}/challenge/personal?email=${encodeURIComponent(email)}`);
        if (!r.ok) return;
        const j = await r.json();
        if (!cancelled) setData(j);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [API, email, attempt?.score]);
  if (!data) return null;
  return (
    <div className="dc-stats">
      <span>Best: <b>{data.bestScore ?? '—'}</b></span>
      <span>Streak: <b>{data.currentStreak ?? 0}d</b></span>
      <span>Total solves: <b>{data.totalSolves}</b></span>
    </div>
  );
}

// ============================================================
// LeaderboardPanel — for the dedicated tab
// ============================================================
export function DailyChallengeLeaderboard({ date }) {
  const API = (window.location.pathname.startsWith('/spurti') ? '/spurti' : '') + '/api';
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API}/challenge/leaderboard/${date}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'failed');
        if (!cancelled) setData(j);
      } catch (e) { if (!cancelled) setErr(e.message); }
    })();
    return () => { cancelled = true; };
  }, [API, date]);
  if (err) return <div className="dc-leaderboard dc-leaderboard--err">⚠ {err}</div>;
  if (!data) return <div className="dc-leaderboard">Loading…</div>;
  return (
    <div className="dc-leaderboard">
      <h4>Leaderboard &middot; {date}{data.archived ? '' : ' · live'}</h4>
      <table>
        <thead><tr><th>#</th><th>Student</th><th>Score</th><th>Time</th><th>Reward</th></tr></thead>
        <tbody>
          {data.entries.length === 0 && <tr><td colSpan="5" className="dc-leaderboard__empty">No participants yet.</td></tr>}
          {data.entries.map(e => (
            <tr key={e.rank} className={e.solved ? '' : 'dc-row--missed'}>
              <td><b>#{e.rank}</b></td>
              <td>{e.name}</td>
              <td>{e.score ?? '—'}</td>
              <td>{fmtDuration(e.durationMs)}</td>
              <td>{e.spDelta ? `+${e.spDelta} SP` : (e.solved ? '—' : '—')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="dc-reward-legend">
        <span>🥇 1st: +{REWARD_PCT[1]}</span>
        <span>🥈 2nd: +{REWARD_PCT[2]}</span>
        <span>🥉 3rd: +{REWARD_PCT[3]}</span>
        <span>Others (solved): +{PARTICIPATION_PCT}</span>
      </div>
    </div>
  );
}

// ============================================================
// ChallengeHistoryList
// ============================================================
export function DailyChallengeHistory() {
  const API = (window.location.pathname.startsWith('/spurti') ? '/spurti' : '') + '/api';
  const [list, setList] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API}/challenge/history`);
        const j = await r.json();
        if (!r.ok) return;
        if (!cancelled) setList(j);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [API]);
  if (!list) return <div className="dc-history">Loading history…</div>;
  return (
    <div className="dc-history">
      <h4>Past challenges</h4>
      <ul>
        {list.map(c => (
          <li key={c.date} className={c.archived ? '' : 'dc-row--live'}>
            <span className="dc-history__date">{c.date}</span>
            <span className="dc-history__n">{c.n}×{c.n}</span>
            <span className="dc-history__count">{c.winnerCount} winners · {c.participantCount} participants</span>
            <span className="dc-history__status">{c.archived ? 'archived' : 'live'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================
// ChallengeBadges
// ============================================================
export function DailyChallengeBadges({ email }) {
  const API = (window.location.pathname.startsWith('/spurti') ? '/spurti' : '') + '/api';
  const [badges, setBadges] = useState([]);
  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API}/challenge/badges?email=${encodeURIComponent(email)}`);
        if (!r.ok) return;
        const j = await r.json();
        if (!cancelled) setBadges(j);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [API, email]);
  if (!badges.length) return <div className="dc-badges dc-badges--empty">No challenge badges yet — solve your first daily to earn one.</div>;
  return (
    <div className="dc-badges">
      {badges.map(b => (
        <span key={`${b.kind}-${b.level}`} className="dc-badge" title={b.challengeDate}>
          {labelForBadge(b.kind)} L{b.level}
        </span>
      ))}
    </div>
  );
}

function labelForBadge(kind) {
  return ({
    'first-solve': '🧩 First Solve',
    'three-in-a-row': '🔥 3-Day Streak',
    'weekly-champ': '🗓 Weekly Champ',
    'speed-demon': '⚡ Speed Demon',
    'puzzle-master': '👑 Puzzle Master'
  })[kind] || kind;
}
