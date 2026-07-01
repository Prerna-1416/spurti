import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  points: { type: Number, required: true },
  qualityScore: { type: Number, default: 1.0 },
  duration: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const learningDimensionSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  dimension: {
    type: String,
    required: true,
    enum: ['curiosity', 'consistency', 'collaboration', 'communication', 'leadership', 'creativity', 'research', 'reflection'],
    index: true
  },
  branchXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  growthPercent: { type: Number, default: 0 },
  activities: [activitySchema],
  streakDays: { type: Number, default: 0 },
  lastActivityAt: { type: Date, default: null },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

learningDimensionSchema.index({ email: 1, dimension: 1 }, { unique: true });

learningDimensionSchema.methods.calculateGrowthPercent = function() {
  const xp = this.branchXP;
  if (xp <= 100) return Math.round((xp / 100) * 25);
  if (xp <= 250) return 25 + Math.round(((xp - 100) / 150) * 25);
  if (xp <= 500) return 50 + Math.round(((xp - 250) / 250) * 25);
  return 75 + Math.min(Math.round(((xp - 500) / 500) * 25), 25);
};

learningDimensionSchema.methods.calculateLevel = function() {
  const xp = this.branchXP;
  if (xp >= 501) return Math.min(10, 1 + Math.floor(xp / 100));
  if (xp >= 251) return 7;
  if (xp >= 101) return Math.floor(xp / 50) + 1;
  return Math.max(1, Math.floor(xp / 100) + 1);
};

const LearningDimension = mongoose.model('LearningDimension', learningDimensionSchema);

export default LearningDimension;