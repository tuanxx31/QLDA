import { Checkbox, Space } from "antd";

export default function SubTaskCheckboxList({ subtasks }: { subtasks: any[] }) {
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {subtasks.map((s) => (
        <Checkbox key={s.id} checked={s.completed}>
          {s.title}
        </Checkbox>
      ))}
    </Space>
  );
}
