import type {
  HapticType,
  GameStatus,
  GyroData,
  ChangeLevelPayload,
} from '@gyromaze/shared';

export const VALID_HAPTIC_TYPES: ReadonlySet<string> = new Set<HapticType>([
  'wall',
  'hole',
  'goal',
  'calibrate',
  'crystal',
  'laser',
  'boost',
  'teleport',
]);

export const VALID_GAME_STATUSES: ReadonlySet<string> = new Set<GameStatus>([
  'waiting',
  'ready',
  'playing',
  'paused',
  'won',
  'lost',
]);

/**
 * Gönderilen oda kimliğinin beklenen oda ile eşleşip eşleşmediğini doğrular (boş veya undefined ise kabul edilir).
 */
export function matchesOptionalRoomId(roomId: unknown, expectedRoomId: string): boolean {
  if (roomId === undefined || roomId === '') {
    return true;
  }
  return typeof roomId === 'string' && roomId.trim() === expectedRoomId;
}

/**
 * Titreşim (Haptic) tipinin geçerli olup olmadığını doğrular.
 */
export function isValidHapticType(type: unknown): type is HapticType {
  return typeof type === 'string' && VALID_HAPTIC_TYPES.has(type);
}

/**
 * Oyun durumunun geçerli olup olmadığını doğrular.
 */
export function isValidGameStatus(status: unknown): status is GameStatus {
  return typeof status === 'string' && VALID_GAME_STATUSES.has(status);
}

/**
 * Ham jiroskop paketini sınırlandırarak ve NaN/Infinity durumlarını eleyerek temiz senkronizasyon verisine dönüştürür.
 */
export function sanitizeGyroSyncData(
  data: GyroData | undefined,
  playerSlot: 1 | 2,
): GyroData | null {
  if (!data || typeof data !== 'object') return null;
  const { beta, gamma, alpha, timestamp } = data;
  if (
    typeof beta !== 'number' ||
    !Number.isFinite(beta) ||
    typeof gamma !== 'number' ||
    !Number.isFinite(gamma)
  ) {
    return null;
  }

  const clampedBeta = Math.max(-45, Math.min(45, beta));
  const clampedGamma = Math.max(-45, Math.min(45, gamma));
  const safeAlpha = typeof alpha === 'number' && Number.isFinite(alpha) ? alpha : 0;
  const safeTimestamp =
    typeof timestamp === 'number' && Number.isFinite(timestamp) ? timestamp : Date.now();

  return {
    alpha: safeAlpha,
    beta: clampedBeta,
    gamma: clampedGamma,
    timestamp: safeTimestamp,
    playerSlot,
  };
}

/**
 * Bölüm değiştirme veri yükünü doğrular ve temizlenmiş nesne döner.
 */
export function sanitizeChangeLevelPayload(
  payload: ChangeLevelPayload | undefined,
  expectedRoomId: string,
): ChangeLevelPayload | null {
  if (!payload || !matchesOptionalRoomId(payload.roomId, expectedRoomId)) {
    return null;
  }

  const validDirection = payload.direction === 'next' || payload.direction === 'prev';
  const validLevel =
    typeof payload.level === 'number' &&
    Number.isSafeInteger(payload.level) &&
    payload.level >= 1 &&
    payload.level <= 9999;

  if (!validDirection && !validLevel) {
    return null;
  }

  return {
    roomId: expectedRoomId,
    ...(validDirection ? { direction: payload.direction } : {}),
    ...(validLevel ? { level: payload.level } : {}),
  };
}
