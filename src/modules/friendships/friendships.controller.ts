import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { FriendshipsService } from './friendships.service';

@UseGuards(JwtAuthGuard)
@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Post('requests')
  createRequest(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateFriendRequestDto) {
    return this.friendshipsService.createRequest(user.id, dto);
  }

  @Post(':id/accept')
  acceptRequest(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.friendshipsService.acceptRequest(user.id, id);
  }

  @Post(':id/decline')
  declineRequest(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.friendshipsService.declineRequest(user.id, id);
  }

  @Get()
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.friendshipsService.findByUser(user.id);
  }
}
