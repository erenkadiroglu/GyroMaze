export interface SensitivityOption {
  mult: 0.75 | 1 | 1.35;
  label: string;
}

export interface PlayerSlotOption {
  slot: 1 | 2;
  label: string;
}

export const SENSITIVITY_OPTIONS: SensitivityOption[] = [
  { mult: 0.75, label: 'Hassas' },
  { mult: 1, label: 'Standart' },
  { mult: 1.35, label: 'Hızlı' },
];

export const PLAYER_SLOT_OPTIONS: PlayerSlotOption[] = [
  { slot: 1, label: '1. Oyuncu (Ana)' },
  { slot: 2, label: '2. Oyuncu (Altın)' },
];

/**
 * Kontrol moduna göre kullanıcıya gösterilecek etkileşim yönergesini döner.
 */
export function resolveGimbalInstructionText(
  controllerTouchOverride: boolean,
): string {
  return controllerTouchOverride
    ? 'Dairedeki küreyi parmağınla sürükleyerek yönlendir'
    : 'Telefonu eğ veya dairedeki küreyi parmağınla sürükle';
}

/**
 * Masaüstü eşleşmesi bekleniyor uyarısının gösterilip gösterilmeyeceğini belirler.
 */
export function shouldShowPairingStatus(
  isControllerPaired: boolean,
  errorMessage: string | null,
): boolean {
  return !isControllerPaired && !errorMessage;
}

/**
 * Donanım sensör sinyali alınamadı uyarısının gösterilip gösterilmeyeceğini belirler.
 */
export function shouldShowSensorTimeoutStatus(
  sensorSignalTimedOut: boolean,
  controllerTouchOverride: boolean,
  hasSensorSignal: boolean,
): boolean {
  return sensorSignalTimedOut && !controllerTouchOverride && !hasSensorSignal;
}

/**
 * Oyuncu yuvasına göre gimbal bilye imlecinin stil sınıflarını çözer.
 */
export function resolveGimbalDotClasses(playerSlot: 1 | 2): {
  dotOuterClass: string;
  dotInnerClass: string;
} {
  return {
    dotOuterClass:
      playerSlot === 2
        ? 'border-warn bg-warn/20'
        : 'border-brass bg-brass/20',
    dotInnerClass: playerSlot === 2 ? 'bg-warn' : 'bg-brass',
  };
}

