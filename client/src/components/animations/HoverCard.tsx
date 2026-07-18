import React from 'react';
import { motion } from 'framer-motion';

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  children, className = '', glowColor = 'rgba(23, 107, 135, 0.35)',
  intensity = 1, as = 'div'
}) => {
  const Tag = motion[as as 'div'] || motion.div;
  return (
    <Tag
      className={`hover-card ${className}`}
      whileHover={{
        y: -3,
        boxShadow: `0 ${12 * intensity}px ${36 * intensity}px ${glowColor}`
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      {children}
    </Tag>
  );
};