import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class CreateProjectMemberDto {
@ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'viewer' })
  @IsOptional()
  @IsEnum(['viewer', 'editor', 'leader'])
  role: 'viewer' | 'editor' | 'leader';
}
