import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google ID token issued for this backend client id.' })
  @IsString()
  @MinLength(1)
  idToken!: string;
}
