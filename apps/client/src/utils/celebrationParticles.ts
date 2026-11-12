/**
 * Prosedürel Zafer Konfetisi ve Parçacık Fiziği Motoru
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRotation: number;
  opacity: number;
  decay: number;
  gravity: number;
}

export const CELEBRATION_PALETTE = [
  '#e5a93c', // Brass / Gold
  '#38bdf8', // Signal Cyan
  '#34d399', // Emerald Ok
  '#a78bfa', // Purple
  '#fb7185', // Coral Rose
  '#f8fafc', // Sparkle White
];

/**
 * 3 yıldız veya kişisel rekor (PB) durumunda zafer konfetisi tetiklenip tetiklenmeyeceğini belirler.
 */
export function isCelebrationWorthy(earnedStars: number, isPB: boolean): boolean {
  return earnedStars === 3 || isPB;
}

/**
 * Belirtilen orijinden dağılan tekil bir konfeti parçacığı üretir.
 */
export function createParticle(
  originX: number,
  originY: number,
  color: string,
  angleRad: number,
  speed: number,
): Particle {
  const safeAngle = Number.isFinite(angleRad) ? angleRad : Math.random() * Math.PI * 2;
  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 4 + Math.random() * 4;

  return {
    x: originX,
    y: originY,
    vx: Math.cos(safeAngle) * safeSpeed,
    vy: Math.sin(safeAngle) * safeSpeed - 2.5, // Başlangıçta hafif yukarı fırlatma
    size: 4 + Math.random() * 5,
    color,
    rotation: Math.random() * 360,
    vRotation: (Math.random() - 0.5) * 12,
    opacity: 1,
    decay: 0.012 + Math.random() * 0.008,
    gravity: 0.16,
  };
}

/**
 * Merkezden her yöne yayılan bir konfeti patlaması (burst) kümesi oluşturur.
 */
export function createCelebrationBurst(
  originX: number,
  originY: number,
  count = 36,
  palette: string[] = CELEBRATION_PALETTE,
): Particle[] {
  const particles: Particle[] = [];
  const safeCount = Math.max(1, Math.min(100, count));

  for (let i = 0; i < safeCount; i++) {
    // Yukarı koni biçiminde dağılım (-0.85PI ile -0.15PI arası yukarı fırlatma)
    const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.8;
    const speed = 4.5 + Math.random() * 6.5;
    const color = palette[i % palette.length];
    particles.push(createParticle(originX, originY, color, angle, speed));
  }

  return particles;
}

/**
 * Parçacığın fiziksel konumunu günceller ve hala görünür olup olmadığını döner.
 */
export function stepParticle(particle: Particle, dt = 1): boolean {
  particle.x += particle.vx * dt;
  particle.y += particle.vy * dt;
  particle.vy += particle.gravity * dt;
  particle.vx *= 0.985; // Hava sürtünmesi
  particle.rotation += particle.vRotation * dt;
  particle.opacity -= particle.decay * dt;

  return particle.opacity > 0;
}
