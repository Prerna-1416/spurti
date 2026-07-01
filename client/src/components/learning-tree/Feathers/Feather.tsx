import React from 'react';
import type { FeatherData } from '../../../types/learningTree';
import { DIMENSION_LABELS } from '../../../types/learningTree';
import { motion } from 'framer-motion';

interface FeatherProps {
  feather: FeatherData;
  position: { x: number; y: number; rotation: number };
  onHover: (feather: FeatherData | null) => void;
}

export const Feather: React.FC<FeatherProps> = ({ feather, position, onHover }) => {
  const { color, label, level, growth, glowing } = feather;

  return (
    <motion.g
      transform={`translate(${position.x}, ${position.y}) rotate(${position.rotation})`}
      onMouseEnter={() => onHover(feather)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer' }}
      whileHover={{ scale: 1.2 }}
      animate={{
        scale: [1, 1.02, 1],
      }}
      transition={{
        scale: { duration: 2, repeat: Infinity }
      }}
    >
      {/* Feather glow for fully grown feathers */}
      {glowing && (
        <motion.ellipse
          rx={25}
          ry={35}
          fill={color}
          opacity={0.3}
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Feather shape */}
      <motion.path
        d="M0,-30 C5,-25 8,-15 6,-5 C10,0 8,10 4,20 C2,25 0,30 0,30 C0,30 -2,25 -4,20 C-8,10 -10,0 -6,-5 C-8,-15 -5,-25 0,-30 Z"
        fill={color}
        stroke={glowing ? '#FFD700' : '#333'}
        strokeWidth={glowing ? 2 : 1}
        opacity={growth > 0 ? 0.9 : 0.3}
      />

      {/* Feather rachis (center line) */}
      <motion.line
        x1={0}
        y1={-25}
        x2={0}
        y2={25}
        stroke="#333"
        strokeWidth={1}
        opacity={growth > 0 ? 0.5 : 0.2}
      />

      {/* Feather barbs (grows with level) */}
      {level > 1 && (
        <>
          <motion.line x1={0} y1={-15} x2={6} y2={-18} stroke="#333" strokeWidth={0.5} opacity={0.4} />
          <motion.line x1={0} y1={-15} x2={-6} y2={-18} stroke="#333" strokeWidth={0.5} opacity={0.4} />
        </>
      )}
      {level > 2 && (
        <>
          <motion.line x1={0} y1={-5} x2={7} y2={-8} stroke="#333" strokeWidth={0.5} opacity={0.4} />
          <motion.line x1={0} y1={-5} x2={-7} y2={-8} stroke="#333" strokeWidth={0.5} opacity={0.4} />
        </>
      )}
      {level > 3 && (
        <>
          <motion.line x1={0} y1={5} x2={8} y2={3} stroke="#333" strokeWidth={0.5} opacity={0.4} />
          <motion.line x1={0} y1={5} x2={-8} y2={3} stroke="#333" strokeWidth={0.5} opacity={0.4} />
        </>
      )}
      {level >= 5 && (
        <>
          <motion.line x1={0} y1={15} x2={6} y2={13} stroke="#333" strokeWidth={0.5} opacity={0.4} />
          <motion.line x1={0} y1={15} x2={-6} y2={13} stroke="#333" strokeWidth={0.5} opacity={0.4} />
        </>
      )}

      {/* Level indicator */}
      {level >= 3 && (
        <motion.circle
          cx={0}
          cy={0}
          r={4}
          fill="#333"
          opacity={0.8}
        />
      )}
    </motion.g>
  );
};

interface FeatherOrbitProps {
  feathers: FeatherData[];
  positions: { x: number; y: number; rotation: number }[];
  onFeatherHover: (feather: FeatherData | null) => void;
}

export const FeatherOrbit: React.FC<FeatherOrbitProps> = ({ feathers, positions, onFeatherHover }) => {
  return (
    <g className="feather-orbit">
      {/* Orbit ring (subtle) */}
      <circle
        r={200}
        fill="none"
        stroke="#ddd"
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.5}
      />
      {feathers.map((feather, i) => (
        <Feather
          key={feather.dimension}
          feather={feather}
          position={positions[i] || { x: 0, y: 0, rotation: 0 }}
          onHover={onFeatherHover}
        />
      ))}
    </g>
  );
};

interface FeatherTooltipProps {
  feather: FeatherData | null;
  position: { x: number; y: number };
}

export const FeatherTooltip: React.FC<FeatherTooltipProps> = ({ feather, position }) => {
  if (!feather) return null;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transform={`translate(${position.x + 30}, ${position.y - 30})`}
    >
      <rect
        x={0}
        y={0}
        width={150}
        height={80}
        rx={8}
        fill="white"
        stroke={feather.color}
        strokeWidth={2}
        filter="url(#shadow)"
      />
      <text x={10} y={20} fontSize={12} fontWeight="bold" fill="#333">
        {feather.label}
      </text>
      <text x={10} y={38} fontSize={10} fill="#666">
        Level: {feather.level}
      </text>
      <text x={10} y={52} fontSize={10} fill="#666">
        Growth: {feather.growth}%
      </text>
      <text x={10} y={66} fontSize={10} fill="#666">
        {feather.glowing ? '✨ Fully Grown!' : `${100 - feather.growth}% to full`}
      </text>
    </motion.g>
  );
};

export default Feather;