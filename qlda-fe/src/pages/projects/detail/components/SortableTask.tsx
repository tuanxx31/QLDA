
import React from 'react';
import { Card, theme } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined } from '@ant-design/icons';
import TaskCard from './TaskCard';
import type { Task } from '@/types/task.type';

interface SortableTaskProps {
  task: Task;
  onClick?: (taskId: string) => void;
}

const SortableTask: React.FC<SortableTaskProps> = ({ task, onClick }) => {
  const { token } = theme.useToken();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      taskId: task.id,
      columnId: task.columnId,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    borderRadius: token.borderRadius,
    background: token.colorBgElevated,
    boxShadow: isDragging ? token.boxShadowSecondary : token.boxShadowTertiary,
    cursor: 'default',
  };

  const handleDragHandleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const currentTaskId = task.id;
    console.log('task.id in SortableTask', currentTaskId);
    onClick?.(currentTaskId);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        bordered={false}
        bodyStyle={{ padding: 8 }}
        onClick={handleCardClick}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <TaskCard task={task} />
          </div>

          <div
            {...attributes}
            {...listeners}
            onClick={handleDragHandleClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              cursor: 'grab',
              borderRadius: 4,
              color: token.colorTextTertiary,
              flexShrink: 0,
            }}
          >
            <HolderOutlined />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SortableTask;
