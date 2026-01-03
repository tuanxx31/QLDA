import { Button, Space, Upload, message } from 'antd';
import { PaperClipOutlined, SendOutlined } from '@ant-design/icons';
import { useState, useRef, useEffect } from 'react';
import { commentService } from '@/services/comment.services';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { invalidateStatisticsQueries } from '@/utils/invalidateStatistics';
import type { CreateCommentDto } from '@/types/comment.type';
import type { User } from '@/types/user.type';
import MentionTextarea from '@/components/MentionTextarea';
import useAuth from '@/hooks/useAuth';
import { projectMemberService } from '@/services/project.services';

interface Props {
  taskId: string;
  projectId: string;
  editingComment?: { id: string; content: string; fileUrl?: string; mentions?: User[] } | null;
  onCancelEdit?: () => void;
}

function parseContentForDisplay(content: string, mentions?: User[]): string {
  if (!content) return content;
  
  
  const mentionsMap = new Map<string, User>();
  if (mentions && mentions.length > 0) {
    mentions.forEach((user) => {
      mentionsMap.set(user.id, user);
    });
  }
  
  
  return content.replace(/@\[([a-f0-9-]{36})\]/gi, (match, userId) => {
    const user = mentionsMap.get(userId);
    if (user) {
      return `@${user.name || user.email}`;
    }
    
    return match;
  });
}

function formatContentForSubmit(content: string, mentionIds: string[], mentions?: User[]): string {
  if (!content || mentionIds.length === 0) {
    return content;
  }

  let formattedContent = content;

  
  const userMap = new Map<string, User>();
  if (mentions) {
    mentions.forEach((user) => {
      userMap.set(user.id, user);
    });
  }

  
  formattedContent = formattedContent.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, (_match, name, id) => {
    
    if (mentionIds.includes(id)) {
      return `@[${id}]`;
    }
    
    return `@${name}`;
  });

  
  formattedContent = formattedContent.replace(/@\[([a-f0-9-]{36})\]/gi, (match, userId) => {
    if (mentionIds.includes(userId)) {
      return `@[${userId}]`;
    }
    
    return match;
  });

  
  mentionIds.forEach((userId) => {
    const user = userMap.get(userId);
    if (!user) return;
    
    const userName = user.name || user.email;
    
    const escapedName = userName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`@${escapedName}(?!\\[)(?=\\s|$|[.,!?;:])`, 'g');
    formattedContent = formattedContent.replace(regex, `@[${userId}]`);
  });

  return formattedContent;
}

export default function CommentInput({ taskId, projectId: propProjectId, editingComment, onCancelEdit }: Props) {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const projectId = propProjectId || paramProjectId;
  const { authUser } = useAuth();
  const [content, setContent] = useState(editingComment?.content || '');
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | undefined>(editingComment?.fileUrl);
  const [uploading, setUploading] = useState(false);
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const { data: projectMembers = [] } = useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => projectMemberService.getProjectMebers(projectId!),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateCommentDto) => commentService.createComment(taskId, dto),
    onSuccess: () => {
      setContent('');
      setFile(null);
      setFileUrl(undefined);
      setMentionIds([]);
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      if (projectId) {
        invalidateStatisticsQueries(queryClient, projectId);
      }
      
      if (onCancelEdit) onCancelEdit();
    },
    onError: () => {
      message.error('Lỗi khi thêm bình luận');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (dto: CreateCommentDto) =>
      commentService.updateComment(taskId, editingComment!.id, dto),
    onSuccess: () => {
      setContent('');
      setFile(null);
      setFileUrl(undefined);
      setMentionIds([]);
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      if (projectId) {
        invalidateStatisticsQueries(queryClient, projectId);
      }
      
      if (onCancelEdit) onCancelEdit();
    },
    onError: () => {
      message.error('Lỗi khi cập nhật bình luận');
    },
  });

  
  useEffect(() => {
    if (editingComment) {
      
      const displayContent = parseContentForDisplay(editingComment.content || '', editingComment.mentions);
      setContent(displayContent);
      setFileUrl(editingComment.fileUrl);
      
      
      if (editingComment.mentions && editingComment.mentions.length > 0) {
        setMentionIds(editingComment.mentions.map((u) => u.id));
      } else {
        
        const mentionRegex = /@\[([a-f0-9-]{36})\]/gi;
        const matches = [...(editingComment.content || '').matchAll(mentionRegex)];
        const ids = matches.map((match) => match[1]);
        setMentionIds(ids);
      }
    } else {
      setContent('');
      setFileUrl(undefined);
      setMentionIds([]);
    }
  }, [editingComment?.id]);

  const handleFileChange = async (file: File) => {
    const isValidType = /\.(jpg|jpeg|png|pdf|docx|xlsx)$/i.test(file.name);
    const isValidSize = file.size <= 5 * 1024 * 1024;

    if (!isValidType) {
      message.error('Chỉ chấp nhận file: jpg, png, pdf, docx, xlsx');
      return false;
    }

    if (!isValidSize) {
      message.error('File không được vượt quá 5MB');
      return false;
    }

    setUploading(true);
    try {
      const result = await commentService.uploadFile(taskId, file);
      setFileUrl(result.fileUrl);
      setFile(file);
      
    } catch (error) {
      message.error('Lỗi khi tải file');
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleSubmit = async () => {
    if (!content.trim() && !fileUrl) {
      message.warning('Vui lòng nhập nội dung hoặc đính kèm file');
      return;
    }

    
    let mentions = editingComment?.mentions;
    if (!mentions && projectMembers.length > 0) {
      
      mentions = projectMembers
        .filter((pm) => mentionIds.includes(pm.user.id))
        .map((pm) => pm.user);
    }

    
    
    const formattedContent = formatContentForSubmit(
      content.trim(),
      mentionIds,
      mentions
    );

    const dto: CreateCommentDto = {
      content: formattedContent,
      fileUrl,
      mentionIds: mentionIds.length > 0 ? mentionIds : undefined,
    };

    if (editingComment) {
      updateMutation.mutate(dto);
    } else {
      createMutation.mutate(dto);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (!projectId) {
    return null;
  }

  return (
    <div>
      <MentionTextarea
        value={content}
        onChange={setContent}
        projectId={projectId}
        placeholder="Viết bình luận... (Gõ @ để mention thành viên)"
        autoSize={{ minRows: 2, maxRows: 6 }}
        onPressEnter={(e) => {
          if (e.shiftKey) return;
          e.preventDefault();
          handleSubmit();
        }}
        style={{ marginBottom: 8, borderRadius: 6 }}
        onMentionsChange={setMentionIds}
        currentUserId={authUser?.id}
      />

      {fileUrl && (
        <div
          style={{
            marginBottom: 8,
            padding: 8,
            background: '#f5f5f5',
            borderRadius: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12 }}>{file?.name || 'File đính kèm'}</span>
          <Button type="text" size="small" onClick={handleRemoveFile}>
            Xóa
          </Button>
        </div>
      )}

      <Space>
        <Upload
          beforeUpload={handleFileChange}
          showUploadList={false}
          accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx"
        >
          <Button
            icon={<PaperClipOutlined />}
            loading={uploading}
            disabled={isSubmitting}
          >
            Đính kèm
          </Button>
        </Upload>

        {editingComment && (
          <Button onClick={onCancelEdit} disabled={isSubmitting}>
            Hủy
          </Button>
        )}

        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!content.trim() && !fileUrl}
        >
          {editingComment ? 'Cập nhật' : 'Gửi'}
        </Button>
      </Space>
    </div>
  );
}

