import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLearningTree } from '../../hooks/useLearningTree';
import { Tree } from './TreeVisual/Tree';
import { FeatherOrbit, FeatherTooltip } from './Feathers/Feather';
import { useFeatherPhysics } from '../../hooks/useFeatherPhysics';
import { WeatherDisplay } from './LearningWeather/WeatherDisplay';
import { AIAdvisor } from './Advisor/AIAdvisor';
import { StageIndicator } from './StageIndicator/StageProgress';
import { BranchModal } from './BranchDetail/BranchModal';
import type { FeatherData, Dimension } from '../../types/learningTree';
import { DIMENSIONS, DIMENSION_LABELS } from '../../types/learningTree';

interface LearningTreeProps {
  onClose?: () => void;
}

export const LearningTree: React.FC<LearningTreeProps> = ({ onClose }) => {
  const { treeData, weather, recommendations, loading, error, refresh, logActivity, dismissRecommendation } = useLearningTree();
  const [selectedBranch, setSelectedBranch] = useState<Dimension | 'trunk' | null>(null);
  const [hoveredFeather, setHoveredFeather] = useState<FeatherData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [centerX, centerY] = [400, 300];
  const orbitRadius = 180;

  const angles = useMemo(() => DIMENSIONS.map((_, i) => i * 45 - 90), []);

  const featherPositions = useFeatherPhysics({
    centerX,
    centerY,
    orbitRadius,
    featherCount: 8,
    angles
  });

  const handleBranchClick = useCallback((dimension: Dimension | 'trunk') => {
    setSelectedBranch(dimension);
  }, []);

  const handleFeatherHover = useCallback((feather: FeatherData | null) => {
    setHoveredFeather(feather);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const svg = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - svg.left,
      y: e.clientY - svg.top
    });
  }, []);

  const handleLogActivity = useCallback(async (dimension: Dimension, activityType: string) => {
    try {
      await logActivity({
        dimension,
        activityType,
        duration: 5,
        qualityScore: 0.9
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }, [logActivity]);

  if (loading) {
    return (
      <div className="learning-tree-loading">
        <div className="loading-spinner" />
        <p>Growing your learning tree...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learning-tree-error">
        <p>Error: {error}</p>
        <button onClick={refresh}>Retry</button>
      </div>
    );
  }

  if (!treeData) {
    return null;
  }

  const { stage, stageProgress, totalBranchXP, treeVisual, branches, feathers } = treeData;

  const feathersData: FeatherData[] = DIMENSIONS.map((dim, i) => ({
    dimension: dim,
    color: feathers[dim]?.glowing ? '#FFD700' : getDimensionColor(dim),
    label: DIMENSION_LABELS[dim],
    angle: angles[i],
    level: feathers[dim]?.level || 1,
    growth: branches[dim]?.growth || 0,
    glowing: feathers[dim]?.glowing || false
  }));

  return (
    <div className="learning-tree-container">
      <div className="learning-tree-header">
        <h2>🌳 Your Learning Tree</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      <div className="learning-tree-content">
        <div className="tree-sidebar left">
          <StageIndicator
            stage={stage}
            stageProgress={stageProgress}
            totalBranchXP={totalBranchXP}
          />

          {weather && <WeatherDisplay weather={weather} />}
        </div>

        <div className="tree-main">
          <svg
            viewBox="0 0 800 600"
            className="tree-svg"
            onMouseMove={handleMouseMove}
          >
            <defs>
              <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B4513" />
                <stop offset="50%" stopColor="#A0522D" />
                <stop offset="100%" stopColor="#8B4513" />
              </linearGradient>
              <linearGradient id="centerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
              </linearGradient>
              <radialGradient id="glowGradient">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
              </radialGradient>
              <filter id="shadow">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Tree visualization centered */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              <Tree
                visualState={treeVisual}
                stage={stage}
                onTrunkClick={() => handleBranchClick('trunk')}
              />
            </g>

            {/* Feathers orbiting the tree */}
            <FeatherOrbit
              feathers={feathersData}
              positions={featherPositions}
              onFeatherHover={handleFeatherHover}
            />

            {/* Tooltip */}
            <FeatherTooltip
              feather={hoveredFeather}
              position={mousePos}
            />
          </svg>

          {/* Branch quick access */}
          <div className="branch-quick-access">
            <h4>Explore Branches</h4>
            <div className="branch-buttons">
              {DIMENSIONS.map((dim) => (
                <motion.button
                  key={dim}
                  className="branch-btn"
                  style={{ borderColor: getDimensionColor(dim) }}
                  onClick={() => handleBranchClick(dim)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="branch-dot" style={{ backgroundColor: getDimensionColor(dim) }} />
                  <span className="branch-name">{DIMENSION_LABELS[dim]}</span>
                  <span className="branch-xp">{branches[dim]?.xp || 0} XP</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="tree-sidebar right">
          <AIAdvisor
            recommendations={recommendations}
            onDismiss={dismissRecommendation}
          />

          {/* Quick Activity Panel */}
          <div className="quick-activity">
            <h4>Quick Activities</h4>
            <p className="hint">Log learning activities to grow your tree</p>

            <div className="activity-buttons">
              <button
                className="activity-btn"
                onClick={() => handleLogActivity('curiosity', 'question_asked')}
              >
                ❓ Ask Question
              </button>
              <button
                className="activity-btn"
                onClick={() => handleLogActivity('consistency', 'daily_streak_bonus')}
              >
                🔥 Daily Streak
              </button>
              <button
                className="activity-btn"
                onClick={() => handleLogActivity('reflection', 'journal_entry')}
              >
                📝 Journal Entry
              </button>
              <button
                className="activity-btn"
                onClick={() => handleLogActivity('research', 'paper_read')}
              >
                📚 Read Paper
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Branch detail modal */}
      <BranchModal
        branch={selectedBranch ? (selectedBranch === 'trunk' ? null : null) : null}
        onClose={() => setSelectedBranch(null)}
      />
    </div>
  );
};

function getDimensionColor(dim: Dimension): string {
  const colors: Record<Dimension, string> = {
    curiosity: '#FFD700',
    consistency: '#4169E1',
    collaboration: '#32CD32',
    communication: '#FFA500',
    leadership: '#9370DB',
    creativity: '#FF69B4',
    research: '#DC143C',
    reflection: '#FFFFFF'
  };
  return colors[dim];
}

export default LearningTree;