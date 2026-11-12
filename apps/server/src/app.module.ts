import { Module } from '@nestjs/common';
import { GyroGateway } from './gateway/gyro.gateway';
import { RoomService } from './gateway/room.service';
import { HealthController } from './health.controller';

/**
 * GyroMaze arka uç sunucusunun ana uygulama modülü.
 * WebSocket ağ geçidi (GyroGateway), oda yönetim servisi (RoomService)
 * ve HTTP sağlık uç noktası (HealthController) burada tanımlanır.
 */
@Module({
  imports: [],
  controllers: [HealthController],
  providers: [RoomService, GyroGateway],
})
export class AppModule {}
