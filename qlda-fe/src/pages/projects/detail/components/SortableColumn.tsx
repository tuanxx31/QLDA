import { Button, Card, message, Popconfirm, theme } from "antd";
import { DeleteOutlined, HolderOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Column } from "@/types/project-board";
import TaskList from "./TaskList";
import { useParams } from "react-router-dom";
import { columnService } from "@/services/column.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function SortableColumn({ column }: { column: Column }) {
  const { token } = theme.useToken();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column.id });

  const qc = useQueryClient();
  const { projectId } = useParams<{ projectId: string }>();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    minWidth: 300,
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
  };

  // Mutation xóa cột
  const removeMutation = useMutation({
    mutationFn: (id: string) => columnService.deleteColumn(id),
    onSuccess: () => {
      message.success("Đã xóa cột");
      qc.invalidateQueries({ queryKey: ["columns", projectId] });
    },
    onError: () => {
      message.error("Không thể xóa cột");
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      bodyStyle={{ padding: 8 }}
      title={
        <div
          {...attributes}
          {...listeners}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "grab",
            userSelect: "none",
          }}
        >
          <HolderOutlined style={{ color: "#999" }} />
          {column.name}
        </div>
      }
      extra={
        <Popconfirm
          title="Xóa cột này?"
          onConfirm={() => removeMutation.mutate(column.id)}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      }
    >
      <TaskList column={column} />
    </Card>
  );
}
