import { useState, useRef, useEffect } from "react";
import {
  Button,
  Card,
  Input,
  message,
  Popconfirm,
  Space,
  Spin,
  theme,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Column } from "@/types/project-board";
import TaskList from "./TaskList";
import { useParams } from "react-router-dom";
import { columnService } from "@/services/column.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function SortableColumn({ column }: { column: Column }) {
  const { token } = theme.useToken();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: column.id,
  });

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

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(column.name);
  const inputRef = useRef<typeof Input | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) (inputRef.current as any).focus();
  }, [isEditing]);

  const removeMutation = useMutation({
    mutationFn: () => columnService.deleteColumn(projectId!, column.id),
    onSuccess: () => {
      message.success("Đã xóa cột");
      qc.invalidateQueries({ queryKey: ["columns", projectId] });
    },
    onError: () => {
      message.error("Không thể xóa cột");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (name: string) =>
      columnService.update(projectId!, column.id, { name }),
    onSuccess: () => {
      message.success("Đã cập nhật tên cột");
      qc.invalidateQueries({ queryKey: ["columns", projectId] });
      setIsEditing(false);
    },
    onError: () => {
      message.error("Không thể cập nhật tên cột");
    },
  });

  const handleSave = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      message.warning("Tên cột không được để trống");
      setNewName(column.name);
      setIsEditing(false);
      return;
    }
    if (trimmed !== column.name) {
      updateMutation.mutate(trimmed);
    } else {
      setIsEditing(false);
    }
  };

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
            cursor: isEditing ? "text" : "grab",
            userSelect: "none",
          }}
        >
          {isEditing ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Input
                ref={inputRef as any}
                size="small"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onPressEnter={handleSave}
                onBlur={handleSave}
                disabled={updateMutation.isPending}
                style={{ width: 180 }}
              />
              {updateMutation.isPending && <Spin size="small" />}
            </div>
          ) : (
            column.name
          )}
        </div>
      }
      extra={
        <Space>
          {!isEditing && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            />
          )}
          <Popconfirm
            title="Xóa cột này?"
            onConfirm={() => removeMutation.mutate()}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      }
    >
      <TaskList column={column} />
    </Card>
  );
}
