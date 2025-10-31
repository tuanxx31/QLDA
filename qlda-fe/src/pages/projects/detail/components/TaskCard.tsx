import { Card, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { subtaskService } from "@/services/subtask.services";
import SubTaskCheckboxList from "../../components/SubTaskCheckboxList";

export default function TaskCard({ task }: { task: any }) {
  const { data } = useQuery({
    queryKey: ["subtasks", task.id],
    queryFn: () => subtaskService.getSubtasks(task.id),
  });

  const subtasks = data?.data ?? [];

  return (
    <Card size="small" title={task.title}>
      <Tag color={task.status === "done" ? "green" : "blue"}>{task.status}</Tag>
      <SubTaskCheckboxList subtasks={subtasks} />
    </Card>
  );
}
