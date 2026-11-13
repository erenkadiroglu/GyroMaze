import type { LeaderboardEntry } from '@gyromaze/shared';

/**
 * Süre değerini (saniye) insan tarafından okunabilir süre metnine biçimlendirir.
 * 60 saniyeden kısa süreler: "14.2 sn"
 * 60 saniye ve üzeri süreler: "1:23.4 sn" veya "12:05.1 sn"
 */
export function formatRecordTime(timeSeconds: number): string {
  if (!Number.isFinite(timeSeconds) || timeSeconds < 0) {
    return '0.0 sn';
  }
  if (timeSeconds < 60) {
    return `${timeSeconds.toFixed(1)} sn`;
  }
  const minutes = Math.floor(timeSeconds / 60);
  const remainingSeconds = timeSeconds % 60;
  const formattedSeconds =
    remainingSeconds < 10
      ? `0${remainingSeconds.toFixed(1)}`
      : remainingSeconds.toFixed(1);
  return `${minutes}:${formattedSeconds} sn`;
}

/**
 * Skorun kaydedildiği zaman damgasını (ms) okunabilir tarih/saat metnine dönüştürür.
 */
export function formatRecordDate(createdAt: number): string {
  if (!Number.isFinite(createdAt) || createdAt <= 0) {
    return 'Bilinmiyor';
  }
  const date = new Date(createdAt);
  const now = new Date();
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (isSameDay) {
    return `Bugün ${hours}:${minutes}`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month} ${hours}:${minutes}`;
}

export interface FilterLeaderboardOptions {
  levelId?: number | 'all';
  searchQuery?: string;
}

/**
 * Liderlik tablosu kayıtlarını seçilen bölüme ve arama sorgusuna göre süresi en hızlıdan
 * en yavaşa doğru sıralayarak filtreler.
 */
export function filterLeaderboardEntries(
  entries: LeaderboardEntry[],
  options: FilterLeaderboardOptions = {},
): LeaderboardEntry[] {
  if (!Array.isArray(entries)) return [];

  const { levelId = 'all', searchQuery = '' } = options;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return entries
    .filter((entry) => {
      if (levelId !== 'all' && entry.levelId !== levelId) {
        return false;
      }
      if (
        normalizedQuery &&
        !entry.playerName.toLowerCase().includes(normalizedQuery)
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.timeSeconds - b.timeSeconds);
}

/**
 * /api/leaderboard REST uç noktasından taze rekor listesini çeker.
 */
export async function fetchLeaderboardFromRest(
  levelId?: number,
): Promise<LeaderboardEntry[]> {
  const url =
    typeof levelId === 'number' && levelId > 0
      ? `/api/leaderboard?level=${levelId}`
      : '/api/leaderboard';

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as LeaderboardEntry[]) : [];
}

/**
 * Aktif bölüm numarasına göre ortalanmış 5 elemanlı bölüm listesi penceresi üretir.
 */
export function calculateLevelWindow(
  activeLevel: number,
  windowSize = 5,
): number[] {
  const safeLevel = Number.isFinite(activeLevel) && activeLevel > 0 ? activeLevel : 1;
  const start = Math.max(1, safeLevel - Math.floor(windowSize / 2));
  return Array.from({ length: windowSize }, (_, i) => start + i);
}

/**
 * Sıralama indeksine göre (0: altın, 1: gümüş, 2: bronz, 3+: standart) rozet ve satır görsel stillerini çözümler.
 */
export function resolveRankBadgeStyle(index: number): {
  isPodium: boolean;
  medalType?: 'gold' | 'silver' | 'bronze';
  badgeClass: string;
  rowClass: string;
} {
  switch (index) {
    case 0:
      return {
        isPodium: true,
        medalType: 'gold',
        badgeClass: 'bg-brass text-brass-fg shadow-sm',
        rowClass: 'border-brass/40 bg-brass/10 ring-1 ring-brass/20',
      };
    case 1:
      return {
        isPodium: true,
        medalType: 'silver',
        badgeClass: 'bg-slate-300 text-slate-900',
        rowClass: 'border-slate-400/30 bg-surface-2/80',
      };
    case 2:
      return {
        isPodium: true,
        medalType: 'bronze',
        badgeClass: 'bg-amber-600 text-white',
        rowClass: 'border-amber-700/30 bg-surface-2/60',
      };
    default:
      return {
        isPodium: false,
        badgeClass: 'bg-surface text-muted',
        rowClass: 'border-line bg-surface-2/40',
      };
  }
}

/**
 * Bölüm kimliğini standart rozet metnine dönüştürür (Böl. 01, Böl. 05, Böl. 12).
 */
export function formatLevelBadge(levelId: number): string {
  const safeId = Number.isFinite(levelId) && levelId > 0 ? levelId : 1;
  return `Böl. ${safeId < 10 ? `0${safeId}` : String(safeId)}`;
}

/**
 * Filtreleme ve arama durumuna göre boş liste mesajını formatlar.
 */
export function resolveEmptyLeaderboardMessage(
  selectedLevel: number | 'all',
  searchQuery: string,
): { title?: string; message: string } {
  const cleanQuery = searchQuery.trim();
  if (cleanQuery) {
    return {
      title: 'Eşleşen kayıt bulunamadı',
      message: `"${cleanQuery}" için arama kriterini değiştirip tekrar deneyin.`,
    };
  }
  if (selectedLevel === 'all') {
    return {
      message: 'Henüz kayıtlı hiçbir skor bulunmuyor.',
    };
  }
  return {
    message: `Bölüm ${selectedLevel} için henüz kayıtlı bir skor yok. İlk rekoru sen kır!`,
  };
}

