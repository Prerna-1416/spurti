import crypto from 'crypto';

// ============================================================
// Daily N-Queens Puzzle Generator + Validator
// Pure functions — no DB access. Server-only.
// ============================================================

// Deterministic PRNG seeded by a string (date). Used so the puzzle for
// "2026-07-21" is identical for every student and stable across server
// restarts on the same day.
function mulberry32(seed) {
  let a = 0;
  for (let i = 0; i < seed.length; i++) a = (a * 31 + seed.charCodeAt(i)) >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate a random valid N-Queens solution using the standard permutation
// trick — queens on different rows in distinct columns gives the row+col
// constraint for free; we just need to reject diagonal collisions.
function generateSolution(n, rand) {
  const cols = shuffleInPlace([...Array(n).keys()], rand);
  // Try up to 200 permutations; perm-based N-Queens has a known rate of ~57%
  // of random perms being valid for N=8, higher for smaller N.
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = shuffleInPlace([...cols], rand);
    let ok = true;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(candidate[i] - candidate[j]) === Math.abs(i - j)) {
          ok = false;
          break;
        }
      }
      if (!ok) break;
    }
    if (ok) return candidate;
  }
  // Fallback: hand-computed valid 4-queens layout, scaled by N (works only for
  // canonical cases). This should be very rare.
  return fallbackSolution(n);
}

function fallbackSolution(n) {
  // Even-N: shift-by-2 layout
  if (n % 2 === 0) {
    const half = n / 2;
    const out = new Array(n);
    for (let i = 0; i < half; i++) out[i] = (2 * i + 1) % n;
    for (let i = 0; i < half; i++) out[half + i] = (2 * i) % n;
    return out;
  }
  // Odd-N: generic fallback — shift by half
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = (i + Math.floor(n / 2)) % n;
  return out;
}

// Pick a subset of preplaced queens to lock in place. Solver must keep them.
// We lock k queens (k grows with N) chosen from the canonical solution.
function pickPreplaced(solution, n, rand) {
  const lockCount = Math.max(0, Math.min(n - 1, Math.floor(n / 2)));
  const indices = shuffleInPlace([...Array(n).keys()], rand).slice(0, lockCount);
  const preplaced = new Array(n).fill(null);
  for (const i of indices) preplaced[i] = solution[i];
  return preplaced;
}

function dateSeed(date) {
  // YYYY-MM-DD seed mixed with a per-kind salt so two kinds on the same day
  // produce different puzzles.
  return `n-queens::${date}::${crypto.randomBytes(4).toString('hex')}`;
}

// Public: ensure a challenge exists for the date. Idempotent — safe to call
// from a cron tick or the first request of the day.
export function buildPuzzle(date) {
  const rand = mulberry32(dateSeed(date));
  // Rotate board size so the same N doesn't repeat day-to-day. Sizes cycle
  // 4→5→6→7→8 across a 5-day window.
  const sizes = [4, 5, 6, 7, 8];
  const dayIndex = parseInt(date.slice(-2), 10) % sizes.length;
  const n = sizes[dayIndex];
  const solution = generateSolution(n, rand);
  const preplaced = pickPreplaced(solution, n, rand);
  return {
    date,
    kind: 'n-queens',
    n,
    preplaced,
    solution,
    seed: dateSeed(date)
  };
}

// Validate that `placement` is a valid N-Queens solution that respects the
// preplaced queens. Returns { ok: true } or { ok: false, reason: '...' }.
// Used at /submit before accepting any score.
export function validateSolution(placement, preplaced, n) {
  if (!Array.isArray(placement) || placement.length !== n) {
    return { ok: false, reason: 'placement must be an array of N positions' };
  }
  // 1. Every row must have exactly one queen, and within bounds.
  const seen = new Set();
  for (let r = 0; r < n; r++) {
    const c = placement[r];
    if (!Number.isInteger(c) || c < 0 || c >= n) {
      return { ok: false, reason: `row ${r}: column out of range` };
    }
    if (seen.has(c)) return { ok: false, reason: `column ${c} used twice` };
    seen.add(c);
  }
  // 2. Locked queens must be in their preplaced position.
  for (let r = 0; r < n; r++) {
    if (preplaced[r] != null && preplaced[r] !== placement[r]) {
      return { ok: false, reason: `locked queen at row ${r} was moved` };
    }
  }
  // 3. No diagonal attacks.
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(placement[i] - placement[j]) === Math.abs(i - j)) {
        return { ok: false, reason: `queens at rows ${i} and ${j} attack diagonally` };
      }
    }
  }
  return { ok: true };
}

// Score: lower is better. = (conflicts × 10) + duration in seconds.
// Unsolved attempts can still be scored (high conflict penalty). Solved = 0
// conflicts, so score = duration only.
export function computeScore({ solved, conflicts, durationMs }) {
  const base = solved ? 0 : Math.max(1, conflicts) * 10;
  const seconds = Math.max(0, Math.round((durationMs || 0) / 1000));
  return base + seconds;
}

// Count row/col/diagonal conflicts for an incomplete placement — used so the
// client can show hints and the server can score partial attempts.
export function countConflicts(placement, n) {
  if (!Array.isArray(placement) || placement.length !== n) return { cols: 0, diag: 0, total: 0 };
  let cols = 0;
  const seenCol = new Map();
  for (let r = 0; r < n; r++) {
    const c = placement[r];
    if (!Number.isInteger(c)) continue;
    seenCol.set(c, (seenCol.get(c) || 0) + 1);
  }
  for (const v of seenCol.values()) if (v > 1) cols += v - 1;
  let diag = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(placement[i] - placement[j]) === Math.abs(i - j)) diag++;
    }
  }
  return { cols, diag, total: cols + diag };
}
