import { IsNotEmpty, IsUUID } from 'class-validator';

export class LeaveGroupDto {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}
