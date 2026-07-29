import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, ValidateIf } from 'class-validator';

export enum ColorThemePreference {
  Light = 'light',
  Dark = 'dark',
}

export class UpdateUserSettingsDto {
  @ApiPropertyOptional({
    enum: ColorThemePreference,
    example: ColorThemePreference.Dark,
  })
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(ColorThemePreference)
  colorTheme?: ColorThemePreference;
}
