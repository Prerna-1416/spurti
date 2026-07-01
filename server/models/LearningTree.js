import mongoose from 'mongoose';

const treeVisualStateSchema = new mongoose.Schema({
  trunkHealth: { type: Number, default: 50 },
  branchCount: { type: Number, default: 0 },
  leafDensity: { type: Number, default: 0 },
  glowIntensity: { type: Number, default: 0 }
}, { _id: false });

const learningWeatherSchema = new mongoose.Schema({
  type: { type: String, enum: ['spring', 'summer', 'autumn', 'winter'], default: 'spring' },
  motivation: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  curiosity: { type: String, enum: ['excellent', 'good', 'medium', 'low'], default: 'good' },
  confidence: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  stress: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
}, { _id: false });

const weeklyMetricsSchema = new mongoose.Schema({
  categoriesActive: { type: Number, default: 0 },
  totalActivities: { type: Number, default: 0 },
  avgQuality: { type: Number, default: 0 }
}, { _id: false });

const learningTreeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  totalBranchXP: { type: Number, default: 0 },
  stage: {
    type: String,
    enum: ['beginner', 'learner', 'practitioner', 'builder', 'mentor'],
    default: 'beginner'
  },
  stageProgress: { type: Number, default: 0 },
  treeVisualState: { type: treeVisualStateSchema, default: () => ({}) },
  learningWeather: { type: learningWeatherSchema, default: () => ({}) },
  weeklyMetrics: { type: weeklyMetricsSchema, default: () => ({}) },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

learningTreeSchema.methods.calculateStage = function() {
  const xp = this.totalBranchXP;
  const activeCategories = this.weeklyMetrics?.categoriesActive || 0;

  if (xp >= 6000 && activeCategories >= 7) return 'mentor';
  if (xp >= 3501 && activeCategories >= 6) return 'builder';
  if (xp >= 1501 && activeCategories >= 5) return 'practitioner';
  if (xp >= 501 && activeCategories >= 3) return 'learner';
  return 'beginner';
};

learningTreeSchema.methods.calculateStageProgress = function() {
  const xp = this.totalBranchXP;
  const stage = this.stage;

  const thresholds = {
    beginner: { next: 'learner', min: 0, max: 500 },
    learner: { next: 'practitioner', min: 501, max: 1500 },
    practitioner: { next: 'builder', min: 1501, max: 3500 },
    builder: { next: 'mentor', min: 3501, max: 6000 },
    mentor: { next: null, min: 6000, max: null }
  };

  const current = thresholds[stage];
  if (!current.next) return 100;

  const progress = ((xp - current.min) / (current.max - current.min)) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
};

const LearningTree = mongoose.model('LearningTree', learningTreeSchema);

export default LearningTree;