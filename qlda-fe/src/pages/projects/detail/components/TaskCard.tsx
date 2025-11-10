import { Card, Tag, Tooltip, Avatar } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Task } from "@/types/task.type";

interface Props {
  task: Task;
  onClick?: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: Props) {

    const renderLabels = () => {
        if (!task.labels) return null;
        return task.labels.map(label => (
            <Tag key={label.id} color={label.color} style={{ marginBottom: 4 }}>
                {label.name}
            </Tag>
        ));
    }

    const renderAssignees = () => {
        if (!task.assignees) return null;
        return task.assignees.map(u => (
            <Avatar key={u.id} src={u.avatar}>
                {u.name?.[0]}
            </Avatar>
        ));
    }
  return (
    <Card
      size="small"
      hoverable
      style={{ marginBottom: 8 }}
      onClick={() => onClick?.(task)}
      bodyStyle={{ padding: 8 }}
    >
      <div className="font-medium" style={{ marginBottom: 4 }}>
        {task.title}
      </div>

      {renderLabels()}

      {/* Thông tin phụ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {task.dueDate && (
          <Tooltip title="Hạn chót">
            <span style={{ fontSize: 12, color: "#888" }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {dayjs(task.dueDate).format("DD/MM")}
            </span>
          </Tooltip>
        )}

        {renderAssignees()}
      </div>
    </Card>
  );
}
