import { Card, Button, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { taskService } from "@/services/task.services";
import TaskCard from "./TaskCard";
import type { Task } from "@/types/project-board";

export default function ColumnCard({ column }: { column: any }) {
  const { data } = useQuery({
    queryKey: ["tasks", column.id],
    queryFn: () => taskService.getTasks(column.id),
  });

  const tasks = data?.data ?? [];

  return (
    <Card
      title={column.name}
      extra={<Button size="small" type="link" icon={<PlusOutlined />}>Thêm</Button>}
      style={{
        minWidth: 300,
        background: "#fafafa",
        maxHeight: "80vh",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {tasks.map((task: Task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </Space>
    </Card>
  );
}
