import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
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
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { FindFriendshipsQueryDto } from './dto/find-friendships-query.dto';
import { FriendshipsService } from './friendships.service';

@ApiTags('friendships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Post('requests')
  @ApiOperation({ summary: 'Create a friend request.' })
  @ApiOkResponse({ description: 'Friend request created.' })
  @ApiConflictResponse({ description: 'Friendship already exists.' })
  @ApiNotFoundResponse({ description: 'Addressee user not found.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  createRequest(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateFriendRequestDto) {
    return this.friendshipsService.createRequest(user.id, dto);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept a pending friend request addressed to the authenticated user.' })
  @ApiParam({ name: 'id', description: 'Friendship id as a stringified BigInt.' })
  @ApiOkResponse({ description: 'Friend request accepted.' })
  @ApiNotFoundResponse({ description: 'Pending friend request not found.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  acceptRequest(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.friendshipsService.acceptRequest(user.id, id);
  }

  @Post(':id/decline')
  @ApiOperation({
    summary: 'Decline a pending friend request addressed to the authenticated user.',
  })
  @ApiParam({ name: 'id', description: 'Friendship id as a stringified BigInt.' })
  @ApiOkResponse({ description: 'Friend request declined.' })
  @ApiNotFoundResponse({ description: 'Pending friend request not found.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  declineRequest(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.friendshipsService.declineRequest(user.id, id);
  }

  @Get()
  @ApiOperation({
    summary: 'List friendships for the authenticated user, optionally filtered by type and status.',
  })
  @ApiOkResponse({ description: 'Friendships involving the authenticated user.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  findMine(@CurrentUser() user: AuthenticatedUser, @Query() query: FindFriendshipsQueryDto) {
    return this.friendshipsService.findByUser(user.id, query);
  }
}
