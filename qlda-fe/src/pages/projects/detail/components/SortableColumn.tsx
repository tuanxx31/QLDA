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
  Typography,
  type InputRef,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Column } from "@/types/project-board";
import TaskList from "./TaskList";
import { useParams } from "react-router-dom";
import { columnService } from "@/services/column.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDroppable } from "@dnd-kit/core";

const { Text } = Typography;

export default function SortableColumn({ column, isOverlay }: { column: Column, isOverlay?: boolean }) {

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  const { token } = theme.useToken();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: column.id ,disabled: isOverlay});

  const qc = useQueryClient();
  const { projectId } = useParams<{ projectId: string }>();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(column.name);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const removeMutation = useMutation({
    mutationFn: () => columnService.deleteColumn(projectId!, column.id),
    onSuccess: () => {
      message.success("Đã xóa cột");
      qc.invalidateQueries({ queryKey: ["columns", projectId] });
    },
    onError: () => message.error("Không thể xóa cột"),
  });

  const updateMutation = useMutation({
    mutationFn: (name: string) =>
      columnService.update(projectId!, column.id, { name }),
    onSuccess: () => {
      message.success("Đã cập nhật tên cột");
      qc.invalidateQueries({ queryKey: ["columns", projectId] });
      setIsEditing(false);
    },
    onError: () => message.error("Không thể cập nhật tên cột"),
  });

  const handleSave = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      message.warning("Tên cột không được để trống");
      setNewName(column.name);
      setIsEditing(false);
      return;
    }
    if (trimmed !== column.name) updateMutation.mutate(trimmed);
    else setIsEditing(false);
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging
      ? "none"
      : "transform 0.25s ease, box-shadow 0.2s ease, border 0.2s ease",
    minWidth: 300,
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: isDragging ? token.boxShadowSecondary : token.boxShadowTertiary,
    border: isDragging
      ? `1px solid ${token.colorPrimaryBorder}`
      : `1px solid ${token.colorBorderSecondary}`,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      bodyStyle={{
        padding: 8,
        maxHeight: "75vh",
        overflowY: "auto",
      }}
      title={
        <div
          {...(!isEditing ? attributes : {})}
          {...(!isEditing ? listeners : {})}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: isEditing ? "text" : "grab",
            userSelect: "none",
          }}
        >
          {isEditing ? (
            <Space align="center">
              <Input
                ref={inputRef}
                size="small"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onPressEnter={handleSave}
                onBlur={handleSave}
                disabled={updateMutation.isPending}
                style={{
                  width: 180,
                  borderRadius: token.borderRadiusSM,
                }}
              />
              {updateMutation.isPending && <Spin size="small" />}
            </Space>
          ) : (
            <Text
              strong
              style={{
                fontSize: 15,
                color: token.colorTextHeading,
              }}
            >
              {column.name}
            </Text>
          )}
        </div>
      }
      extra={
        <Space size="small">
          {!isEditing && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
              style={{
                color: token.colorTextSecondary,
              }}
            />
          )}
          <Popconfirm
            title="Xóa cột này?"
            onConfirm={() => removeMutation.mutate()}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={removeMutation.isPending}
            />
          </Popconfirm>
        </Space>
      }
    >
       <div ref={setDropRef}>
        <TaskList column={column} />
      </div>
    </Card>
  );
}
