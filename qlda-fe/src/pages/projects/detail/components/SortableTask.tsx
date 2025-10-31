import { Card, Typography, theme } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types/project-board';

const { Text } = Typography;


export default function SortableTask({ task }: { task: Task }) {
  const { token } = theme.useToken();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderRadius: token.borderRadius,
    boxShadow: token.boxShadowSecondary,
    background: token.colorBgElevated,
  };

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      size="small"
      hoverable
      style={style}
    >
      <Typography.Text strong>{task.title}</Typography.Text>
      <br />
      <Text type="secondary" ellipsis>
        {task.description || "Không có mô tả"}
      </Text>
    </Card>
  );
}