import type {
  BallSkin,
  BoardTheme,
  CameraMode,
  ColorScheme,
} from '@gyromaze/shared';
import { BALL_SKIN_OPTIONS } from './settingsUtils.ts';

export const COLOR_SCHEME_OPTIONS: { value: ColorScheme; label: string }[] = [
  { value: 'dark', label: 'Gece' },
  { value: 'light', label: 'Gündüz' },
];

export const BOARD_THEME_OPTIONS: { value: BoardTheme; label: string }[] = [
  { value: 'emerald', label: 'Zümrüt' },
  { value: 'cyberpunk', label: 'Siberpunk' },
  { value: 'crimson', label: 'Kızıl Kor' },
  { value: 'daylight', label: 'Gün Işığı' },
];

export const CAMERA_MODE_OPTIONS: { value: CameraMode; label: string }[] = [
  { value: 'isometric', label: 'İzometrik' },
  { value: 'topdown', label: 'Üstten' },
  { value: 'follow', label: 'Takip' },
];

/**
 * Bilye görünümü radyo kartının aktiflik stil sınıflarını döner.
 */
export function resolveBallSkinButtonClass(active: boolean): string {
  return active
    ? 'border-brass bg-surface-2 text-fg'
    : 'border-line bg-surface-2/40 text-muted hover:text-fg';
}

/**
 * Bilye kaplaması için swatch renk sınıfını döner.
 */
export function resolveBallSkinSwatchClass(skin: BallSkin): string {
  const match = BALL_SKIN_OPTIONS.find((opt) => opt.value === skin);
  return match?.swatchClass ?? 'bg-zinc-200';
}

/**
 * Bilye kaplaması için erişilebilir etiket metnini biçimlendirir.
 */
export function formatBallSkinAriaLabel(label: string, active: boolean): string {
  return active ? `${label} (Seçili)` : label;
}
