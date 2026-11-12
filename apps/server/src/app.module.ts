import { Module } from '@nestjs/common';
import { GyroGateway } from './gateway/gyro.gateway';
import { RoomService } from './gateway/room.service';
import { HealthController } from './health.controller';
import { LeaderboardController } from './leaderboard.controller';

/**
 * GyroMaze arka uç sunucusunun ana uygulama modülü.
 * WebSocket ağ geçidi (GyroGateway), oda yönetim servisi (RoomService),
 * HTTP sağlık uç noktası (HealthController) ve liderlik tablosu REST uç noktası
 * (LeaderboardController) burada tanımlanır.
 */
@Module({
  imports: [],
  controllers: [HealthController, LeaderboardController],
  providers: [RoomService, GyroGateway],
})
export class AppModule {}
