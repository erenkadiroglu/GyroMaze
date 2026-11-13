/**
 * Mobil kontrolcü merkez sahnesi (ControllerCenterStage) görünüm ve aşama yardımcıları.
 */

export type CenterStageMode = 'room' | 'sensor' | 'gimbal';

/**
 * Aktif sahne aşamasına göre semantik erişilebilirlik etiketini döner.
 */
export function getCenterStageAriaLabel(stageMode?: CenterStageMode | string): string {
  switch (stageMode) {
    case 'room':
      return 'Oda bağlantı kartı';
    case 'sensor':
      return 'Sensör izin ve etkinleştirme kartı';
    case 'gimbal':
      return 'Sanal gimbal ve açı gösterge alanı';
    default:
      return 'Mobil kontrolcü merkez aşaması';
  }
}

/**
 * Merkez sahne bölümü için ana container CSS sınıflarını döner.
 */
export function getCenterStageContainerClass(): string {
  return 'my-auto flex flex-col items-center justify-center py-3';
}

/**
 * Gimbal aşamasının aktif olup olmadığını doğrular.
 */
export function isGimbalStageActive(stageMode?: string): boolean {
  return stageMode === 'gimbal';
}

/**
 * Oda giriş aşamasının aktif olup olmadığını doğrular.
 */
export function isRoomStageActive(stageMode?: string): boolean {
  return stageMode === 'room';
}

/**
 * Sensör izni aşamasının aktif olup olmadığını doğrular.
 */
export function isSensorStageActive(stageMode?: string): boolean {
  return stageMode === 'sensor';
}

/**
 * Ekran okuyucu veya test telemetrisi için aşama, eşleşme ve kontrol modu özetini formatlar.
 */
export function formatStageModeSummary(
  stageMode: CenterStageMode | string,
  isPaired: boolean,
  isTouchOverride: boolean,
): string {
  const safeMode = (stageMode ?? '').trim() || 'bilinmeyen';
  const pairText = isPaired ? 'Eşleşti' : 'Bağlantı Yok';
  const controlText = isTouchOverride ? 'Dokunmatik' : 'Jiroskop';

  return `Aşama: ${safeMode}, Bağlantı: ${pairText}, Kontrol: ${controlText}`;
}

