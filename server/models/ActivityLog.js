import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  dimension: {
    type: String,
    required: true,
    enum: ['curiosity', 'consistency', 'collaboration', 'communication', 'leadership', 'creativity', 'research', 'reflection']
  },
  activityType: { type: String, required: true },
  points: { type: Number, required: true },
  appliedPoints: { type: Number, required: true },
  qualityScore: { type: Number, default: 1.0 },
  duration: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

activityLogSchema.index({ email: 1, createdAt: -1 });
activityLogSchema.index({ email: 1, dimension: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;