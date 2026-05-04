import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LocationsModule } from '../locations/locations.module';
import { LocationsGateway } from './locations.gateway';

@Module({
  imports: [AuthModule, LocationsModule],
  providers: [LocationsGateway],
})
export class RealtimeModule {}
