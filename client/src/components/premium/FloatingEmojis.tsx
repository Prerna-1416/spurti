import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_POOL = ['🎉', '✨', '⭐', '🔥', '🌟', '🎊', '💜', '💙', '💚', '🧡', '❤️', '😍', '🥳', '👏', '🙌', '🚀', '🏆', '🌱', '🍀', '🍃', '💎', '👑'];

interface FloatingReaction {
  id: number;
  emoji: string;
  startX: number;
  endX: number;
  size: number;
  duration: number;
  delay: number;
  rotationStart: number;
  rotationEnd: number;
}

interface FloatingEmojiLayerProps {
  reactions: FloatingReaction[];
}

export const FloatingEmojiLayer: React.FC<FloatingEmojiLayerProps> = ({ reactions }) => {
  return (
    <div className="floating-emoji-layer" aria-hidden="true">
      <AnimatePresence>
        {reactions.map(r => (
          <motion.span
            key={r.id}
            className="floating-emoji"
            initial={{
              x: r.startX,
              y: 0,
              opacity: 0,
              scale: 0.4,
              rotate: r.rotationStart
            }}
            animate={{
              x: r.endX,
              y: -window.innerHeight - 100,
              opacity: [0, 1, 1, 0.6, 0],
              scale: [0.4, 1.2, 1.1, 1, 0.9],
              rotate: r.rotationEnd
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: r.duration,
              delay: r.delay,
              ease: 'easeOut'
            }}
            style={{ fontSize: r.size }}
          >
            {r.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

const MAX_REACTIONS = 12;
let nextId = 0;

export function useEmojiReactions() {
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const timeoutsRef = useRef<Set<number>>(new Set());

  const burst = useCallback((count: number, fromElement?: HTMLElement | null, contextEmoji?: string) => {
    const newOnes: FloatingReaction[] = [];
    for (let i = 0; i < count; i++) {
      const sourceX = fromElement
        ? fromElement.getBoundingClientRect().left + fromElement.offsetWidth / 2
        : window.innerWidth / 2;
      const randomEmoji = contextEmoji
        ? (Math.random() < 0.6 ? contextEmoji : EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)])
        : EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
      newOnes.push({
        id: ++nextId,
        emoji: randomEmoji,
        startX: sourceX + (Math.random() - 0.5) * 120,
        endX: sourceX + (Math.random() - 0.5) * 320,
        size: 24 + Math.random() * 28,
        duration: 2.4 + Math.random() * 1.6,
        delay: i * 0.06,
        rotationStart: -25 + Math.random() * 50,
        rotationEnd: (Math.random() - 0.5) * 140
      });
    }
    setReactions(prev => {
      const combined = [...prev, ...newOnes];
      return combined.slice(-MAX_REACTIONS);
    });
    const maxLifetime = Math.max(...newOnes.map(r => r.duration + r.delay)) * 1000 + 200;
    const t = window.setTimeout(() => {
      setReactions(prev => prev.filter(r => !newOnes.find(n => n.id === r.id)));
      timeoutsRef.current.delete(t);
    }, maxLifetime);
    timeoutsRef.current.add(t);
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current.clear();
    };
  }, []);

  return { reactions, burst };
}