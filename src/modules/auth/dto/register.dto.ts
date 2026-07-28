import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsNumberString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { avatarPresetIds } from '../../avatars/avatar-presets';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', maxLength: 120 })
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @ApiProperty({
    example: 'yu_nakasone',
    minLength: 3,
    maxLength: 30,
    pattern: '^[a-z0-9_.]+$',
    description: 'Unique lowercase username. Allows letters, numbers, underscore, and dot.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_.]+$/)
  username!: string;

  @ApiProperty({ example: 'Compass User', minLength: 1, maxLength: 80 })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName!: string;

  @ApiProperty({ example: 'secure-password-123', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiProperty({
    example: 'default-avatar-01',
    enum: avatarPresetIds,
    description: 'Selected default avatar preset id.',
  })
  @IsString()
  @IsIn(avatarPresetIds)
  avatarPresetId!: string;

  @ApiPropertyOptional({ example: '1', description: 'Language id as a stringified BigInt.' })
  @IsOptional()
  @IsNumberString()
  languageId?: string;
}
