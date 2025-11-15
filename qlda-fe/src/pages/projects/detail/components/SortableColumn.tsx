import { Card, theme } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from "@dnd-kit/core";
import { CSS } from '@dnd-kit/utilities';
import TaskList from './TaskList';
import type { Column } from '@/types/project-board';

export default function SortableColumn({ column, isOverlay }: { column: Column, isOverlay?: boolean }) {
  const { setNodeRef: setDropRef } = useDroppable({
    id: column.id,
    data: { type: 'column' },
  });

  const { token } = theme.useToken();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: column.id,
      disabled: isOverlay,
      data: { type: 'column' },
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    background: token.colorBgContainer,
    minWidth: 300,
    borderRadius: token.borderRadius,
    border: isDragging ? `1px solid ${token.colorPrimary}` : `1px solid ${token.colorBorder}`,
    boxShadow: token.boxShadowSecondary,
  };

  return (
    <Card ref={setNodeRef} style={style}
      title={
        <div {...attributes} {...listeners} style={{ cursor: "grab" }}>
          {column.name}
        </div>
      }
      bodyStyle={{ padding: 8, maxHeight: "75vh", overflowY: "auto" }}
    >
      <div ref={setDropRef}>
        <TaskList column={column} />
      </div>
    </Card>
  );
}
