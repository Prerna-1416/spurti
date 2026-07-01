import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Recommendation } from '../../../types/learningTree';

interface AIAdvisorProps {
  recommendations: Recommendation[];
  onDismiss: (id: string) => void;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ recommendations, onDismiss }) => {
  if (recommendations.length === 0) return null;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#DC143C';
      case 'medium': return '#FFA500';
      case 'low': return '#32CD32';
      default: return '#666';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stage_hint': return '🎯';
      case 'dimension_suggestion': return '💡';
      case 'weather_alert': return '⚠️';
      case 'streak_reminder': return '🔥';
      case 'milestone_achieved': return '🏆';
      default: return '💭';
    }
  };

  return (
    <motion.div
      className="advisor-card"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="advisor-title">🤖 AI Growth Advisor</h3>

      <div className="recommendations-list">
        <AnimatePresence>
          {recommendations.map((rec) => (
            <motion.div
              key={rec._id}
              className="recommendation"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ borderLeftColor: getUrgencyColor(rec.urgency) }}
            >
              <div className="rec-header">
                <span className="rec-icon">{getTypeIcon(rec.recommendationType)}</span>
                <span className="rec-urgency" style={{ color: getUrgencyColor(rec.urgency) }}>
                  {rec.urgency}
                </span>
                <button
                  className="rec-dismiss"
                  onClick={() => onDismiss(rec._id)}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>

              <p className="rec-message">{rec.message}</p>

              {rec.suggestedDimensions && rec.suggestedDimensions.length > 0 && (
                <div className="rec-suggestions">
                  <span className="suggest-label">Try:</span>
                  {rec.suggestedDimensions.map((dim) => (
                    <span key={dim} className="suggestion-tag">
                      {dim}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AIAdvisor;