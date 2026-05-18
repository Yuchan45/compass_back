import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class SearchUsersQueryDto {
  @ApiPropertyOptional({
    example: 'key',
    description: 'Searches email, username, and display name. Omit it to list profiles.',
    maxLength: 120,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(120)
  query?: string;

  @ApiPropertyOptional({
    example: 20,
    minimum: 1,
    maximum: 50,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value === undefined ? value : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
