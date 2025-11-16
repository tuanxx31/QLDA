import { Card, Avatar } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import type { Task } from "@/types/task.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/task.services";
import { message } from "antd";

interface Props {
  task: Task;
  onDoubleClick?: (task: Task) => void;
  onClick?: (task: Task) => void;
}

export default function TaskCard({ task, onDoubleClick, onClick }: Props) {
  const queryClient = useQueryClient();

  // Mutation để update status
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: 'todo' | 'doing' | 'done') =>
      taskService.update(task.id, {
        status: newStatus,
        completedAt: newStatus === "done" ? new Date().toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["columns"] });
    },
    onError: () => {
      message.error("Không thể cập nhật trạng thái");
    },
  });

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle: nếu đang "done" thì về "todo", ngược lại thì thành "done"
    const newStatus = task.status === "done" ? "todo" : "done";
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <Card
      size="small"
      hoverable
      // style={{
      //   // marginBottom: 8,
      //   // borderRadius: 8,
      //   // background: "#fff",
      //   // color: "#333",
      //   position: "relative",
      //   cursor: "pointer",
      //   transition: "all 0.2s ease",
      // }}
      bodyStyle={{ padding: 10 }}
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
          {/* CHECKBOX */}
          <CheckCircleFilled
            onClick={handleCheckboxChange}
            style={{
              fontSize: 18,
              cursor: "pointer",
              color: task.status === "done" ? "#52c41a" : "rgba(0,0,0,0.3)",
              transition: "color 0.2s",
              marginTop: 2,
              flexShrink: 0,
            }}
          />

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
          

          {/* <Tooltip title="Xem chi tiết">
            <EyeOutlined style={{ color: "#999" }} />
          </Tooltip>

          <Tooltip title="Danh sách con">
            <UnorderedListOutlined style={{ color: "#999" }} />
          </Tooltip> */}

          <div style={{ flex: 1 }} />

          {task.assignees?.map((u) => (
            <Avatar
              key={u.id}
              size={24}
              style={{
                border: "1px solid #eee",
                backgroundColor: "#1677ff",
                color: "#fff",
              }}
            >
              {(u.name || u.email)?.[0]?.toUpperCase()}
            </Avatar>
          ))}
        </div>
      </div>
    </Card>
  );
}
