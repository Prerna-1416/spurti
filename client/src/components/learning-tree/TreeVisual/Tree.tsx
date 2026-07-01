import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Stage, TreeVisualState } from '../../../types/learningTree';
import { STAGE_LABELS } from '../../../types/learningTree';

interface TreeProps {
  visualState: TreeVisualState;
  stage: Stage;
  onTrunkClick: () => void;
}

export const Tree: React.FC<TreeProps> = ({ visualState, stage, onTrunkClick }) => {
  const { trunkHealth, branchCount, leafDensity, glowIntensity } = visualState;

  const trunkWidth = useMemo(() => 20 + Math.min(trunkHealth / 10, 8), [trunkHealth]);
  const trunkHeight = useMemo(() => 60 + Math.min(branchCount * 8, 60), [branchCount, branchCount]);
  const leafOpacity = useMemo(() => leafDensity / 100, [leafDensity]);
  const glowOpacity = useMemo(() => glowIntensity / 100, [glowIntensity]);

  const stageScale = useMemo(() => {
    switch (stage) {
      case 'beginner': return 0.5;
      case 'learner': return 0.7;
      case 'practitioner': return 0.85;
      case 'builder': return 1;
      case 'mentor': return 1.1;
      default: return 0.8;
    }
  }, [stage]);

  return (
    <g transform={`scale(${stageScale})`}>
      {/* Glow effect for mentor/builder stages */}
      {(stage === 'mentor' || stage === 'builder') && (
        <motion.ellipse
          cx={0}
          cy={20}
          rx={80 * glowOpacity}
          ry={100 * glowOpacity}
          fill="url(#glowGradient)"
          opacity={glowOpacity * 0.6}
          animate={{ opacity: [glowOpacity * 0.4, glowOpacity * 0.7, glowOpacity * 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Tree trunk */}
      <motion.rect
        x={-trunkWidth / 2}
        y={0}
        width={trunkWidth}
        height={trunkHeight}
        rx={trunkWidth / 2}
        fill="url(#trunkGradient)"
        onClick={onTrunkClick}
        style={{ cursor: 'pointer' }}
        whileHover={{ scale: 1.05 }}
        animate={{
          fill: trunkHealth > 70 ? '#8B4513' : trunkHealth > 40 ? '#A0522D' : '#CD853F'
        }}
      />

      {/* Roots (visible in later stages) */}
      {stage !== 'beginner' && (
        <g className="roots">
          <motion.line x1={0} y1={trunkHeight} x2={-30} y2={trunkHeight + 25}
            stroke="#8B4513" strokeWidth={3} strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
          <motion.line x1={0} y1={trunkHeight} x2={30} y2={trunkHeight + 25}
            stroke="#8B4513" strokeWidth={3} strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
          <motion.line x1={0} y1={trunkHeight} x2={-15} y2={trunkHeight + 20}
            stroke="#8B4513" strokeWidth={2} strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} />
          <motion.line x1={0} y1={trunkHeight} x2={15} y2={trunkHeight + 20}
            stroke="#8B4513" strokeWidth={2} strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} />
        </g>
      )}

      {/* Branches (8 main directions) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <Branch
          key={angle}
          angle={angle}
          branchXP={(branchCount / 8) * 100}
          index={i}
        />
      ))}

      {/* Leaves cluster (grows with leafDensity) */}
      <motion.g className="leaves" opacity={leafOpacity}>
        {Array.from({ length: Math.floor(leafDensity / 10) + 2 }).map((_, i) => (
          <motion.circle
            key={i}
            cx={(Math.random() - 0.5) * 60}
            cy={-20 - Math.random() * 40}
            r={4 + Math.random() * 6}
            fill="#228B22"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 + Math.random() * 0.3 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        ))}
      </motion.g>

      {/* Center YOU marker */}
      <motion.circle
        cx={0}
        cy={20}
        r={15}
        fill="url(#centerGradient)"
        stroke="#FFD700"
        strokeWidth={2}
        onClick={onTrunkClick}
        style={{ cursor: 'pointer' }}
        whileHover={{ scale: 1.1 }}
        animate={{ r: [15, 16, 15] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <text x={0} y={24} textAnchor="middle" fill="#333" fontSize={10} fontWeight="bold">YOU</text>
    </g>
  );
};

interface BranchProps {
  angle: number;
  branchXP: number;
  index: number;
}

const Branch: React.FC<BranchProps> = ({ angle, branchXP, index }) => {
  const length = 40 + (branchXP / 100) * 30;
  const rad = (angle * Math.PI) / 180;
  const endX = Math.cos(rad) * length;
  const endY = Math.sin(rad) * length - 20;

  const branchColor = '#8B4513';
  const leafColor = '#228B22';

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {/* Branch line */}
      <motion.line
        x1={0}
        y1={0}
        x2={endX}
        y2={endY}
        stroke={branchColor}
        strokeWidth={4}
        strokeLinecap="round"
        style={{ originX: 0, originY: 0 }}
      />

      {/* Small leaves on branch */}
      {branchXP > 30 && (
        <>
          <motion.circle
            cx={endX * 0.6}
            cy={endY * 0.6 - 5}
            r={3}
            fill={leafColor}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          />
          <motion.circle
            cx={endX * 0.8}
            cy={endY * 0.8 + 3}
            r={2}
            fill={leafColor}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
          />
        </>
      )}
    </motion.g>
  );
};

export default Tree;