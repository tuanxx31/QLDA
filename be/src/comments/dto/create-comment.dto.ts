import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Đây là nội dung bình luận' })
  @IsOptional()
  @IsString()
  content?: string | null;

  @ApiProperty({ example: 'uploads/file.pdf', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ example: ['user-id-1', 'user-id-2'], required: false })
  @IsOptional()
  @IsArray()
  mentionIds?: string[];
}

