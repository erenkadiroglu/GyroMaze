import type { LeaderboardEntry } from '@gyromaze/shared';

export interface RoomStatsSummary {
  activeRooms: number;
  connectedControllers: number;
  leaderboardEntries: number;
}

export interface HealthResponse {
  status: 'ok';
  service: 'gyromaze-server';
  uptimeSeconds: number;
  timestamp: string;
  activeRooms: number;
  connectedControllers: number;
  leaderboardEntries: number;
}

export interface LeaderboardResponse {
  total: number;
  levelId: number | null;
  entries: LeaderboardEntry[];
}

/**
 * Sunucu durum istatistiklerinden ve çalışma süresinden standart HTTP sağlık yanıtı üretir.
 */
export function buildHealthResponse(
  stats: RoomStatsSummary,
  uptimeSeconds: number = Math.floor(process.uptime()),
  timestamp: string = new Date().toISOString(),
): HealthResponse {
  return {
    status: 'ok',
    service: 'gyromaze-server',
    uptimeSeconds: Math.max(0, Math.floor(Number.isFinite(uptimeSeconds) ? uptimeSeconds : 0)),
    timestamp,
    activeRooms: Math.max(0, Math.floor(stats.activeRooms || 0)),
    connectedControllers: Math.max(0, Math.floor(stats.connectedControllers || 0)),
    leaderboardEntries: Math.max(0, Math.floor(stats.leaderboardEntries || 0)),
  };
}

/**
 * HTTP sorgu parametresinden bölüm numarasını ayrıştırır (yalnızca >= 1 geçerli tamsayılar kabul edilir).
 */
export function parseLevelQuery(levelQuery: unknown): number | null {
  if (typeof levelQuery === 'number') {
    return Number.isSafeInteger(levelQuery) && levelQuery >= 1 ? levelQuery : null;
  }
  if (typeof levelQuery !== 'string') {
    return null;
  }
  const trimmed = levelQuery.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = parseInt(trimmed, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || String(parsed) !== trimmed) {
    return null;
  }
  return parsed;
}

/**
 * Liderlik tablosu kayıtlarını opsiyonel bölüm numarasına göre filtreler ve standart yanıt döner.
 */
export function formatLeaderboardResponse(
  allEntries: LeaderboardEntry[],
  levelId: number | null,
): LeaderboardResponse {
  const safeEntries = Array.isArray(allEntries) ? allEntries : [];
  if (levelId !== null) {
    const filtered = safeEntries.filter((entry) => entry.levelId === levelId);
    return {
      total: filtered.length,
      levelId,
      entries: filtered,
    };
  }

  return {
    total: safeEntries.length,
    levelId: null,
    entries: safeEntries,
  };
}

