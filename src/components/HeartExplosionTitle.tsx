import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  rotation: number;
  targetRotation: number;
  type: 'heart' | 'sparkle' | 'mini-heart';
  delay: number;
  duration: number;
}

const HEART_COLORS = [
  '#F43F5E', // Rose 500
  '#E11D48', // Rose 600
  '#FB7185', // Rose 400
  '#FF2E63', // Vibrant Magenta Rose
  '#FF6B8B', // Soft Coral Rose
  '#EC4899', // Pink 500
  '#DB2777', // Pink 600
  '#F472B6', // Pink 400
  '#FDA4AF', // Rose 300
];

interface HeartExplosionTitleProps {
  title?: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  as?: 'h1' | 'h2' | 'div';
}

export const HeartExplosionTitle: React.FC<HeartExplosionTitleProps> = ({
  title = "Jusqu'à la rencontre authentique",
  subtitle,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  as = 'h1',
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTriggerTime = useRef<number>(0);

  const triggerExplosion = useCallback((e?: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    // Throttle slightly to avoid too many DOM nodes while feeling responsive
    if (now - lastTriggerTime.current < 160) return;
    lastTriggerTime.current = now;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Determine spawn origin (either cursor position or center of title)
    let originX = rect.width / 2;
    let originY = rect.height / 2;

    if (e) {
      originX = e.clientX - rect.left;
      originY = e.clientY - rect.top;
    }

    const count = 18; // Number of bursting hearts
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      // Angle evenly distributed with slight jitter
      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
      // Distance of explosion
      const distance = 70 + Math.random() * 110;

      // Upward bias: make hearts float higher
      const targetX = originX + Math.cos(angle) * distance;
      const targetY = originY + Math.sin(angle) * distance * 0.75 - (60 + Math.random() * 80);

      const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
      const size = 14 + Math.random() * 18;
      const rotation = (Math.random() - 0.5) * 40;
      const targetRotation = rotation + (Math.random() - 0.5) * 120;
      const typeRand = Math.random();
      const type: 'heart' | 'sparkle' | 'mini-heart' =
        typeRand > 0.3 ? 'heart' : typeRand > 0.15 ? 'mini-heart' : 'sparkle';

      newParticles.push({
        id: now + i + Math.random(),
        x: originX + (Math.random() - 0.5) * 20,
        y: originY + (Math.random() - 0.5) * 10,
        targetX,
        targetY,
        size,
        color,
        rotation,
        targetRotation,
        type,
        delay: Math.random() * 0.08,
        duration: 1.0 + Math.random() * 0.5,
      });
    }

    setParticles((prev) => [...prev.slice(-30), ...newParticles]);

    // Clean up particles after they finish animating
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1800);
  }, []);

  const Component = as;

  return (
    <div
      ref={containerRef}
      id="heart-explosion-title-container"
      onMouseEnter={(e) => triggerExplosion(e)}
      onMouseMove={(e) => triggerExplosion(e)}
      className={`relative inline-block select-none cursor-pointer group ${className}`}
    >
      {/* Bursting Heart Particles Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-visible z-30">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: p.x - p.size / 2,
                y: p.y - p.size / 2,
                scale: 0.2,
                opacity: 0,
                rotate: p.rotation,
              }}
              animate={{
                x: p.targetX - p.size / 2,
                y: p.targetY - p.size / 2,
                scale: [0.2, 1.35, 1, 0.7],
                opacity: [0, 1, 0.95, 0],
                rotate: p.targetRotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                position: 'absolute',
                color: p.color,
                filter: 'drop-shadow(0 2px 6px rgba(244,63,94,0.4))',
              }}
            >
              {p.type === 'sparkle' ? (
                <Sparkles style={{ width: p.size * 0.85, height: p.size * 0.85 }} />
              ) : (
                <Heart
                  fill={p.color}
                  style={{ width: p.size, height: p.size }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Title Content with subtle interactive feedback */}
      <Component
        className={`relative z-10 transition-all duration-300 group-hover:scale-[1.01] font-serif ${titleClassName}`}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 group-hover:from-rose-700 group-hover:via-rose-600 group-hover:to-amber-600 transition-all duration-500 drop-shadow-xs">
          {title}
        </span>
      </Component>

      {subtitle && (
        <p
          className={`relative z-10 transition-colors duration-300 font-sans group-hover:text-rose-600 ${subtitleClassName}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
