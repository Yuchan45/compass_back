import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';

@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post('me')
  updateMine(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateLocationDto) {
    return this.locationsService.createLocation(user.id, dto);
  }

  @Get('friends/latest')
  getLatestFriendLocations(@CurrentUser() user: AuthenticatedUser) {
    return this.locationsService.getLatestFriendLocations(user.id);
  }
}
