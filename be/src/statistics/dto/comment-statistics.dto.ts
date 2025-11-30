import { ApiProperty } from '@nestjs/swagger';

export class CommentByTaskDto {
  @ApiProperty({ example: 'uuid-here', description: 'ID của nhiệm vụ' })
  taskId: string;

  @ApiProperty({ example: 'Task title', description: 'Tiêu đề nhiệm vụ' })
  taskTitle: string;

  @ApiProperty({ example: 10, description: 'Số lượng bình luận' })
  commentCount: number;
}

export class CommentByMemberDto {
  @ApiProperty({ example: 'uuid-here', description: 'ID của thành viên' })
  userId: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên thành viên' })
  userName: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL' })
  avatar: string;

  @ApiProperty({ example: 15, description: 'Số lượng bình luận' })
  commentCount: number;
}

export class CommentStatisticsDto {
  @ApiProperty({ example: 100, description: 'Tổng số bình luận' })
  totalComments: number;

  @ApiProperty({ example: 5, description: 'Số bình luận gần đây (theo filter)' })
  recentComments: number;

  @ApiProperty({ type: [CommentByTaskDto], description: 'Top nhiệm vụ có nhiều bình luận' })
  commentsByTask: CommentByTaskDto[];

  @ApiProperty({ type: [CommentByMemberDto], description: 'Top thành viên có nhiều bình luận' })
  commentsByMember: CommentByMemberDto[];
}

