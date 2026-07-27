import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum FriendsSortBy {
  AcceptedAt = 'acceptedAt',
  LastSeenAt = 'lastSeenAt',
  DisplayName = 'displayName',
}

export enum FriendsSortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export enum FriendsRelationshipStatus {
  Accepted = 'accepted',
  Rejected = 'rejected',
  Blocked = 'blocked',
}

export class FindFriendsQueryDto {
  @ApiPropertyOptional({
    enum: FriendsRelationshipStatus,
    default: FriendsRelationshipStatus.Accepted,
    description: '`rejected` maps to the persisted `DECLINED` friendship status.',
  })
  @IsOptional()
  @IsEnum(FriendsRelationshipStatus)
  status?: FriendsRelationshipStatus;

  @ApiPropertyOptional({
    example: '2026-05-01T00:00:00.000Z',
    description: 'Inclusive lower bound for the friendship acceptedAt timestamp.',
  })
  @IsOptional()
  @IsDateString()
  acceptedFrom?: string;

  @ApiPropertyOptional({
    example: '2026-05-31T23:59:59.999Z',
    description: 'Inclusive upper bound for the friendship acceptedAt timestamp.',
  })
  @IsOptional()
  @IsDateString()
  acceptedTo?: string;

  @ApiPropertyOptional({
    example: '2026-05-01T00:00:00.000Z',
    deprecated: true,
    description: 'Deprecated alias for acceptedFrom.',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-05-31T23:59:59.999Z',
    deprecated: true,
    description: 'Deprecated alias for acceptedTo.',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    example: 'keynaka@email.com',
    description: 'Filters by the friend email, not by the authenticated user email.',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'key',
    description: 'Searches the friend email, username, and display name.',
    maxLength: 80,
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(80)
  search?: string;

  @ApiPropertyOptional({
    enum: FriendsSortBy,
    default: FriendsSortBy.AcceptedAt,
  })
  @IsOptional()
  @IsEnum(FriendsSortBy)
  sortBy?: FriendsSortBy;

  @ApiPropertyOptional({
    enum: FriendsSortDirection,
    default: FriendsSortDirection.Desc,
  })
  @IsOptional()
  @IsEnum(FriendsSortDirection)
  sortDirection?: FriendsSortDirection;

  @ApiPropertyOptional({
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? value : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: '20',
    description: 'Friendship id cursor returned by the previous response.',
  })
  @IsOptional()
  @IsNumberString()
  cursor?: string;
}
