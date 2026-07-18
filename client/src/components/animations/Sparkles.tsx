import React from 'react';
import { motion } from 'framer-motion';

interface SparklesProps {
  count?: number;
  color?: string;
  duration?: number;
  size?: number;
}

export const Sparkles: React.FC<SparklesProps> = ({
  count = 14,
  color = '#fde047',
  duration = 2.2,
  size = 4
}) => {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="sparkles-layer" aria-hidden="true">
      {items.map(i => {
        const x = Math.random() * 100;
        const delay = Math.random() * duration;
        return (
          <motion.span
            key={i}
            className="sparkle"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.4, 1.2, 0.4],
              y: [0, -20, -40]
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: '50%',
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 ${size * 2}px ${color}`
            }}
          />
        );
      })}
    </div>
  );
};