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

/**
 * Bölüm numarasına göre insan okunabilir başlık döner (Bölüm 01, Bölüm 05, Özel).
 */
export function formatControllerLevelLabel(level: number): string {
  if (level === 99) return 'Özel';
  if (!Number.isFinite(level) || level <= 0) return 'Bölüm 01';
  return `Bölüm ${level < 10 ? `0${level}` : String(level)}`;
}

/**
 * Mobil kontrolcü bağlantı ve gecikme durumunu rozet formatına dönüştürür.
 */
export function resolveControllerConnectionBadge(
  isPaired: boolean,
  isSocketConnected: boolean,
  latencyMs = 0,
): {
  state: 'paired' | 'ready' | 'disconnected';
  label: string;
  latencyClass?: string;
} {
  if (isPaired) {
    const latencyClass =
      latencyMs < 35 ? 'text-ok' : latencyMs < 75 ? 'text-brass' : 'text-warn';
    return { state: 'paired', label: 'Bağlı', latencyClass };
  }
  if (isSocketConnected) {
    return { state: 'ready', label: 'Hazır' };
  }
  return { state: 'disconnected', label: 'Kopuk' };
}

/**
 * Toplanan kristal oranını biçimlendirir (örn: 3/5).
 */
export function formatCrystalRatio(collected: number, total: number): string {
  const safeCollected = Number.isFinite(collected) ? Math.max(0, collected) : 0;
  const safeTotal = Number.isFinite(total) ? Math.max(0, total) : 0;
  return `${safeCollected}/${safeTotal}`;
}

/**
 * Gimbal dokunmatik alanının piksel sınırlarına göre merkez koordinatlarını ve izin verilen maksimum yarıçapı hesaplar.
 */
export function calculateGimbalBounds(
  rect: { left: number; top: number; width: number; height: number },
  padding = 24,
  minRadius = 40,
): GimbalBounds {
  const centerX = rect.left + rect.width * 0.5;
  const centerY = rect.top + rect.height * 0.5;
  const maxRadius = Math.max(minRadius, rect.width * 0.5 - padding);
  return { centerX, centerY, maxRadius };
}

/**
 * Mobil kontrolcüde sanal gimbal ve sensör yüzeyinin görünür olup olmayacağını belirler.
 */
export function resolveGimbalSurfaceVisibility(
  permissionState: string,
  controllerTouchOverride: boolean,
  activeRoomCode: string,
  isRoomEditorOpen: boolean,
): boolean {
  if (isRoomEditorOpen || !activeRoomCode) return false;
  return permissionState === 'granted' || controllerTouchOverride;
}

/**
 * 2B ufuk küresinin piksel konumunun DOM reflow/repaint eşiğini aşıp aşmadığını denetler (0.2px delta filtresi).
 */
export function shouldUpdateGimbalDotOffset(
  newX: number,
  newY: number,
  lastX: number,
  lastY: number,
  threshold = 0.2,
): boolean {
  return (
    Math.abs(newX - lastX) >= threshold || Math.abs(newY - lastY) >= threshold
  );
}

/**
 * Sayısal açı metinlerinin (pitch/roll) DOM güncelleme periyodunu denetler (varsayılan 120ms = ~8Hz).
 */
export function shouldUpdateAngleText(
  now: number,
  lastUpdateTime: number,
  intervalMs = 120,
): boolean {
  return now - lastUpdateTime >= intervalMs;
}

/**
 * Gelen işaretçi (pointer) olayının aktif sürüklenen işaretçi kimliğiyle eşleştiğini doğrular.
 */
export function isPointerEventMatching(
  activePointerId: number | null,
  eventPointerId: number,
): boolean {
  return activePointerId !== null && activePointerId === eventPointerId;
}

/**
 * Sürüklemenin takılı kalıp kalmadığını denetler (blur, gizlenme veya yüzey kapanmasında sıfırlama için).
 */
export function shouldResetPointerDrag(
  isDragging: boolean,
  activePointerId: number | null,
): boolean {
  return isDragging || activePointerId !== null;
}

/**
 * Oyuncu yuvası (1P / 2P) seçim değişikliği durumunu çözümler.
 */
export function resolveSlotChange(
  currentSlot: 1 | 2,
  requestedSlot: 1 | 2,
): { changed: boolean; nextSlot: 1 | 2 } {
  return {
    changed: currentSlot !== requestedSlot,
    nextSlot: requestedSlot,
  };
}




