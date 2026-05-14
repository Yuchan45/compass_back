import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

function setupSwagger(app: Awaited<ReturnType<typeof NestFactory.create>>): void {
  const config = new DocumentBuilder()
    .setTitle('Compass API')
    .setDescription('REST API for the Compass real-time location sharing backend.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const corsOrigins = config.get<string[]>('app.corsOrigins', []);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();
  setupSwagger(app);

  const port = config.getOrThrow<number>('app.port');

  await app.listen(port);

  logger.log(`🚀 Server running at http://localhost:${port}/api`);
  logger.log(`📖 Swagger UI available at http://localhost:${port}/api/docs`);
}

void bootstrap();
