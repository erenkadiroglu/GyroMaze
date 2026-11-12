/**
 * Mobil kontrolcü girdi temizleme, oda kodu doğrulama ve sanal gimbal
 * trigonometrik dokunmatik hesaplama motoru.
 */

export interface GimbalBounds {
  centerX: number;
  centerY: number;
  maxRadius: number;
}

/**
 * Girdi metninden boşluk ve özel karakterleri temizleyerek 6 haneli büyük harf oda kodu üretir.
 */
export function cleanRoomCode(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6);
}

/**
 * 6 haneli oda kodunun formatını ve uzunluğunu doğrular.
 */
export function validateRoomCode(rawInput: string): {
  valid: boolean;
  cleanCode: string;
  error: string | null;
} {
  const cleanCode = cleanRoomCode(rawInput);
  if (!cleanCode) {
    return {
      valid: false,
      cleanCode: '',
      error: 'Lütfen 6 haneli oda kodunu girin.',
    };
  }
  if (cleanCode.length !== 6) {
    return {
      valid: false,
      cleanCode,
      error: 'Oda kodu tam 6 karakter olmalıdır.',
    };
  }
  return {
    valid: true,
    cleanCode,
    error: null,
  };
}

/**
 * Parmağın dokunduğu ekran koordinatlarını gimbal dairesi içine sınırlar ve
 * açısal beta (eğim/pitch) ile gamma (yatış/roll) derecelerini üretir.
 */
export function calculateGimbalTouchAngles(
  clientX: number,
  clientY: number,
  bounds: GimbalBounds,
  maxTouchAngle = 28,
): { beta: number; gamma: number } {
  const { centerX, centerY, maxRadius } = bounds;
  if (!Number.isFinite(maxRadius) || maxRadius <= 0) {
    return { beta: 0, gamma: 0 };
  }

  let dx = clientX - centerX;
  let dy = clientY - centerY;
  const dist = Math.hypot(dx, dy);

  if (dist > maxRadius && dist > 0) {
    const scale = maxRadius / dist;
    dx *= scale;
    dy *= scale;
  }

  const gamma = Math.round((dx / maxRadius) * maxTouchAngle * 10) / 10;
  const beta = Math.round((dy / maxRadius) * maxTouchAngle * 10) / 10;

  return { beta, gamma };
}

/**
 * Canlı beta/gamma açılarını 2B ufuk küresinin piksel ofsetlerine dönüştürür.
 */
export function calculateGimbalDotOffset(
  beta: number,
  gamma: number,
  maxOffsetPx = 68,
  maxDeg = 35,
): { offsetX: number; offsetY: number } {
  const safeBeta = Number.isFinite(beta) ? beta : 0;
  const safeGamma = Number.isFinite(gamma) ? gamma : 0;

  const rawX = (safeGamma / maxDeg) * maxOffsetPx;
  const rawY = (safeBeta / maxDeg) * maxOffsetPx;

  const offsetX = Math.max(-maxOffsetPx, Math.min(maxOffsetPx, rawX));
  const offsetY = Math.max(-maxOffsetPx, Math.min(maxOffsetPx, rawY));

  return {
    offsetX: Math.round(offsetX * 10) / 10,
    offsetY: Math.round(offsetY * 10) / 10,
  };
}

/**
 * Sayısal açı değerini insan okunabilir derece metnine biçimlendirir (+12.5°, -4.0°, +0.0°).
 */
export function formatGimbalAngle(deg: number): string {
  if (!Number.isFinite(deg)) return '+0.0°';
  const prefix = deg >= 0 ? '+' : '';
  return `${prefix}${deg.toFixed(1)}°`;
}

/**
 * Jiroskop veya sanal dokunmatik açılarını hassasiyet çarpanıyla ölçekler ve sınırlar.
 */
export function scaleGyroAngles(
  beta: number,
  gamma: number,
  sensitivity = 1,
  maxLimit = 35,
): { beta: number; gamma: number } {
  const mult = Number.isFinite(sensitivity) && sensitivity > 0 ? sensitivity : 1;
  const limit = Number.isFinite(maxLimit) && maxLimit > 0 ? maxLimit : 35;

  const safeBeta = Number.isFinite(beta) ? beta : 0;
  const safeGamma = Number.isFinite(gamma) ? gamma : 0;

  const scaledBeta =
    Math.round(Math.max(-limit, Math.min(limit, safeBeta * mult)) * 10) / 10;
  const scaledGamma =
    Math.round(Math.max(-limit, Math.min(limit, safeGamma * mult)) * 10) / 10;

  return { beta: scaledBeta, gamma: scaledGamma };
}

