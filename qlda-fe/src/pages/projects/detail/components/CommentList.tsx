import { Avatar, Space, Typography, Button, Popconfirm, Image, message, Input, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, DownloadOutlined, CheckOutlined, CloseOutlined, PaperClipOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useState, useEffect } from 'react';
import type { Comment } from '@/types/comment.type';
import { parseMentions } from '@/utils/mentionParser';
import { commentService } from '@/services/comment.services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  taskId: string;
  comments: Comment[];
  onEdit?: (comment: Comment) => void;
  projectOwnerId?: string;
}

export default function CommentList({ taskId, comments, onEdit, projectOwnerId }: Props) {
  const queryClient = useQueryClient();
  const { authUser } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [editingFileUrl, setEditingFileUrl] = useState<string | undefined>();
  const [uploadingFile, setUploadingFile] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      message.success('Đã xóa bình luận');
    },
    onError: () => {
      message.error('Lỗi khi xóa bình luận');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (dto: { content: string; fileUrl?: string }) =>
      commentService.updateComment(taskId, editingId!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      message.success('Đã cập nhật bình luận');
      setEditingId(null);
      setEditingContent('');
      setEditingFileUrl(undefined);
    },
    onError: () => {
      message.error('Lỗi khi cập nhật bình luận');
    },
  });

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content);
    setEditingFileUrl(comment.fileUrl);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
    setEditingFileUrl(undefined);
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim() && !editingFileUrl) {
      message.warning('Vui lòng nhập nội dung hoặc đính kèm file');
      return;
    }
    updateMutation.mutate({
      content: editingContent.trim(),
      fileUrl: editingFileUrl,
    });
  };

  const handleFileUpload = async (file: File) => {
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

    setUploadingFile(true);
    try {
      const result = await commentService.uploadFile(taskId, file);
      setEditingFileUrl(result.fileUrl);
      message.success('Đã tải file lên');
    } catch (error) {
      message.error('Lỗi khi tải file');
    } finally {
      setUploadingFile(false);
    }

    return false;
  };

  const isImageFile = (url?: string) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const isDocumentFile = (url?: string) => {
    if (!url) return false;
    return /\.(pdf|docx|xlsx)$/i.test(url);
  };

  const getFileUrl = (fileUrl?: string) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    return fileUrl.startsWith('/') ? `${API_BASE}${fileUrl}` : `${API_BASE}/${fileUrl}`;
  };

  if (comments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
        Chưa có bình luận nào
      </div>
    );
  }

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {comments.map((comment) => {
          const isOwner = authUser?.id === comment.userId;
          const canDelete = isOwner || authUser?.id === projectOwnerId;
          const isEditing = editingId === comment.id;

          return (
            <div
              key={comment.id}
              style={{
                display: 'flex',
                gap: 12,
                padding: '8px 0',
              }}
            >
              <Avatar
                src={comment.user?.avatar}
                size={32}
                style={{ flexShrink: 0 }}
              >
                {(comment.user?.name || comment.user?.email)?.[0]?.toUpperCase()}
              </Avatar>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 13 }}>
                    {comment.user?.name || comment.user?.email}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                    {dayjs(comment.createdAt).locale('vi').fromNow()}
                    {comment.updatedAt !== comment.createdAt && ' (đã chỉnh sửa)'}
                  </Text>
                </div>

                {isEditing ? (
                  <div style={{ marginBottom: 8 }}>
                    <TextArea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      autoSize={{ minRows: 2, maxRows: 6 }}
                      style={{ marginBottom: 8, borderRadius: 6 }}
                    />
                    {editingFileUrl && (
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
                        <span style={{ fontSize: 12 }}>File đính kèm</span>
                        <Button
                          type="text"
                          size="small"
                          onClick={() => setEditingFileUrl(undefined)}
                        >
                          Xóa
                        </Button>
                      </div>
                    )}
                    <Space>
                      <Upload
                        beforeUpload={handleFileUpload}
                        showUploadList={false}
                        accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx"
                      >
                        <Button
                          icon={<PaperClipOutlined />}
                          size="small"
                          loading={uploadingFile}
                          disabled={updateMutation.isPending}
                        >
                          Đính kèm
                        </Button>
                      </Upload>
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={handleSaveEdit}
                        loading={updateMutation.isPending}
                      >
                        Lưu
                      </Button>
                      <Button
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={handleCancelEdit}
                        disabled={updateMutation.isPending}
                      >
                        Hủy
                      </Button>
                    </Space>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>
                      {parseMentions(comment.content)}
                    </div>

                    {comment.fileUrl && (
                      <div style={{ marginTop: 8, marginBottom: 8 }}>
                        {isImageFile(comment.fileUrl) ? (
                          <Image
                            src={getFileUrl(comment.fileUrl)}
                            alt="Attachment"
                            width={200}
                            style={{ borderRadius: 6 }}
                            preview
                          />
                        ) : isDocumentFile(comment.fileUrl) ? (
                          <a
                            href={getFileUrl(comment.fileUrl)}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <DownloadOutlined />
                            <span>Tải file đính kèm</span>
                          </a>
                        ) : (
                          <a
                            href={getFileUrl(comment.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Xem file đính kèm
                          </a>
                        )}
                      </div>
                    )}
                  </>
                )}

                {!isEditing && (isOwner || canDelete) && (
                  <Space size="small" style={{ marginTop: 4 }}>
                    {isOwner && (
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleStartEdit(comment)}
                        style={{ fontSize: 12, padding: 0 }}
                      >
                        Sửa
                      </Button>
                    )}
                    {canDelete && (
                      <Popconfirm
                        title="Xóa bình luận?"
                        onConfirm={() => deleteMutation.mutate(comment.id)}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          loading={deleteMutation.isPending}
                          style={{ fontSize: 12, padding: 0 }}
                        >
                          Xóa
                        </Button>
                      </Popconfirm>
                    )}
                  </Space>
                )}
              </div>
            </div>
          );
        })}
      </Space>
    </div>
  );
}
