import { IsNotEmpty, IsString } from 'class-validator';

export class JoinGroupDto {
  @IsNotEmpty()
  @IsString()
  inviteCode: string;
}
