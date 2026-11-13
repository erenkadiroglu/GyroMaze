import type { GyroData, CalibrationOffset } from '@gyromaze/shared';

/**
 * Açıyı [-180, 180) derece aralığına normalize eder (açısal sarma).
 * Sıfır noktası üzerinden geçişlerde açı sıçramalarını önler.
 */
export function wrapAngleDelta(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  return (((angle % 360) + 540) % 360) - 180;
}

/**
 * Mikro el titremelerini sönümlemek için ölü bölge (deadzone) filtresi uygular.
 * Eşik değerinin altındaki değişimleri sıfıra indirir.
 */
export function applyDeadzone(delta: number, deadzoneDeg: number = 0.2): number {
  if (!Number.isFinite(delta)) return 0;
  if (Math.abs(delta) < deadzoneDeg) return 0;
  return delta;
}

/**
 * MEMS sensör gürültüsünü gecikme yaratmadan temizleyen üstel hareketli ortalama (EMA) filtresi.
 * @param currentSmoothed Önceki karede filtrelenmiş değer
 * @param targetValue Yeni hedeflenen ham/ölü bölgeli değer
 * @param alpha Yumuşatma katsayısı (0..1, varsayılan 0.72)
 */
export function applyExponentialSmoothing(
  currentSmoothed: number,
  targetValue: number,
  alpha: number = 0.72,
): number {
  const current = Number.isFinite(currentSmoothed) ? currentSmoothed : 0;
  const target = Number.isFinite(targetValue) ? targetValue : 0;
  const safeAlpha = Math.max(0, Math.min(1, Number.isFinite(alpha) ? alpha : 0.72));
  return current + (target - current) * safeAlpha;
}

/**
 * Açıyı maksimum ve minimum sınırlar arasına hapseder ve 1 ondalık basamağa (0.1°) yuvarlar.
 */
export function clampAndRoundAngle(
  angle: number,
  maxTiltDeg: number = 35,
  precisionDecimals: number = 1,
): number {
  if (!Number.isFinite(angle)) return 0;
  const clamped = Math.max(-maxTiltDeg, Math.min(maxTiltDeg, angle));
  const factor = Math.pow(10, Math.max(0, Math.min(4, precisionDecimals)));
  return Math.round(clamped * factor) / factor;
}

export interface OrientationFilterInput {
  rawAlpha: number;
  rawBeta: number;
  rawGamma: number;
  calibration: CalibrationOffset;
  currentSmoothed: { beta: number; gamma: number };
  deadzoneDeg?: number;
  smoothingAlpha?: number;
  maxTiltDeg?: number;
}

export interface OrientationFilterResult {
  gyroData: GyroData;
  nextSmoothed: { beta: number; gamma: number };
}

/**
 * Ham jiroskop sensör verisini kalibre eder, ölü bölge ve EMA filtresinden geçirerek
 * ağ ve 3B sahne için optimize edilmiş nihai veriyi hesaplar.
 */
export function calculateFilteredOrientation(
  input: OrientationFilterInput,
  timestamp: number = Date.now(),
): OrientationFilterResult {
  const {
    rawAlpha,
    rawBeta,
    rawGamma,
    calibration,
    currentSmoothed,
    deadzoneDeg = 0.2,
    smoothingAlpha = 0.72,
    maxTiltDeg = 35,
  } = input;

  const validAlpha = Number.isFinite(rawAlpha) ? rawAlpha : 0;
  const validBeta = Number.isFinite(rawBeta) ? rawBeta : 0;
  const validGamma = Number.isFinite(rawGamma) ? rawGamma : 0;

  // Sıfır referans noktasına göre açı farkı
  const deltaBetaRaw = wrapAngleDelta(validBeta - (calibration?.betaOffset ?? 0));
  const deltaGammaRaw = wrapAngleDelta(validGamma - (calibration?.gammaOffset ?? 0));

  // Mikro el titremesi ölü bölge filtresi
  const deadBeta = applyDeadzone(deltaBetaRaw, deadzoneDeg);
  const deadGamma = applyDeadzone(deltaGammaRaw, deadzoneDeg);

  // Üstel yumuşatma (EMA)
  const nextSmoothBeta = applyExponentialSmoothing(
    currentSmoothed.beta,
    deadBeta,
    smoothingAlpha,
  );
  const nextSmoothGamma = applyExponentialSmoothing(
    currentSmoothed.gamma,
    deadGamma,
    smoothingAlpha,
  );

  // Eğim sınırlandırması ve yuvarlama
  const clampedBeta = clampAndRoundAngle(nextSmoothBeta, maxTiltDeg);
  const clampedGamma = clampAndRoundAngle(nextSmoothGamma, maxTiltDeg);
  const roundedAlpha = Math.round(validAlpha * 10) / 10;

  return {
    gyroData: {
      alpha: roundedAlpha,
      beta: clampedBeta,
      gamma: clampedGamma,
      timestamp,
    },
    nextSmoothed: {
      beta: nextSmoothBeta,
      gamma: nextSmoothGamma,
    },
  };
}

/**
 * Tarayıcı ortamına göre ilk jiroskop sensör izin durumunu çözümler.
 */
export function resolveSensorInitialPermission(
  isWindowAvailable: boolean,
  hasDeviceOrientationEvent: boolean,
): 'prompt' | 'unsupported' {
  if (!isWindowAvailable || !hasDeviceOrientationEvent) {
    return 'unsupported';
  }
  return 'prompt';
}

