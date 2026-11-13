import { Controller, Get, Query } from '@nestjs/common';
import { RoomService } from '../gateway/room.service';
import {
  parseLevelQuery,
  formatLeaderboardResponse,
  LeaderboardResponse,
} from './httpControllerUtils';

export type { LeaderboardResponse };

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
    const parsedLevel = parseLevelQuery(levelQuery);
    return formatLeaderboardResponse(all, parsedLevel);
  }
}

