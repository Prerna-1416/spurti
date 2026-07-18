import React from 'react';

interface SparkleAIBadgeProps {
  personaId?: string;
  onClick?: () => void;
}

export const SparkleAIBadge: React.FC<SparkleAIBadgeProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      className="ai-insight-pill"
      onClick={onClick}
      aria-label="View your AI Learning Persona"
      title="View your AI Learning Persona"
    >
      <span aria-hidden="true">✨</span>
      <span>AI Insight</span>
    </button>
  );
};