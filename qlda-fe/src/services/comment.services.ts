import type { Comment, CreateCommentDto, UpdateCommentDto, CommentsResponse } from '@/types/comment.type';
import { api } from './api';

export const commentService = {
  getComments: async (taskId: string, page: number = 1, limit: number = 20): Promise<CommentsResponse> => {
    const response = await api.get(`/tasks/${taskId}/comments`, {
      params: { page, limit },
    });
    return response.data;
  },

  createComment: async (taskId: string, dto: CreateCommentDto): Promise<Comment> => {
    const response = await api.post(`/tasks/${taskId}/comments`, dto);
    return response.data;
  },

  updateComment: async (taskId: string, commentId: string, dto: UpdateCommentDto): Promise<Comment> => {
    const response = await api.patch(`/tasks/${taskId}/comments/${commentId}`, dto);
    return response.data;
  },

  deleteComment: async (taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  uploadFile: async (taskId: string, file: File): Promise<{ fileUrl: string; filename: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/tasks/${taskId}/comments/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

