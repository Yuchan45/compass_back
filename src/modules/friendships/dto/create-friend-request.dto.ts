import { IsNumberString } from 'class-validator';

export class CreateFriendRequestDto {
  @IsNumberString()
  addresseeId!: string;
}
