import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post('me')
  @ApiOperation({ summary: 'Store a location sample for the authenticated user.' })
  @ApiOkResponse({ description: 'Location sample created.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  updateMine(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateLocationDto) {
    return this.locationsService.createLocation(user.id, dto);
  }

  @Get('friends/latest')
  @ApiOperation({ summary: 'Get the latest known locations for accepted friends.' })
  @ApiOkResponse({ description: 'Latest friend locations visible to the authenticated user.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  getLatestFriendLocations(@CurrentUser() user: AuthenticatedUser) {
    return this.locationsService.getLatestFriendLocations(user.id);
  }
}
