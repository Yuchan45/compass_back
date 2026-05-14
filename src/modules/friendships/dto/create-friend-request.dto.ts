import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class CreateFriendRequestDto {
  @ApiProperty({ example: '2', description: 'Addressee user id as a stringified BigInt.' })
  @IsNumberString()
  addresseeId!: string;
}
