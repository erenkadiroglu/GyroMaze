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
