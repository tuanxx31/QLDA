import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';

export class CreateGroupMemberDto {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(['leader', 'member'])
  role: 'leader' | 'member';
}
