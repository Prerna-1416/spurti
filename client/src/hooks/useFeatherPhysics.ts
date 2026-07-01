import { useState, useEffect, useRef, useCallback } from 'react';

interface FeatherPosition {
  x: number;
  y: number;
  rotation: number;
}

interface UseFeatherPhysicsOptions {
  centerX: number;
  centerY: number;
  orbitRadius: number;
  featherCount: number;
  angles: number[];
}

export function useFeatherPhysics(options: UseFeatherPhysicsOptions) {
  const { centerX, centerY, orbitRadius, featherCount, angles } = options;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [featherPositions, setFeatherPositions] = useState<FeatherPosition[]>([]);
  const animationRef = useRef<number>();
  const phasesRef = useRef<number[]>([]);

  if (phasesRef.current.length !== featherCount) {
    phasesRef.current = Array.from({ length: featherCount }, () => Math.random() * Math.PI * 2);
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const animate = useCallback(() => {
    const time = Date.now() / 1000;

    setFeatherPositions(
      angles.map((baseAngle, i) => {
        const phase = phasesRef.current[i];
        const oscillation = Math.sin(time * 0.5 + phase) * 5;
        const idleRotation = oscillation;

        const rad = ((baseAngle + oscillation) * Math.PI) / 180;
        const x = centerX + Math.cos(rad) * orbitRadius;
        const y = centerY + Math.sin(rad) * orbitRadius;

        const dx = mousePos.x - x;
        const dy = mousePos.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;
        const influence = Math.max(0, 1 - dist / maxDist);
        const mouseInfluence = influence * 15;

        const angleToMouse = Math.atan2(dy, dx) * (180 / Math.PI);
        const angleDiff = angleToMouse - baseAngle;
        const normalizedDiff = ((angleDiff + 180) % 360) - 180;
        const rotation = idleRotation + normalizedDiff * influence * 0.3;

        return { x, y, rotation };
      })
    );

    animationRef.current = requestAnimationFrame(animate);
  }, [angles, centerX, centerY, mousePos, orbitRadius, featherCount]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return featherPositions;
}