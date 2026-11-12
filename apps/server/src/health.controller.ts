import { Controller, Get } from '@nestjs/common';
import { RoomService } from './gateway/room.service';

export interface HealthResponse {
  status: 'ok';
  service: 'gyromaze-server';
  uptimeSeconds: number;
  timestamp: string;
  activeRooms: number;
  connectedControllers: number;
  leaderboardEntries: number;
}

/**
 * Orkestratörler ve ters proxy'ler için hafif HTTP sağlık ve telemetri uç noktası.
 */
@Controller()
export class HealthController {
  constructor(private readonly roomService: RoomService) {}

  @Get(['health', 'api/health'])
  public getHealth(): HealthResponse {
    const stats = this.roomService.getStats();
    return {
      status: 'ok',
      service: 'gyromaze-server',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      ...stats,
    };
  }
}

