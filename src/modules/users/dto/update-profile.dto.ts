import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNumberString,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'user@example.com', maxLength: 120 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @ApiPropertyOptional({
    example: 'yu_nakasone',
    minLength: 3,
    maxLength: 30,
    pattern: '^[a-z0-9_.]+$',
    description: 'Unique lowercase username. Allows letters, numbers, underscore, and dot.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_.]+$/)
  username?: string;

  @ApiPropertyOptional({ example: 'Compass User', minLength: 1, maxLength: 80 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    nullable: true,
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUrl({ require_protocol: true })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ example: '1', description: 'Language id as a stringified BigInt.' })
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsNumberString()
  languageId?: string;

  @ApiPropertyOptional({ example: true })
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  locationSharingEnabled?: boolean;
}
