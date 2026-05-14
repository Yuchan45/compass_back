import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user profile.' })
  @ApiOkResponse({ description: 'Authenticated public user profile.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findByIdOrThrow(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the authenticated user profile.' })
  @ApiOkResponse({ description: 'Updated public user profile.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete the authenticated user profile.' })
  @ApiNoContentResponse({ description: 'Profile deleted.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  removeMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.deleteProfile(user.id);
  }
}
