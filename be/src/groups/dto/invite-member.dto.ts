import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class InviteMemberDto {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
