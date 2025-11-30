import { Card, Avatar, Tooltip, theme, Badge } from 'antd';
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CheckSquareOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import type { Task } from '@/types/task.type';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { taskService } from '@/services/task.services';
import { commentService } from '@/services/comment.services';
import { message } from 'antd';
import { useParams } from 'react-router-dom';
import { invalidateProgressQueries } from '@/utils/invalidateProgress';
import { invalidateStatisticsQueries } from '@/utils/invalidateStatistics';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { getUnreadCount } from '@/utils/commentBadgeUtils';
import useAuth from '@/hooks/useAuth';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { useTaskReadStatus } from '@/hooks/useTaskReadStatus';

interface Props {
  task: Task;
}

export default function TaskCard({ task }: Props) {
  const queryClient = useQueryClient();
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = theme.useToken();
  const { authUser } = useAuth();

  
  const { updateKey } = useTaskReadStatus(task.id, authUser?.id);

  
  const { data: commentsData } = useQuery({
    queryKey: ['comments', task.id],
    queryFn: () => commentService.getComments(task.id, 1, 50),
    staleTime: 0, 
    refetchOnWindowFocus: true,
    refetchOnMount: true, 
  });

  
  const totalCommentsCount = useMemo(() => {
    return commentsData?.data?.length || 0;
  }, [commentsData?.data]);

  
  
  const unreadCount = useMemo(() => {
    if (!authUser?.id || !commentsData?.data || commentsData.data.length === 0) return 0;
    const count = getUnreadCount(task.id, authUser.id, commentsData.data);
    return count > 0 ? count : 0;
  }, [task.id, authUser?.id, commentsData?.data, updateKey]);

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: 'todo' | 'done') => taskService.updateStatus(task.id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      if (projectId) {
        invalidateProgressQueries(queryClient, projectId);
        invalidateStatisticsQueries(queryClient, projectId);
      }
    },
    onError: () => {
      message.error('Không thể cập nhật trạng thái');
    },
  });

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();

    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateStatusMutation.mutate(newStatus);
  };

  const dueDateInfo = useMemo(() => {
    if (!task.dueDate) return null;
    const dueDate = dayjs(task.dueDate);
    const now = dayjs();
    const isOverdue = dueDate.isBefore(now);
    const isCompletedLate = task.status === 'done' && isOverdue;
    const isOverdueNotDone = isOverdue && task.status !== 'done';
    const isCompleted = task.status === 'done' && !isOverdue;

    return {
      displayText: dueDate.format('DD/MM/YYYY HH:mm'),
      isOverdue,
      isCompletedLate,
      isOverdueNotDone,
      isCompleted,
      fullDate: dueDate.format('DD/MM/YYYY HH:mm'),
    };
  }, [task.dueDate, task.status]);

  const subtasksProgress = useMemo(() => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(st => st.completed).length;
    const total = task.subtasks.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  }, [task.subtasks]);

  const descriptionPreview = task.description
    ? task.description.length > 80
      ? task.description.substring(0, 80) + '...'
      : task.description
    : null;

  return (
    <Card
      style={{
        marginTop: 8,
        borderRadius: token.borderRadius,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadowTertiary,
        backgroundColor: token.colorBgContainer,
        position: 'relative',
      }}
      size="small"
      hoverable
      bodyStyle={{ padding: 10 }}
    >
      {}
      {totalCommentsCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {}
          {unreadCount > 0 ? (
            <Badge
              count={unreadCount}
              overflowCount={99}
              style={{
                backgroundColor: '#ff4d4f',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <CommentOutlined
                style={{
                  fontSize: 16,
                  color: token.colorTextSecondary,
                  backgroundColor: token.colorBgContainer,
                  padding: 4,
                  borderRadius: 4,
                }}
              />
            </Badge>
          ) : (
            
            <Tooltip title={`${totalCommentsCount} bình luận`}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 6px',
                  backgroundColor: token.colorFillTertiary,
                  borderRadius: 4,
                  fontSize: 12,
                  color: token.colorTextSecondary,
                }}
              >
                <CommentOutlined style={{ fontSize: 14 }} />
                <span>{totalCommentsCount}</span>
              </div>
            </Tooltip>
          )}
        </div>
      )}

      {}
      {task.labels && task.labels.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            marginBottom: 8,
            minHeight: 8,
          }}
        >
          {task.labels.map(label => (
            <Tooltip key={label.id} title={label.name}>
              <div
                style={{
                  backgroundColor: label.color,
                  height: 8,
                  borderRadius: 4,
                  minWidth: 40,
                  flex: '0 0 auto',
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
          ))}
        </div>
      )}

      {}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <CheckCircleFilled
          onClick={handleCheckboxChange}
          style={{
            fontSize: 18,
            cursor: 'pointer',
            color: task.status === 'done' ? '#52c41a' : 'white',
            border: `1px solid ${token.colorBorder}`,
            borderRadius: '50%',
            transition: 'color 0.2s',
            marginTop: 2,
            flexShrink: 0,
          }}
        />

        <div
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 500,
            lineHeight: '20px',
            color: task.status === 'done' ? token.colorTextTertiary : token.colorText,

            wordBreak: 'break-word',
          }}
        >
          {task.title}
        </div>
      </div>

      {}
      {descriptionPreview && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: token.colorTextTertiary,
            lineHeight: '16px',
            wordBreak: 'break-word',
          }}
        >
          {descriptionPreview}
        </div>
      )}

      {}
      {(dueDateInfo || subtasksProgress || (task.assignees && task.assignees.length > 0)) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 8,
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          {}
          {dueDateInfo && (
            <Tooltip
              title={`Hạn chót: ${dueDateInfo.fullDate}${
                dueDateInfo.isCompletedLate
                  ? ' (Hoàn thành trễ)'
                  : dueDateInfo.isCompleted
                    ? ' (Hoàn thành)'
                    : dueDateInfo.isOverdueNotDone
                      ? ' (Quá hạn)'
                      : ''
              }`}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 6px',
                  borderRadius: 4,
                  backgroundColor: dueDateInfo.isCompletedLate
                    ? '#fff7e6'
                    : dueDateInfo.isCompleted
                      ? '#f6ffed'
                      : dueDateInfo.isOverdueNotDone
                        ? '#fff1f0'
                        : 'transparent',
                  fontSize: 12,
                  fontWeight:
                    dueDateInfo.isCompletedLate ||
                    dueDateInfo.isCompleted ||
                    dueDateInfo.isOverdueNotDone
                      ? 500
                      : 400,
                  color: dueDateInfo.isCompletedLate
                    ? '#fa8c16'
                    : dueDateInfo.isCompleted
                      ? '#52c41a'
                      : dueDateInfo.isOverdueNotDone
                        ? '#ff4d4f'
                        : token.colorTextTertiary,
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 12 }} />
                <span>{dueDateInfo.displayText}</span>
                {dueDateInfo.isCompletedLate && (
                  <span style={{ marginLeft: 4, fontSize: 11 }}>(Hoàn thành trễ)</span>
                )}
                {dueDateInfo.isCompleted && (
                  <span style={{ marginLeft: 4, fontSize: 11 }}>(Hoàn thành)</span>
                )}
                {dueDateInfo.isOverdueNotDone && (
                  <span style={{ marginLeft: 4, fontSize: 11 }}>(Quá hạn)</span>
                )}
              </div>
            </Tooltip>
          )}

          {}
          {/* {subtasksProgress && (
            <Tooltip title={`${subtasksProgress.completed}/${subtasksProgress.total} hoàn thành`}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: token.colorTextTertiary,
                }}
              >
                <CheckSquareOutlined style={{ fontSize: 12 }} />
                <span>
                  {subtasksProgress.completed}/{subtasksProgress.total}
                </span>
              </div>
            </Tooltip>
          )} */}

          {}
          <div style={{ flex: 1 }} />

          {}
          {task.assignees && task.assignees.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {task.assignees.slice(0, 3).map(u => (
                <Tooltip key={u.id} title={u.name || u.email}>
                  <Avatar src={getAvatarUrl(u?.avatar)} size="small" />
                </Tooltip>
              ))}
              {task.assignees.length > 3 && (
                <Tooltip title={`+${task.assignees.length - 3} người khác`}>
                  <Avatar
                    size={24}
                    style={{
                      border: `1px solid ${token.colorBorder}`,
                      backgroundColor: token.colorFillTertiary,
                      color: token.colorTextTertiary,
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    +{task.assignees.length - 3}
                  </Avatar>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
