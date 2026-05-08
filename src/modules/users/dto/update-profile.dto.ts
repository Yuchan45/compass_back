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
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUrl({ require_protocol: true })
  avatarUrl?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsNumberString()
  languageId?: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  locationSharingEnabled?: boolean;
}
