import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({ example: -34.6037, minimum: -90, maximum: 90 })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: -58.3816, minimum: -180, maximum: 180 })
  @IsLongitude()
  longitude!: number;

  @ApiPropertyOptional({ example: 12.5, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;

  @ApiPropertyOptional({ example: 180, minimum: 0, maximum: 360 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @ApiPropertyOptional({ example: 1.4, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;

  @ApiPropertyOptional({ example: 87, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @ApiPropertyOptional({ example: '2026-05-14T19:00:00.000Z', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
