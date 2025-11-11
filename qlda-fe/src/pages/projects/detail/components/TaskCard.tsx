import { Card, Tooltip, Avatar, Badge } from "antd";
import {
  BellOutlined,
  EyeOutlined,
  UnorderedListOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { Task } from "@/types/task.type";
import { useState } from "react";

interface Props {
  task: Task;
  onDoubleClick?: (task: Task) => void;
  onClick?: (task: Task) => void;
}

export default function TaskCard({ task, onDoubleClick, onClick }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      size="small"
      hoverable
      style={{
        marginBottom: 8,
        borderRadius: 8,
        background: "#fff",
        color: "#333",
        position: "relative",
        boxShadow: hovered
          ? "0 2px 8px rgba(0,0,0,0.15)"
          : "0 1px 3px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      bodyStyle={{ padding: 10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={() => onDoubleClick?.(task)}
      onClick={() => onClick?.(task)}
    >
      {task.status === 'todo' && (
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 8,
            width: 24,
            height: 4,
            borderRadius: 4,
            backgroundColor: task.status,
          }}
        />
      )}

      <div style={{ marginTop: task.status ? 12 : 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          {hovered && (
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: "2px solid #999",
                marginTop: 4,
              }}
            />
          )}

          <div
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: 500,
              lineHeight: "18px",
            }}
          >
            {task.title}
          </div>

         
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 6,
            gap: 6,
          }}
        >
          

          <Tooltip title="Xem chi tiết">
            <EyeOutlined style={{ color: "#999" }} />
          </Tooltip>

          <Tooltip title="Danh sách con">
            <UnorderedListOutlined style={{ color: "#999" }} />
          </Tooltip>

          <div style={{ flex: 1 }} />

          {task.assignees?.map((u) => (
            <Avatar
              key={u.id}
              size={24}
              src={u.avatar}
              style={{
                border: "1px solid #eee",
                backgroundColor: "#f5f5f5",
              }}
            >
              {u.name?.[0]}
            </Avatar>
          ))}
        </div>
      </div>
    </Card>
  );
}
