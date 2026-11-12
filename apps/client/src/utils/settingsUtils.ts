import type { BallSkin } from '@gyromaze/shared';

export interface BallSkinOption {
  value: BallSkin;
  label: string;
  swatchClass: string;
}

export const BALL_SKIN_OPTIONS: BallSkinOption[] = [
  { value: 'chrome', label: 'Krom', swatchClass: 'bg-zinc-200' },
  { value: 'emerald', label: 'Zümrüt', swatchClass: 'bg-emerald-500' },
  { value: 'plasma', label: 'Plazma', swatchClass: 'bg-purple-500' },
  { value: 'crimson', label: 'Kızıl', swatchClass: 'bg-rose-500' },
];

export const GRAVITY_SCALE_OPTIONS = [
  { value: 28, label: 'Yavaş' },
  { value: 36, label: 'Standart' },
  { value: 46, label: 'Turbo' },
];

export const TILT_RESPONSIVENESS_OPTIONS = [
  { value: 18, label: 'Yumuşak' },
  { value: 32, label: 'Standart' },
  { value: 48, label: 'Anında' },
];

export const VOLUME_SEGMENTED_OPTIONS = [
  { value: 0, label: 'Sessiz' },
  { value: 0.25, label: '%25' },
  { value: 0.5, label: '%50' },
  { value: 0.75, label: '%75' },
  { value: 1, label: '%100' },
];

/**
 * Ses seviyesi ve sessize alma durumuna göre insan okunabilir etiket metni üretir.
 */
export function formatVolumeLabel(soundVolume: number, isMuted: boolean): string {
  if (isMuted || soundVolume === 0) return 'Sessiz';
  const pct = Math.round(soundVolume * 100);
  return `%${pct}`;
}

/**
 * Ses seviyesi ve sessize alma durumuna göre aktif Segmented seçili değerini belirler.
 */
export function resolveActiveVolumeValue(soundVolume: number, isMuted: boolean): number {
  if (isMuted) return 0;
  return Number.isFinite(soundVolume) ? Math.max(0, Math.min(1, soundVolume)) : 0.5;
}

/**
 * Radyo grubu ok tuşlarıyla gezinirken sıradaki indeks numarasını döngüsel (wrap-around) hesaplar.
 */
export function resolveNextRadioIndex(
  currentIndex: number,
  totalCount: number,
  direction: 'next' | 'prev',
): number {
  if (totalCount <= 0) return 0;
  if (direction === 'next') {
    return (currentIndex + 1) % totalCount;
  }
  return (currentIndex - 1 + totalCount) % totalCount;
}

/**
 * Bilye kaplama adına göre renk sınıfını döner.
 */
export function resolveBallSkinSwatch(skin: BallSkin): string {
  const match = BALL_SKIN_OPTIONS.find((opt) => opt.value === skin);
  return match?.swatchClass ?? 'bg-zinc-200';
}
