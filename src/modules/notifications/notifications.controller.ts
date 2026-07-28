import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { FindNotificationsQueryDto } from './dto/find-notifications-query.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for the authenticated user.' })
  @ApiOkResponse({ description: 'Notifications visible to the authenticated user.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  findMine(@CurrentUser() user: AuthenticatedUser, @Query() query: FindNotificationsQueryDto) {
    return this.notificationsService.findMine(user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Count unread notifications for the authenticated user.' })
  @ApiOkResponse({ description: 'Unread notification count.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  countUnread(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.countUnread(user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for the authenticated user.' })
  @ApiOkResponse({ description: 'Number of notifications marked as read.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read.' })
  @ApiParam({ name: 'id', description: 'Notification id as a stringified BigInt.' })
  @ApiOkResponse({ description: 'Updated notification.' })
  @ApiNotFoundResponse({ description: 'Notification not found.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  markRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notificationsService.markRead(user.id, id);
  }
}
