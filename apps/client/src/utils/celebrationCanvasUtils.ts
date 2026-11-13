import { createCelebrationBurst, stepParticle, type Particle } from './celebrationParticles.ts';

/**
 * Konfeti patlamalarının sol ve sağ kaynak koordinatlarını hesaplar.
 */
export function calculateCelebrationOrigins(
  width: number,
  height: number,
): Array<{ x: number; y: number }> {
  return [
    { x: width * 0.25, y: height * 0.7 },
    { x: width * 0.75, y: height * 0.7 },
  ];
}

/**
 * Ekran boyutuna göre başlangıç konfeti patlama parçacıklarını üretir.
 */
export function createDualCelebrationBurst(
  width: number,
  height: number,
  countPerOrigin: number = 32,
): Particle[] {
  const origins = calculateCelebrationOrigins(width, height);
  const left = createCelebrationBurst(origins[0].x, origins[0].y, countPerOrigin);
  const right = createCelebrationBurst(origins[1].x, origins[1].y, countPerOrigin);
  return [...left, ...right];
}

/**
 * Parçacık dizisini bir kare ilerletir ve hayatta kalanları döner.
 */
export function stepCelebrationParticles(
  particles: Particle[],
  delta: number = 1,
): Particle[] {
  const alive: Particle[] = [];
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (stepParticle(p, delta)) {
      alive.push(p);
    }
  }
  return alive;
}

/**
 * Tek bir konfeti parçasını 2B Canvas üzerine çizer.
 */
export function renderParticle(
  ctx: CanvasRenderingContext2D,
  p: Particle,
): void {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
  ctx.fillStyle = p.color;
  ctx.fillRect(-p.size * 0.5, -p.size * 0.3, p.size, p.size * 0.6);
  ctx.restore();
}

