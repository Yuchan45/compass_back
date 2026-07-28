import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { envSchema } from './config/env.schema';
import { AuthModule } from './modules/auth/auth.module';
import { AvatarsModule } from './modules/avatars/avatars.module';
import { FriendshipsModule } from './modules/friendships/friendships.module';
import { HealthModule } from './modules/health/health.module';
import { LocationsModule } from './modules/locations/locations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    HealthModule,
    AuthModule,
    AvatarsModule,
    UsersModule,
    FriendshipsModule,
    LocationsModule,
    NotificationsModule,
    RealtimeModule,
  ],
})
export class AppModule {}
