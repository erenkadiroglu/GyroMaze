/**
 * Masaüstü HUD üzerinde yönetilen tüm modal anahtarları.
 */
export const DESKTOP_MODAL_KEYS = [
  'editor',
  'settings',
  'help',
  'pairing',
  'leaderboard',
  'outcome',
] as const;

export type DesktopModalKey = (typeof DESKTOP_MODAL_KEYS)[number];

/**
 * Liderlik tablosunun başlangıç seviyesini 1 ile sınır (varsayılan 5) arasında güvenle sınırlar.
 */
export function resolveInitialLeaderboardLevel(
  level: number | null | undefined,
  maxLevel = 5,
): number {
  if (typeof level !== 'number' || Number.isNaN(level)) {
    return 1;
  }
  return Math.max(1, Math.min(Math.floor(level), maxLevel));
}

/**
 * Skor tablosu başlığı için erişilebilir ve anlaşılır metin üretir.
 */
export function formatLeaderboardModalTitle(level?: number | null): string {
  if (level && level > 0) {
    return `Seviye ${level} Skor Tablosu`;
  }
  return 'Küresel Skor Tablosu';
}

/**
 * Belirtilen modal durum haritasında herhangi bir modalın açık olup olmadığını doğrular.
 */
export function isAnyDesktopModalOpen(states: Partial<Record<DesktopModalKey, boolean>>): boolean {
  return Object.values(states).some(Boolean);
}

/**
 * Skor tablosu modalının gösterilip gösterilmeyeceğini kontrol eder.
 */
export function shouldRenderLeaderboardModal(isOpen: boolean): boolean {
  return Boolean(isOpen);
}

