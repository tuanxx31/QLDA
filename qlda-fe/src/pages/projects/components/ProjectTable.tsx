import { ProTable } from "@ant-design/pro-components";
import {
  Tag,
  Typography,
  Button,
  message,
  Popconfirm,
  Space,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import type { Project } from "@/types/project.type";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.services";

const { Text } = Typography;

interface Props {
  data?: Project[];
  loading: boolean;
}

const ProjectTable = ({ data = [], loading }: Props) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const removeMutation = useMutation({
    mutationFn: (id: string) => projectService.remove(id),
    onSuccess: () => {
      message.success("Đã xóa dự án");
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      message.error("Không thể xóa dự án");
    },
  });

  return (
    <ProTable<Project>
      rowKey="id"
      loading={loading}
      search={false}
      pagination={{ pageSize: 8 }}
      dataSource={data}
      columns={[
        {
          title: "Tên dự án",
          dataIndex: "name",
          render: (text, record) => (
            <Button
              type="link"
              onClick={() => navigate(`/projects/${record.id}`)}
              style={{ padding: 0 }}
            >
              {text}
            </Button>
          ),
        },
        {
          title: "Mô tả",
          dataIndex: "description",
          ellipsis: true,
        },
        {
          title: "Trạng thái",
          dataIndex: "status",
          align: "center",
          render: (_, record) => (
            <Tag
              color={
                record.status === "done"
                  ? "green"
                  : record.status === "doing"
                  ? "blue"
                  : "default"
              }
            >
              {record.status.toUpperCase()}
            </Tag>
          ),
        },
        {
          title: "Ngày bắt đầu",
          dataIndex: "startDate",
          render: (value) =>
            value ? (
              <Text type="secondary">
                {new Date(value as string).toLocaleDateString("vi-VN")}
              </Text>
            ) : (
              <Text type="secondary">—</Text>
            ),
        },
        {
          title: "Hạn chót",
          dataIndex: "deadline",
          render: (value) =>
            value ? (
              <Text type="secondary">
                {new Date(value as string).toLocaleDateString("vi-VN")}
              </Text>
            ) : (
              <Text type="secondary">—</Text>
            ),
        },
        {
          title: "Trưởng dự án",
          dataIndex: ["manager", "name"],
          render: (name) => name || "—",
        },
        {
          title: "Hành động",
          dataIndex: "actions",
          render: (_, record) => (
            <Space>
              <Tooltip title="Chỉnh sửa dự án">
                <Button
                  type="link"
                  onClick={() => navigate(`/projects/${record.id}`)}
                >
                  <EditOutlined />
                </Button>
              </Tooltip>
              <Popconfirm
                title="Xác nhận xóa dự án"
                onConfirm={() => removeMutation.mutate(record.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Tooltip title="Xóa dự án">
                  <Button type="link" danger>
                    <DeleteOutlined />
                  </Button>
                </Tooltip>
              </Popconfirm>
            </Space>
          ),
        },
      ]}
      options={false}
      bordered
    />
  );
};

export default ProjectTable;
