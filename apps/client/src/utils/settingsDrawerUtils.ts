import type { ColorScheme, BoardTheme } from '@gyromaze/shared';
import type { MazeLevelDefinition } from '../components/scene/levels/types.ts';
import { decodeCustomMazeLevelFromUrl } from './customMapCodec.ts';

export interface CustomMapImportResult {
  level: MazeLevelDefinition | null;
  notification: {
    message: string;
    tone: 'success' | 'warn';
  } | null;
}

export interface ModalNavigationState {
  isSettingsOpen: boolean;
  isEditorOpen: boolean;
  isLeaderboardOpen: boolean;
}

/**
 * Renk düzeni ve tema kombinasyonuna göre efektif HTML data-scheme değerini çözer.
 */
export function resolveEffectiveColorScheme(
  colorScheme: ColorScheme,
  boardTheme: BoardTheme,
): 'light' | 'dark' {
  return colorScheme === 'light' || boardTheme === 'daylight' ? 'light' : 'dark';
}

/**
 * Sessize alma durumuna göre Web Audio için gerçek ses seviyesini hesaplar.
 */
export function resolveEffectiveSoundVolume(
  isSoundMuted: boolean,
  soundVolume: number,
): number {
  if (isSoundMuted) return 0;
  if (typeof soundVolume !== 'number' || !Number.isFinite(soundVolume) || soundVolume < 0) {
    return 0;
  }
  return Math.min(1, soundVolume);
}

/**
 * URL üzerinden gelen ?map= parametresini güvenle çözümler ve bildirim metnini üretir.
 */
export function resolveCustomMapImport(
  encodedMap: string | null | undefined,
): CustomMapImportResult {
  if (!encodedMap || typeof encodedMap !== 'string' || !encodedMap.trim()) {
    return { level: null, notification: null };
  }

  const imported = decodeCustomMazeLevelFromUrl(encodedMap.trim());
  if (imported) {
    return {
      level: imported,
      notification: {
        message: `“${imported.title}” paylaşılan bağlantıdan yüklendi.`,
        tone: 'success',
      },
    };
  }

  return {
    level: null,
    notification: {
      message: 'Paylaşılan özel harita bağlantısı geçersiz veya bozuk.',
      tone: 'warn',
    },
  };
}

/**
 * URL dizesinden belirtilen arama sorgusu parametresini temizleyerek temiz URL döner.
 */
export function stripUrlParam(currentHref: string, paramName: string): string {
  try {
    const url = new URL(currentHref);
    if (!url.searchParams.has(paramName)) return currentHref;
    url.searchParams.delete(paramName);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return currentHref;
  }
}

/**
 * Ayarlar çekmecesinden harita editörü veya liderlik tablosuna geçişte modal durumlarını günceller.
 */
export function resolveSettingsModalNavigation(
  target: 'editor' | 'leaderboard',
): ModalNavigationState {
  return {
    isSettingsOpen: false,
    isEditorOpen: target === 'editor',
    isLeaderboardOpen: target === 'leaderboard',
  };
}

/**
 * Liste seçenekleri arasında döngüsel geçiş sağlar.
 */
export function resolveNextCycleOption<T>(current: T, options: readonly T[]): T {
  if (!options.length) return current;
  const idx = options.indexOf(current);
  const nextIdx = (idx + 1) % options.length;
  return options[nextIdx >= 0 ? nextIdx : 0];
}
