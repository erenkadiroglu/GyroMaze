'use client';

import { useEffect, useRef } from 'react';
import {
  createCelebrationBurst,
  stepParticle,
  type Particle,
} from '@/utils/celebrationParticles';

interface CelebrationCanvasProps {
  active: boolean;
}

export function CelebrationCanvas({ active }: CelebrationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // İki köşeden (sol-alt ve sağ-alt) merkeze doğru konfeti patlaması
    const burstLeft = createCelebrationBurst(width * 0.25, height * 0.7, 32);
    const burstRight = createCelebrationBurst(width * 0.75, height * 0.7, 32);
    let particles: Particle[] = [...burstLeft, ...burstRight];

    let rafId = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const nextParticles: Particle[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const isAlive = stepParticle(p, 1);

        if (isAlive) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size * 0.5, -p.size * 0.3, p.size, p.size * 0.6);
          ctx.restore();

          nextParticles.push(p);
        }
      }

      particles = nextParticles;

      if (particles.length > 0) {
        rafId = window.requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', onResize);
      window.cancelAnimationFrame(rafId);
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      aria-hidden="true"
    />
  );
}
