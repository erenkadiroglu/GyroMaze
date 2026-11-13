import type { LeaderboardEntry } from '@gyromaze/shared';

export const DEFAULT_SYNC_ERROR_MESSAGE =
  'Sunucu skorları yenilenemedi; mevcut kayıtlar gösteriliyor.';

export const CUSTOM_MAP_LEVEL_ID = 99;

/**
 * Başlangıç bölüm numarasını güvenli liderlik tablosu seçimine çözümler.
 * 99 (özel harita) veya geçersiz değerlerde varsayılan olarak 1. bölüm seçilir.
 */
export function resolveInitialSelectedLevel(
  initialLevel?: number,
): number | 'all' {
  if (typeof initialLevel !== 'number' || !Number.isFinite(initialLevel)) {
    return 1;
  }
  if (initialLevel === CUSTOM_MAP_LEVEL_ID || initialLevel < 1) {
    return 1;
  }
  return Math.max(1, Math.floor(initialLevel));
}

/**
 * Seçilen bölüm değerine göre 1 tabanlı aktif bölüm numarasını çözümler.
 * 'all' seçeneğinde veya geçersiz durumlarda 1 döner.
 */
export function resolveActiveLevelNumber(
  selectedLevel: number | 'all',
): number {
  if (
    typeof selectedLevel === 'number' &&
    Number.isFinite(selectedLevel) &&
    selectedLevel > 0
  ) {
    return Math.floor(selectedLevel);
  }
  return 1;
}

/**
 * Modal açıldığında uygulanacak efektif bölüm seçimini belirler.
 */
export function resolveEffectiveSelectedLevelOnOpen(
  initialLevel: number | undefined,
  currentSelected: number | 'all',
): number | 'all' {
  if (
    typeof initialLevel === 'number' &&
    Number.isFinite(initialLevel) &&
    initialLevel !== CUSTOM_MAP_LEVEL_ID &&
    initialLevel > 0
  ) {
    return Math.floor(initialLevel);
  }
  return currentSelected;
}

export interface LeaderboardMetrics {
  bestTime: number | null;
  averageTime: number | null;
  totalCount: number;
  uniquePlayerCount: number;
}

/**
 * Verilen liderlik kayıtları üzerinden özet istatistikleri hesaplar.
 */
export function calculateLeaderboardMetrics(
  entries: LeaderboardEntry[],
): LeaderboardMetrics {
  if (!Array.isArray(entries) || entries.length === 0) {
    return {
      bestTime: null,
      averageTime: null,
      totalCount: 0,
      uniquePlayerCount: 0,
    };
  }

  let minTime = Infinity;
  let totalTime = 0;
  const uniquePlayers = new Set<string>();

  for (const entry of entries) {
    if (typeof entry.timeSeconds === 'number' && Number.isFinite(entry.timeSeconds)) {
      if (entry.timeSeconds < minTime) {
        minTime = entry.timeSeconds;
      }
      totalTime += entry.timeSeconds;
    }
    if (typeof entry.playerName === 'string' && entry.playerName.trim()) {
      uniquePlayers.add(entry.playerName.trim().toLowerCase());
    }
  }

  const bestTime = Number.isFinite(minTime) ? minTime : null;
  const averageTime = entries.length > 0 ? Number((totalTime / entries.length).toFixed(1)) : null;

  return {
    bestTime,
    averageTime,
    totalCount: entries.length,
    uniquePlayerCount: uniquePlayers.size,
  };
}

/**
 * Arama ve filtreleme durumuna göre boş liste bilgilendirme mesajını üretir.
 */
export function resolveLeaderboardEmptyStateMessage(options: {
  hasEntries: boolean;
  isSearching: boolean;
  selectedLevel: number | 'all';
  searchQuery?: string;
}): string {
  const { hasEntries, isSearching, selectedLevel, searchQuery = '' } = options;

  if (hasEntries) {
    return '';
  }

  const trimmedQuery = searchQuery.trim();
  if (isSearching && trimmedQuery.length > 0) {
    return `"${trimmedQuery}" araması için skor kaydı bulunamadı.`;
  }

  if (typeof selectedLevel === 'number') {
    return `Bölüm ${selectedLevel} için henüz kayıtlı rekor bulunmuyor.`;
  }

  return 'Henüz hiçbir bölümde kayıtlı skor bulunmuyor.';
}

/**
 * Bölüm sekmesi erişilebilirlik (aria-label) etiketini biçimlendirir.
 */
export function resolveLevelTabAriaLabel(
  level: number | 'all',
  isSelected: boolean,
): string {
  const base = level === 'all' ? 'Tüm Bölümler' : `Bölüm ${level}`;
  return isSelected ? `${base} (seçili)` : base;
}

/**
 * Yenile butonu erişilebilirlik (aria-label) etiketini biçimlendirir.
 */
export function resolveRefreshButtonAriaLabel(isRefreshing: boolean): string {
  return isRefreshing
    ? 'Skor tablosu yenileniyor...'
    : 'Skor tablosunu sunucudan yenile';
}

/**
 * Yeni elde edilen sürenin mevcut kişisel rekoru kırıp kırmadığını kontrol eder.
 */
export function canSubmitNewRecord(
  currentTime: number,
  existingBestTime: number | null | undefined,
): boolean {
  if (!Number.isFinite(currentTime) || currentTime <= 0) {
    return false;
  }
  if (existingBestTime == null || !Number.isFinite(existingBestTime)) {
    return true;
  }
  return currentTime < existingBestTime;
}
