import React from 'react';
import { motion } from 'framer-motion';
import type { Stage } from '../../../types/learningTree';
import { STAGE_LABELS } from '../../../types/learningTree';

interface StageIndicatorProps {
  stage: Stage;
  stageProgress: number;
  totalBranchXP: number;
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({ stage, stageProgress, totalBranchXP }) => {
  const stages: Stage[] = ['beginner', 'learner', 'practitioner', 'builder', 'mentor'];
  const currentIndex = stages.indexOf(stage);

  const nextStageXP = {
    beginner: 501,
    learner: 1501,
    practitioner: 3501,
    builder: 6001,
    mentor: null
  };

  const nextXP = nextStageXP[stage];
  const xpToNext = nextXP ? nextXP - totalBranchXP : 0;

  return (
    <motion.div
      className="stage-indicator"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="stage-display">
        <span className="current-stage">{stageLabels[stage]}</span>
        <span className="stage-xp">{totalBranchXP.toLocaleString()} XP</span>
      </div>

      <div className="stage-progress-bar">
        <motion.div
          className="stage-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${stageProgress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      <div className="stage-labels">
        {stages.map((s, i) => (
          <motion.div
            key={s}
            className={`stage-label ${i <= currentIndex ? 'active' : ''} ${i === currentIndex ? 'current' : ''}`}
            initial={{ opacity: 0.4 }}
            animate={{
              opacity: i <= currentIndex ? 1 : 0.4,
              scale: i === currentIndex ? 1.1 : 1
            }}
            transition={{ delay: i * 0.1 }}
          >
            <span className="stage-icon">{s === 'beginner' ? '🌱' : s === 'learner' ? '📚' : s === 'practitioner' ? '⚡' : s === 'builder' ? '🏗' : '👑'}</span>
            <span className="stage-name">{s}</span>
          </motion.div>
        ))}
      </div>

      {nextXP && (
        <p className="next-milestone">
          {xpToNext.toLocaleString()} XP to <strong>{stageLabels[stages[currentIndex + 1]]}</strong>
        </p>
      )}
    </motion.div>
  );
};

export default StageIndicator;