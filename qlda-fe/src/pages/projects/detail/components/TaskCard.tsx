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
    mutationFn: (newStatus: 'todo' | 'done') =>
      taskService.updateStatus(task.id, newStatus),
    onSuccess: (response) => {
      console.log(response);
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
    <Card style={{ marginTop: task.status ? 12 : 8,justifyContent: "center" }}
      size="small"
      hoverable
     
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

      <div style={{marginTop:5, marginBottom:3}}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <CheckCircleFilled
            onClick={handleCheckboxChange}
            style={{
              fontSize: 18,
              cursor: "pointer",
              color: task.status === "done" ? "#52c41a" : "white",
              border: "1px solid #b2b2b2",
              borderRadius: "50%",
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
