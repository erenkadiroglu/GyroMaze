/**
 * Küresel skor tablosundaki (Leaderboard) tek bir rekor kaydı.
 */
export interface LeaderboardEntry {
  id: string;
  playerName: string;
  levelId: number;
  timeSeconds: number;
  createdAt: number;
}

/**
 * Yeni bir bölüm skoru gönderilirken kullanılan veri yükü.
 */
export interface SubmitScorePayload {
  playerName: string;
  levelId: number;
  timeSeconds: number;
}
