import { Input, Button, Space, Upload, message } from 'antd';
import { PaperClipOutlined, SendOutlined } from '@ant-design/icons';
import { useState, useRef } from 'react';
import type { UploadFile } from 'antd';
import { commentService } from '@/services/comment.services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateCommentDto } from '@/types/comment.type';

const { TextArea } = Input;

interface Props {
  taskId: string;
  editingComment?: { id: string; content: string; fileUrl?: string } | null;
  onCancelEdit?: () => void;
}

export default function CommentInput({ taskId, editingComment, onCancelEdit }: Props) {
  const [content, setContent] = useState(editingComment?.content || '');
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | undefined>(editingComment?.fileUrl);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useMutation({
    mutationFn: (dto: CreateCommentDto) => commentService.createComment(taskId, dto),
    onSuccess: () => {
      setContent('');
      setFile(null);
      setFileUrl(undefined);
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      message.success('Đã thêm bình luận');
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
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      message.success('Đã cập nhật bình luận');
      if (onCancelEdit) onCancelEdit();
    },
    onError: () => {
      message.error('Lỗi khi cập nhật bình luận');
    },
  });

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
      message.success('Đã tải file lên');
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

    const dto: CreateCommentDto = {
      content: content.trim(),
      fileUrl,
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

  return (
    <div>
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết bình luận..."
        autoSize={{ minRows: 2, maxRows: 6 }}
        onPressEnter={(e) => {
          if (e.shiftKey) return;
          e.preventDefault();
          handleSubmit();
        }}
        style={{ marginBottom: 8, borderRadius: 6 }}
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

