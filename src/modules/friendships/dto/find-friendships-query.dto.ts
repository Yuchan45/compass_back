import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum FriendshipQueryType {
  Sent = 'sent',
  Received = 'received',
}

export enum FriendshipQueryStatus {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Accepted = 'ACCEPTED',
}

export class FindFriendshipsQueryDto {
  @ApiPropertyOptional({
    enum: FriendshipQueryType,
    example: FriendshipQueryType.Received,
  })
  @IsOptional()
  @IsEnum(FriendshipQueryType)
  type?: FriendshipQueryType;

  @ApiPropertyOptional({
    enum: FriendshipQueryStatus,
    example: FriendshipQueryStatus.Pending,
    description: '`REJECTED` maps to the persisted `DECLINED` friendship status.',
  })
  @IsOptional()
  @IsEnum(FriendshipQueryStatus)
  status?: FriendshipQueryStatus;
}
