import mongoose from 'mongoose';

// Badge ledger for the Daily Challenge system. Designed so additional badge
// kinds can be added by extending the `kind` enum.
const challengeBadgeSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', index: true },
  kind: {
    type: String,
    required: true,
    enum: [
      'first-solve',     // solved any daily challenge
      'three-in-a-row',  // solved 3 consecutive days
      'weekly-champ',    // solved all 7 days in a row
      'speed-demon',     // solved under personal time threshold
      'puzzle-master'    // solved N hard puzzles
    ],
    index: true
  },
  level: { type: Number, default: 1 },
  // Optional reference to the challenge that earned the badge
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  challengeDate: { type: String, default: '' },
  awardedAt: { type: Date, default: Date.now }
}, { timestamps: true });

challengeBadgeSchema.index({ email: 1, kind: 1, level: 1 }, { unique: true });

export default mongoose.model('ChallengeBadge', challengeBadgeSchema);
