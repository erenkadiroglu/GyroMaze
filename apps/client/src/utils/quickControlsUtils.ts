import { formatCameraModeLabel } from './hudUtils.ts';

export type CameraMode = 'isometric' | 'topdown' | 'follow';
export type ColorScheme = 'light' | 'dark';

/**
 * Renk şeması tercihine göre arayüz buton etiketini belirler.
 */
export function resolveThemeToggleLabel(colorScheme: ColorScheme): string {
  return colorScheme === 'light' ? 'Gece moduna geç' : 'Gündüz moduna geç';
}

/**
 * Ses durumuna göre arayüz buton etiketini belirler.
 */
export function resolveSoundToggleLabel(isSoundMuted: boolean): string {
  return isSoundMuted ? 'Sesi aç' : 'Sesi kapat';
}

/**
 * Kamera moduna göre erişilebilirlik ve tooltip etiketini formatlar.
 */
export function formatCameraControlAriaLabel(cameraMode: CameraMode): string {
  const modeLabel = formatCameraModeLabel(cameraMode);
  return `Kamera açısı: ${modeLabel}`;
}

/**
 * Döngüsel olarak bir sonraki kamera modunu hesaplar.
 */
export function resolveNextCameraMode(current: CameraMode): CameraMode {
  switch (current) {
    case 'isometric':
      return 'topdown';
    case 'topdown':
      return 'follow';
    case 'follow':
      return 'isometric';
    default:
      return 'isometric';
  }
}
