import mongoose from 'mongoose';

// One row per (student, challenge). A unique index guarantees the student
// can submit only ONE solution — the second attempt attempt hits a duplicate
// key error and is rejected.
const challengeAttemptSchema = new mongoose.Schema({
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
  challengeDate: { type: String, required: true, index: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', index: true },
  // Server-recorded timings (resilient against client clock tampering)
  startServerTime: { type: Date, required: true },
  submitServerTime: { type: Date, default: null },
  durationMs: { type: Number, default: null },
  // The submitted placement as row→col mapping (null until submitted)
  placement: { type: [Number], default: null },
  // Score: lower is better. Combines mistakes (queens under attack) and time.
  score: { type: Number, default: null },
  // Moves = number of times the user placed or moved a queen.
  moves: { type: Number, default: 0 },
  // Final outcome
  solved: { type: Boolean, default: false },
  // Server-side anti-cheat token issued at /start, required at /submit.
  // Random per attempt so a leaked submission cannot be replayed.
  startToken: { type: String, required: true },
  // SP delta awarded (populated when the day is archived)
  spDelta: { type: Number, default: null },
  spAwarded: { type: Boolean, default: false },
  rewardReason: { type: String, default: '' },
  rank: { type: Number, default: null }
}, { timestamps: true });

// Hard uniqueness: one attempt per (email, challenge).
challengeAttemptSchema.index({ email: 1, challengeId: 1 }, { unique: true });
challengeAttemptSchema.index({ challengeDate: 1, score: 1, durationMs: 1, submitServerTime: 1 });

export default mongoose.model('ChallengeAttempt', challengeAttemptSchema);
