import { Button, Card, theme } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column } from '@/types/project-board';
import TaskList from './TaskList';

export default function SortableColumn({ column }: { column: Column }) {
  const { token } = theme.useToken();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: column.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    minWidth: 300,
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
  };

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      title={column.name}
      style={style}
      bodyStyle={{ padding: 8 }}
      extra={<Button type="text" size="small" icon={<DeleteOutlined />} danger />}
    >
      <TaskList column={column} />
    </Card>
  );
}
