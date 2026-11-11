import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * GyroMaze NestJS sunucu başlangıç noktası.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}

void bootstrap();
