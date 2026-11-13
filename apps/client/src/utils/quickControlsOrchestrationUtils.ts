import type { CameraMode, ColorScheme } from './quickControlsUtils.ts';
import {
  resolveThemeToggleLabel,
  resolveSoundToggleLabel,
  formatCameraControlAriaLabel,
  resolveNextCameraMode,
} from './quickControlsUtils.ts';

export const QUICK_CONTROLS_TOOLBAR_ARIA_LABEL = 'Hızlı sahne kontrolleri';
export const QUICK_CONTROLS_TOOLBAR_CLASS =
  'gm-panel pointer-events-auto flex items-center gap-1 rounded-2xl p-1.5 shadow-lg';
export const QUICK_CONTROLS_SEPARATOR_CLASS = 'mx-1 h-5 w-px bg-line';

export interface QuickControlsToolbarStateOptions {
  cameraMode: CameraMode;
  colorScheme: ColorScheme;
  isSoundMuted: boolean;
}

export interface QuickControlsToolbarResolvedState {
  cameraLabel: string;
  themeLabel: string;
  soundLabel: string;
  nextCameraMode: CameraMode;
  nextColorScheme: ColorScheme;
  nextSoundMuted: boolean;
  toolbarAriaLabel: string;
  toolbarClass: string;
  separatorClass: string;
}

/**
 * Masaüstü HUD hızlı kontroller araç çubuğunun (QuickControlsToolbar)
 * etiket, durum ve geçiş değerlerini tek bir saf fonksiyonda çözümler.
 */
export function resolveQuickControlsToolbarState(
  options: QuickControlsToolbarStateOptions,
): QuickControlsToolbarResolvedState {
  const { cameraMode, colorScheme, isSoundMuted } = options;

  const cameraLabel = formatCameraControlAriaLabel(cameraMode);
  const themeLabel = resolveThemeToggleLabel(colorScheme);
  const soundLabel = resolveSoundToggleLabel(isSoundMuted);

  const nextCameraMode = resolveNextCameraMode(cameraMode);
  const nextColorScheme = colorScheme === 'light' ? 'dark' : 'light';
  const nextSoundMuted = !isSoundMuted;

  return {
    cameraLabel,
    themeLabel,
    soundLabel,
    nextCameraMode,
    nextColorScheme,
    nextSoundMuted,
    toolbarAriaLabel: QUICK_CONTROLS_TOOLBAR_ARIA_LABEL,
    toolbarClass: QUICK_CONTROLS_TOOLBAR_CLASS,
    separatorClass: QUICK_CONTROLS_SEPARATOR_CLASS,
  };
}

/**
 * Araç çubuğu kök kapsayıcısı için semantik ARIA niteliklerini döner.
 */
export function getQuickControlsAriaProps(): {
  role: 'toolbar';
  'aria-label': string;
} {
  return {
    role: 'toolbar',
    'aria-label': QUICK_CONTROLS_TOOLBAR_ARIA_LABEL,
  };
}

/**
 * Araç çubuğu dikey ayırıcısı için semantik ARIA ve stil niteliklerini döner.
 */
export function getQuickControlsSeparatorProps(): {
  role: 'separator';
  'aria-orientation': 'vertical';
  className: string;
} {
  return {
    role: 'separator',
    'aria-orientation': 'vertical',
    className: QUICK_CONTROLS_SEPARATOR_CLASS,
  };
}

/**
 * Hızlı araç çubuğu butonlarının klavye kısayol ipucu metnini formatlar.
 */
export function formatToolbarButtonTooltip(
  action: 'reset' | 'camera' | 'theme' | 'sound' | 'editor' | 'leaderboard',
): string {
  switch (action) {
    case 'reset':
      return 'Topu Başlangıca Sıfırla (R)';
    case 'camera':
      return 'Kamera Bakış Açısını Değiştir (C)';
    case 'theme':
      return 'Aydınlık / Karanlık Mod (L)';
    case 'sound':
      return 'Ses Efektlerini Aç / Kapat (M)';
    case 'editor':
      return 'Harita Editörünü Aç (E)';
    case 'leaderboard':
      return 'Küresel Skor Tablosu (K)';
    default:
      return '';
  }
}
