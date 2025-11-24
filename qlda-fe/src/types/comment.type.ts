import type { User } from './user.type';

export interface Comment {
  id: string;
  content: string;
  userId: string;
  user: User;
  taskId: string;
  fileUrl?: string;
  mentions?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  content: string;
  fileUrl?: string;
  mentionIds?: string[];
}

export interface UpdateCommentDto {
  content?: string;
  fileUrl?: string;
  mentionIds?: string[];
}

export interface CommentsResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

