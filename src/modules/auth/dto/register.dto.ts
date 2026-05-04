import {
  IsEmail,
  IsOptional,
  IsString,
  IsNumberString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsNumberString()
  languageId?: string;
}
