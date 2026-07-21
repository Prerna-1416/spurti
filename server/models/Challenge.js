import mongoose from 'mongoose';

// Daily challenge (N-Queens for v1). Designed to be extensible to other game
// kinds (sudoku, maze, etc.) by adding to the `kind` enum. Each student gets
// the SAME puzzle for a given date — see services/challengeGenerator.js.
const challengeSchema = new mongoose.Schema({
  // Date stamp (UTC midnight). One puzzle per kind per date.
  date: { type: String, required: true, index: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  kind: { type: String, required: true, enum: ['n-queens'], default: 'n-queens', index: true },
  // Board size (N×N).
  n: { type: Number, required: true, min: 4, max: 12 },
  // Pre-placed (locked) queen positions the solver must keep. Stored as a
  // sparse array: preplaced[row] = col, or undefined if empty.
  preplaced: { type: [Number], default: [] },
  // A canonical valid solution (row → col). The validator checks user
  // submissions against the rules; this is the "model answer" used only
  // for scoring hints (not exposed to the client).
  solution: { type: [Number], required: true },
  // Deterministic seed (date-based) — keeps the puzzle reproducible.
  seed: { type: String, required: true },
  // Lifecycle
  generatedAt: { type: Date, default: Date.now },
  archivedAt: { type: Date, default: null }, // set when the daily leaderboard finalizes
  // Final per-day leaderboard snapshot (populated when archived)
  winnerCount: { type: Number, default: 0 },
  // Number of participants (any outcome)
  participantCount: { type: Number, default: 0 }
}, { timestamps: true });

challengeSchema.index({ date: 1, kind: 1 }, { unique: true });

export default mongoose.model('Challenge', challengeSchema);
