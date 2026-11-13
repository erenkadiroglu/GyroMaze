import type { HapticType } from '@gyromaze/shared';

export const HAPTIC_PATTERNS: Record<HapticType, VibratePattern> = {
  wall: 18,
  hole: [70, 40, 110],
  goal: [50, 50, 50, 50, 140],
  calibrate: 30,
  crystal: [25, 30, 45],
  laser: [90, 30, 90],
  boost: [30, 20, 40],
  teleport: [20, 40, 20, 40, 60],
};

/**
 * Belirtilen titreşim türüne ait titreşim desenini döner.
 */
export function getHapticVibrationPattern(type: unknown): VibratePattern | undefined {
  if (typeof type !== 'string') return undefined;
  return HAPTIC_PATTERNS[type as HapticType];
}

/**
 * Hem yerel geliştirme ortamında (localhost:4000) hem de tek portlu HTTPS tünellerinde
 * (server.mjs TCP_NODELAY WebSocket Proxy) kesintisiz çalışan sunucu adresi çözücü.
 */
export function resolveSocketServerUrl(
  envUrl?: string,
  location?: { protocol: string; hostname: string; origin: string },
): string {
  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }

  const loc =
    location ??
    (typeof window !== 'undefined'
      ? {
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          origin: window.location.origin,
        }
      : undefined);

  if (loc) {
    const { protocol, hostname, origin } = loc;
    const isLoopback =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '[::1]';

    if (protocol === 'https:' || !isLoopback) {
      return origin;
    }
    return `http://${hostname}:4000`;
  }

  return 'http://localhost:4000';
}

/**
 * Jiroskop güncellemesinin (beta, gamma) ağa gönderilmesinin frenlenip frenlenmeyeceğini
 * (throttling) hesaplar. Açı değişmediyse veya zaman eşiği dolmadıysa `true` döner.
 */
export function shouldThrottleGyroEmit(
  now: number,
  lastEmitTime: number,
  currentBeta: number,
  currentGamma: number,
  lastBeta: number,
  lastGamma: number,
  minIntervalMs: number = 15,
  minDeltaDeg: number = 0.1,
): boolean {
  const isZero = currentBeta === 0 && currentGamma === 0;
  const wasNonZero = lastBeta !== 0 || lastGamma !== 0;
  const isZeroTransition = isZero && wasNonZero;

  // Sıfıra geçiş anında hemen ilet (tabla düz konuma dönünce bekletme)
  if (isZeroTransition) {
    return false;
  }

  // Minimum zaman eşiği dolmadıysa frenle
  if (now - lastEmitTime < minIntervalMs) {
    return true;
  }

  // Minimum açısal değişim gerçekleşmediyse frenle
  const deltaBeta = Math.abs(currentBeta - lastBeta);
  const deltaGamma = Math.abs(currentGamma - lastGamma);
  if (deltaBeta < minDeltaDeg && deltaGamma < minDeltaDeg) {
    return true;
  }

  return false;
}

/**
 * Gönderilen ve alınan zaman damgalarından gidiş-dönüş (RTT) gecikmesini (1..999 ms) hesaplar.
 */
export function calculatePingLatency(
  sentAt: number,
  now: number = typeof performance !== 'undefined' ? performance.now() : Date.now(),
): number {
  const elapsed = Math.round(now - sentAt);
  return Math.max(1, Math.min(999, Number.isFinite(elapsed) ? elapsed : 1));
}

/**
 * Kullanıcı tarafından girilen oda kodunu temizler, büyük harfe çevirir ve doğrular.
 */
export function normalizeRoomCodeForJoin(code: unknown): string | null {
  if (typeof code !== 'string') return null;
  const trimmed = code.trim().toUpperCase();
  if (!trimmed || trimmed.length < 3 || trimmed.length > 10) {
    return null;
  }
  return trimmed;
}
