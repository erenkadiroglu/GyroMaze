import { Controller, Get } from '@nestjs/common';
import { RoomService } from '../gateway/room.service';
import { buildHealthResponse, HealthResponse } from './httpControllerUtils';

export type { HealthResponse };

/**
 * Orkestratörler ve ters proxy'ler için hafif HTTP sağlık ve telemetri uç noktası.
 */
@Controller()
export class HealthController {
  constructor(private readonly roomService: RoomService) {}

  @Get(['health', 'api/health'])
  public getHealth(): HealthResponse {
    const stats = this.roomService.getStats();
    return buildHealthResponse(stats);
  }
}
