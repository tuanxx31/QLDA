import { Modal, Typography, Tag, Avatar, Divider, Space, Tooltip, Button } from 'antd';
import { ClockCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Task } from '@/types/project-board';

const { Title, Text, Paragraph } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export default function TaskDetailModal({ open, onClose, task, onEdit, onDelete }: Props) {
  if (!task) return null;

  const renderLabels = () => {
    if (!task.labels) return null;
    return task.labels.map(label => (
      <Tag key={label.id} color={label.color} style={{ marginBottom: 4 }}>
        {label.name}
      </Tag>
    ));
  }

  const renderAssignees = () => {
    if (!task.assignees) return null;
    return task.assignees.map(u => (
      <Avatar key={u.id} src={u.avatar}>
        {u.name?.[0]}
      </Avatar>
    ));
  }

  const renderSubtasks = () => {
    if (!task.subtasks) return null;
    return task.subtasks.map(subtask => (
      <div key={subtask.id}>{subtask.title}</div>
    ));
  } 

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      title={
        <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
          <Title level={5} style={{ margin: 0 }}>
            {task.title}
          </Title>
          <Space>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit?.(task)}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => onDelete?.(task)}
              />
            </Tooltip>
          </Space>
        </Space>
      }
    >
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary">Mô tả:</Text>
        <Paragraph>{task.description || 'Không có mô tả.'}</Paragraph>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">Trạng thái:</Text>{' '}
        <Tag color={task.status === 'done' ? 'green' : task.status === 'doing' ? 'blue' : 'default'}>
          {task.status === 'todo'
            ? 'Chưa làm'
            : task.status === 'doing'
            ? 'Đang làm'
            : 'Hoàn thành'}
        </Tag>
      </div>

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">Mức ưu tiên:</Text>{' '}
        <Tag
          color={
            task.priority === 'high'
              ? 'red'
              : task.priority === 'medium'
              ? 'blue'
              : 'default'
          }
        >
          {task.priority === 'high'
            ? 'Cao'
            : task.priority === 'medium'
            ? 'Trung bình'
            : 'Thấp'}
        </Tag>
      </div>

      {task.dueDate && (
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary">Hạn chót:</Text>{' '}
          <Tooltip title={dayjs(task.dueDate).format('HH:mm DD/MM/YYYY')}>
            <Text>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {dayjs(task.dueDate).format('DD/MM/YYYY')}
            </Text>
          </Tooltip>
        </div>
      )}

      {renderLabels()}

      {renderAssignees()}

      {renderSubtasks()}
    </Modal>
  );
}
