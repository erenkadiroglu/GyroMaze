import type { ColorScheme } from './quickControlsUtils.ts';

export interface ViewportResetConfig {
  label: string;
  shortcut: string;
}

export interface ViewportSoundIconConfig {
  isMuted: boolean;
  iconClassName: string;
}

/**
 * Topu başlangıç konumuna sıfırlama butonunun erişilebilirlik metni ve kısayolu.
 */
export function getViewportResetConfig(): ViewportResetConfig {
  return {
    label: 'Topu başa al',
    shortcut: 'R',
  };
}

/**
 * Kamera modları arasında döngü kısayol tuşu.
 */
export function getViewportCameraShortcut(): string {
  return 'C';
}

/**
 * Tema değiştirme kısayol tuşu.
 */
export function getViewportThemeShortcut(): string {
  return 'L';
}

/**
 * Renk şemasının açık (light) mod olup olmadığını doğrular.
 */
export function isLightTheme(colorScheme: ColorScheme): boolean {
  return colorScheme === 'light';
}

/**
 * Renk şemasına göre gösterilecek ikon tipini belirler.
 */
export function getViewportThemeIconName(colorScheme: ColorScheme): 'sun' | 'moon' {
  return colorScheme === 'light' ? 'sun' : 'moon';
}

/**
 * Ses açma/kapatma kısayol tuşu.
 */
export function getViewportSoundShortcut(): string {
  return 'M';
}

/**
 * Sesin sessiz durumuna göre ikon sınıfını ve yapılandırmasını üretir.
 */
export function getViewportSoundIconConfig(isMuted: boolean): ViewportSoundIconConfig {
  return {
    isMuted,
    iconClassName: isMuted ? 'h-4 w-4 text-danger' : 'h-4 w-4',
  };
}

