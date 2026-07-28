import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AvatarsService } from '../modules/avatars/avatars.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const avatarsService = app.get(AvatarsService);
    const result = await avatarsService.syncPresets();

    for (const preset of result.data) {
      console.log(`${preset.id} ${preset.style} ${preset.url}`);
    }
  } finally {
    await app.close();
  }
}

void bootstrap();
