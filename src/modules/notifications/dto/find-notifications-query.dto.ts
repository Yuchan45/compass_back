import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNumberString, IsOptional, Max, Min } from 'class-validator';

export class FindNotificationsQueryDto {
  @ApiPropertyOptional({
    default: false,
    description: 'When true, returns only unread notifications.',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  unreadOnly?: boolean;

  @ApiPropertyOptional({
    default: 20,
    example: 20,
    maximum: 100,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? value : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Notification id cursor returned by the previous response.',
    example: '42',
  })
  @IsOptional()
  @IsNumberString()
  cursor?: string;
}
