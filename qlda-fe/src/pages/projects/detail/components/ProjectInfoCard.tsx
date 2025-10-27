import { Card, Descriptions, Tag, Typography, Button, Space } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { Project } from "@/types/project.type";
import ProjectEditModal from "../../component/ProjectEditModal";

const { Text, Paragraph, Title } = Typography;

interface Props {
  project: Project;
  onUpdate: () => void;
}

const ProjectInfoCard = ({ project, onUpdate }: Props) => {
  const [open, setOpen] = useState(false);

  const formatDate = (date?: string | null) =>
    date
      ? new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  const getStatusColor = (s: string) =>
    s === "done" ? "green" : s === "doing" ? "blue" : "default";
  const getStatusText = (s: string) =>
    s === "done" ? "Hoàn thành" : s === "doing" ? "Đang thực hiện" : "Chưa bắt đầu";

  return (
    <Card
      title={<Title level={4}>Thông tin dự án</Title>}
      extra={
        <Button type="primary" icon={<EditOutlined />} onClick={() => setOpen(true)}>
          Chỉnh sửa
        </Button>
      }
      style={{ borderRadius: 12 }}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Tên dự án" span={2}>
          <Text strong>{project.name}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Trưởng dự án" span={2}>  <Text strong>{project.owner?.name}</Text></Descriptions.Item>
        <Descriptions.Item label="Thuộc nhóm" span={2}>
          <Text strong>{project.group?.name || <Text type="secondary">Cá nhân</Text>}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái" span={2}>
          <Tag color={getStatusColor(project.status)}>{getStatusText(project.status)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả" span={2}>
          <Paragraph>{project.description || <Text type="secondary">Chưa có mô tả</Text>}</Paragraph>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">{formatDate(project.startDate)}</Descriptions.Item>
        <Descriptions.Item label="Hạn chót">{formatDate(project.deadline)}</Descriptions.Item>
      </Descriptions>

      <ProjectEditModal open={open} onClose={() => setOpen(false)} project={project} onUpdate={() => {onUpdate();}} />
    </Card>
  );
};

export default ProjectInfoCard;
