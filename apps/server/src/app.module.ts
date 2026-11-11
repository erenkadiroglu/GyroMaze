import { Module } from '@nestjs/common';
import { GyroGateway } from './gateway/gyro.gateway';
import { RoomService } from './gateway/room.service';

/**
 * GyroMaze arka uç sunucusunun ana uygulama modülü.
 * WebSocket ağ geçidi (GyroGateway) ve oda yönetim servisi (RoomService) burada tanımlanır.
 */
@Module({
  imports: [],
  controllers: [],
  providers: [RoomService, GyroGateway],
})
export class AppModule {}
