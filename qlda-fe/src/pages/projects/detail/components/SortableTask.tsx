
import React from 'react';
import { Card, theme } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined } from '@ant-design/icons';
import TaskCard from './TaskCard';
import type { Task } from '@/types/task.type';

interface SortableTaskProps {
  task: Task;
  onClick?: (task: Task) => void;
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

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        bordered={false}
        bodyStyle={{ padding: 8 }}
        onClick={() => onClick?.(task)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          {}
          <div style={{ flex: 1 }}>
            <TaskCard task={task} onDoubleClick={onClick} />
          </div>

          {}
          <div
            {...attributes}
            {...listeners}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              cursor: 'grab',
              borderRadius: 4,
              color: token.colorTextTertiary,
            }}
          >
            <HolderOutlined />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default React.memo(SortableTask);
