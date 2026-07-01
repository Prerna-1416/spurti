import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BranchDetail } from '../../../types/learningTree';
import { DIMENSION_LABELS } from '../../../types/learningTree';

interface BranchModalProps {
  branch: BranchDetail | null;
  onClose: () => void;
}

export const BranchModal: React.FC<BranchModalProps> = ({ branch, onClose }) => {
  if (!branch) return null;

  const { label, color, xp, level, growthPercent, streakDays, activities, activitySummary, monthlyGrowth } = branch;

  const growthStage = growthPercent < 25 ? 'Seedling' : growthPercent < 50 ? 'Growing' : growthPercent < 75 ? 'Mature' : 'Fully Grown';

  return (
    <AnimatePresence>
      <motion.div
        className="branch-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="branch-modal"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="branch-modal-header" style={{ borderLeftColor: color }}>
            <div>
              <h2>{label} Branch 🌳</h2>
              <p className="branch-subtitle">{growthStage} - {growthPercent}% growth</p>
            </div>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          <div className="branch-stats">
            <div className="stat-card">
              <span className="stat-value">{xp.toLocaleString()}</span>
              <span className="stat-label">XP</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{level}</span>
              <span className="stat-label">Level</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{streakDays}</span>
              <span className="stat-label">Day Streak</span>
            </div>
            <div className="stat-card">
              <span className="stat-value" style={{ color: monthlyGrowth > 0 ? '#32CD32' : '#DC143C' }}>
                {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth}
              </span>
              <span className="stat-label">This Month</span>
            </div>
          </div>

          <div className="growth-bar-container">
            <div className="growth-bar">
              <motion.div
                className="growth-fill"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${growthPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <span className="growth-label">{growthPercent}%</span>
          </div>

          {Object.keys(activitySummary).length > 0 && (
            <div className="activity-summary">
              <h4>Activity Summary</h4>
              <div className="summary-grid">
                {Object.entries(activitySummary).map(([type, data]) => (
                  <div key={type} className="summary-item">
                    <span className="summary-type">{type.replace(/_/g, ' ')}</span>
                    <span className="summary-count">{data.count}x</span>
                    <span className="summary-points">+{data.totalPoints} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="recent-activities">
            <h4>Recent Activities</h4>
            {activities.length === 0 ? (
              <p className="empty-state">No activities yet. Start learning to grow this branch!</p>
            ) : (
              <div className="activity-list">
                {activities.slice(0, 10).map((activity, i) => (
                  <motion.div
                    key={i}
                    className="activity-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="activity-info">
                      <span className="activity-type">{activity.type.replace(/_/g, ' ')}</span>
                      <span className="activity-date">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="activity-points">
                      <span className="points-value">+{activity.points}</span>
                      {activity.qualityScore < 1 && (
                        <span className="quality-badge">Q: {Math.round(activity.qualityScore * 100)}%</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BranchModal;