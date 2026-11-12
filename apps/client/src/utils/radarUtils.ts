/**
 * Kokpit Yapay Ufuk ve 2B Canlı Radar Koordinat Motoru
 */

/**
 * 3B dünya koordinatlarını mini-harita (radar) piksel ofsetlerine dönüştürür ve sınırlar.
 */
export function calculateRadarCoords(
  worldX: number,
  worldZ: number,
  boardSize: number,
  radarDimension = 42,
  dotPadding = 4,
): { rx: number; rz: number } {
  if (!Number.isFinite(boardSize) || boardSize <= 0) {
    return { rx: dotPadding, rz: dotPadding };
  }
  const safeX = Number.isFinite(worldX) ? worldX : 0;
  const safeZ = Number.isFinite(worldZ) ? worldZ : 0;
  const halfBoard = boardSize * 0.5;
  const minCoord = dotPadding;
  const maxCoord = radarDimension - dotPadding;

  const rawRx = ((safeX + halfBoard) / boardSize) * radarDimension;
  const rawRz = ((safeZ + halfBoard) / boardSize) * radarDimension;

  const rx = Math.max(minCoord, Math.min(maxCoord, rawRx));
  const rz = Math.max(minCoord, Math.min(maxCoord, rawRz));

  return {
    rx: Math.round(rx * 10) / 10,
    rz: Math.round(rz * 10) / 10,
  };
}

/**
 * Dünya koordinatını radar kutusunda CSS yüzde değerine dönüştürür (%0..%100).
 */
export function calculateRadarPercentage(worldCoord: number, boardSize: number): number {
  if (!Number.isFinite(boardSize) || boardSize <= 0) return 50;
  const safeCoord = Number.isFinite(worldCoord) ? worldCoord : 0;
  const halfBoard = boardSize * 0.5;
  const pct = ((safeCoord + halfBoard) / boardSize) * 100;
  return Math.max(0, Math.min(100, Math.round(pct * 10) / 10));
}

/**
 * Eğim (beta) ve yatış (gamma) açılarına göre yapay ufuk diski öteleme ve dönüşünü hesaplar.
 */
export function calculateAttitudeHorizonTransform(
  beta: number,
  gamma: number,
  maxTilt = 24,
  maxShiftY = 18,
): { shiftY: number; rotDeg: string } {
  const safeBeta = Number.isFinite(beta) ? beta : 0;
  const safeGamma = Number.isFinite(gamma) ? gamma : 0;

  const clampedBeta = Math.max(-maxTilt, Math.min(maxTilt, safeBeta));
  const clampedGamma = Math.max(-maxTilt, Math.min(maxTilt, safeGamma));

  const shiftY = (clampedBeta / maxTilt) * maxShiftY;
  const rawRot = -clampedGamma * 1.1;
  const safeRot = Math.abs(rawRot) < 0.001 ? 0 : rawRot;
  const rotDeg = safeRot.toFixed(1);

  return {
    shiftY: Math.round(shiftY * 10) / 10,
    rotDeg,
  };
}

/**
 * Canlı açı ve hız telemetrilerini standart insan okunabilir gösterge metinlerine biçimlendirir.
 */
export function formatAttitudeTelemetry(
  beta: number,
  gamma: number,
  speed: number,
): {
  pitchStr: string;
  rollStr: string;
  speedStr: string;
} {
  const safeBeta = Number.isFinite(beta) ? beta : 0;
  const safeGamma = Number.isFinite(gamma) ? gamma : 0;
  const safeSpeed = Number.isFinite(speed) && speed >= 0 ? speed : 0;

  const pitchPrefix = safeBeta >= 0 ? '+' : '';
  const rollPrefix = safeGamma >= 0 ? '+' : '';

  return {
    pitchStr: `${pitchPrefix}${safeBeta.toFixed(1)}°`,
    rollStr: `${rollPrefix}${safeGamma.toFixed(1)}°`,
    speedStr: `${safeSpeed.toFixed(1)} m/s`,
  };
}
