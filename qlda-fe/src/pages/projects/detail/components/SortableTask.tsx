import { Card, theme } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import type { Task } from '@/types/task.type';

export default function SortableTask({ task, onClick }: { task: Task; onClick?: (task: Task) => void }) {
  const { token } = theme.useToken();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: {
        type: "task",
        taskId: task.id,
        columnId: task.columnId,
      }
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderRadius: token.borderRadius,
    background: token.colorBgElevated,
    boxShadow: token.boxShadowSecondary,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={() => onClick?.(task)}
    >
      <TaskCard task={task} onDoubleClick={onClick} />
    </div>
  );
}
