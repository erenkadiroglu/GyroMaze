import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardEntry } from '@gyromaze/shared';
import { RoomService } from './gateway/room.service';

export interface LeaderboardResponse {
  total: number;
  levelId: number | null;
  entries: LeaderboardEntry[];
}

/**
 * Küresel liderlik tablosu kayıtlarını JSON REST formatında sunan HTTP denetleyicisi.
 * Belirli bir bölüm için `?level=1` sorgu parametresiyle filtreleme yapılabilir.
 */
@Controller('api/leaderboard')
export class LeaderboardController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  public getLeaderboard(
    @Query('level') levelQuery?: string,
  ): LeaderboardResponse {
    const all = this.roomService.getLeaderboard();
    if (typeof levelQuery === 'string' && levelQuery.trim()) {
      const parsedLevel = parseInt(levelQuery.trim(), 10);
      if (Number.isInteger(parsedLevel) && parsedLevel >= 1) {
        const filtered = all.filter((entry) => entry.levelId === parsedLevel);
        return {
          total: filtered.length,
          levelId: parsedLevel,
          entries: filtered,
        };
      }
    }

    return {
      total: all.length,
      levelId: null,
      entries: all,
    };
  }
}

