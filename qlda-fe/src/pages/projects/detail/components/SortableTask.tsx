import { Card, theme } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import type { Task } from '@/types/task.type';

export default function SortableTask({ task, onClick }: { task: Task; onClick?: (task: Task) => void }) {
  const { token } = theme.useToken();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id ,data:{type: "task", taskId: task.id ,columnId: task.columnId, title : task.title}});

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderRadius: token.borderRadius,
    boxShadow: token.boxShadowSecondary,
    background: token.colorBgElevated,
    cursor: 'pointer',
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
