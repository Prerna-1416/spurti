import React, { useEffect, useRef } from 'react';

interface ConfettiOptions {
  x?: number;
  y?: number;
  count?: number;
  spread?: number;
  colors?: string[];
  size?: number;
  duration?: number;
  gravity?: number;
}

const DEFAULTS = {
  colors: ['#fbbf24', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#3b82f6', '#10b981', '#ffffff'],
  size: 8,
  duration: 1500,
  spread: 70,
  gravity: 0.3
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  size: number;
  color: string;
  life: number;
}

export function fireConfetti(options: ConfettiOptions = {}): void {
  const target = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
  if (!target) return;
  const ctx = target.getContext('2d');
  if (!ctx) return;
  const o = { ...DEFAULTS, ...options };
  const x = o.x ?? target.width / 2;
  const y = o.y ?? target.height / 3;
  const count = o.count ?? 60;

  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * o.spread - o.spread / 2 - 90) * (Math.PI / 180);
    const speed = 5 + Math.random() * 6;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 20,
      size: o.size * (0.6 + Math.random() * 0.8),
      color: o.colors[Math.floor(Math.random() * o.colors.length)],
      life: 1
    });
  }

  const start = performance.now();
  const animate = (now: number) => {
    const dt = Math.min(40, now - (lastNow || now));
    lastNow = now;
    const elapsed = now - start;
    if (elapsed > o.duration * 1.4) {
      ctx.clearRect(0, 0, target.width, target.height);
      return;
    }
    ctx.clearRect(0, 0, target.width, target.height);
    particles.forEach(p => {
      p.vy += o.gravity * (dt / 16);
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.rot += p.rotSpeed * (dt / 16);
      p.life = Math.max(0, 1 - elapsed / (o.duration * 1.2));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });
    requestAnimationFrame(animate);
  };
  let lastNow = 0;
  requestAnimationFrame(animate);
}

interface ConfettiCanvasProps {
  zIndex?: number;
}

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({ zIndex = 9999 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas
      id="confetti-canvas"
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex
      }}
    />
  );
};