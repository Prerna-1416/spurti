import mongoose from 'mongoose';

const aiRecommendationSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  recommendationType: {
    type: String,
    required: true,
    enum: ['stage_hint', 'dimension_suggestion', 'weather_alert', 'streak_reminder', 'milestone_achieved']
  },
  message: { type: String, required: true },
  suggestedDimensions: [{
    type: String,
    enum: ['curiosity', 'consistency', 'collaboration', 'communication', 'leadership', 'creativity', 'research', 'reflection']
  }],
  urgency: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

aiRecommendationSchema.index({ email: 1, read: 1, createdAt: -1 });

const AIRecommendation = mongoose.model('AIRecommendation', aiRecommendationSchema);

export default AIRecommendation;