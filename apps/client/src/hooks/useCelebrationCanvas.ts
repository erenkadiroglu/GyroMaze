'use client';

import { useEffect, type RefObject } from 'react';
import {
  createDualCelebrationBurst,
  stepCelebrationParticles,
  renderParticle,
} from '@/utils/celebrationCanvasUtils';
import type { Particle } from '@/utils/celebrationParticles';

/**
 * Zafer konfetisi 2B canvas animasyon döngüsü kancası.
 */
export function useCelebrationCanvas(
  active: boolean,
  canvasRef: RefObject<HTMLCanvasElement | null>,
) {
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

    // İki köşeden merkeze doğru konfeti patlaması
    let particles: Particle[] = createDualCelebrationBurst(width, height, 32);
    let rafId = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles = stepCelebrationParticles(particles, 1);

      for (let i = 0; i < particles.length; i++) {
        renderParticle(ctx, particles[i]);
      }

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
  }, [active, canvasRef]);
}

