import { useState, useRef, useEffect } from 'react';
import {
  Button,
  Card,
  Input,
  message,
  Popconfirm,
  Space,
  Spin,
  Typography,
  theme,
  type InputRef,
} from 'antd';
import { DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column } from '@/types/project-board';
import TaskList from './TaskList';
import { useParams } from 'react-router-dom';
import { columnService } from '@/services/column.services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AddTaskCard from './AddTaskCard';
import { taskService } from '@/services/task.services';

const { Text } = Typography;

export default function SortableColumn({
  column,
  isOverlay,
}: {
  column: Column;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    disabled: isOverlay,
    data: { type: 'column', columnId: column.id },
  });

  const { token } = theme.useToken();
  const qc = useQueryClient();
  const { projectId } = useParams<{ projectId: string }>();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(column.name);
  const inputRef = useRef<InputRef>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const removeMutation = useMutation({
    mutationFn: () => columnService.deleteColumn(projectId!, column.id),
    onSuccess: () => {
      message.success('Đã xóa cột');
      qc.invalidateQueries({ queryKey: ['columns', projectId] });
    },
    onError: () => message.error('Không thể xóa cột'),
  });

  const updateMutation = useMutation({
    mutationFn: (name: string) => columnService.update(projectId!, column.id, { name }),
    onSuccess: () => {
      message.success('Đã cập nhật tên cột');
      qc.invalidateQueries({ queryKey: ['columns', projectId] });
      setIsEditing(false);
    },
    onError: () => message.error('Không thể cập nhật tên cột'),
  });

  const addTaskMutation = useMutation({
    mutationFn: (title: string) => taskService.create(column.id, title),
    onSuccess: async () => {
      message.success('Đã thêm thẻ');
      setIsAdding(false);
      setNewTitle('');
      await qc.invalidateQueries({ queryKey: ['columns', projectId] });
    },
    onError: () => message.error('Không thể thêm thẻ'),
  });

  const handleAddTask = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) {
      return message.warning('Tên thẻ không được để trống');
    }
    addTaskMutation.mutate(trimmed);
  };

  const handleSave = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      message.warning('Tên cột không được để trống');
      setNewName(column.name);
      setIsEditing(false);
      return;
    }
    if (trimmed !== column.name) updateMutation.mutate(trimmed);
    else setIsEditing(false);
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : (transition ?? 'transform 0.2s ease'),
    minWidth: 300,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
      }}
    >
      <Card
        {...(!isOverlay ? attributes : {})}
        bodyStyle={{
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isEditing ? (
                <Space align="center">
                  <Input
                    ref={inputRef}
                    size="small"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onPressEnter={handleSave}
                    onBlur={handleSave}
                    disabled={updateMutation.isPending}
                    style={{ width: 180 }}
                  />
                  {updateMutation.isPending && <Spin size="small" />}
                </Space>
              ) : (
                <Text strong style={{ fontSize: 15 }}>
                  {column.name}
                </Text>
              )}
            </div>

            <Space size="small">
              {!isEditing && (
                <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditing(true)} />
              )}

              <Popconfirm
                title="Xóa cột này?"
                onConfirm={() => removeMutation.mutate()}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  loading={removeMutation.isPending}
                />
              </Popconfirm>
              { !isEditing && (
                <Button
                  type="text"
                  icon={<HolderOutlined />}
                  {...listeners}
                  style={{ cursor: 'grab' }}
                />
              )}
            </Space>
          </div>
        }
      >
        <div
          className="column-scroll-container"
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: 8,
            minHeight: 0,
            maxHeight: 'calc(100vh - 320px)',
          }}
        >
          <TaskList column={column} />
        </div>
        <div
          style={{
            padding: '0 8px 8px 8px',
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            backgroundColor: token.colorBgContainer,
          }}
        >
          <AddTaskCard
            isAdding={isAdding}
            setIsAdding={setIsAdding}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            onAdd={handleAddTask}
            loading={addTaskMutation.isPending}
          />
        </div>
      </Card>
    </div>
  );
}
