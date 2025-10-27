import { ProList } from "@ant-design/pro-components";
import { Avatar, Space, Tag, Button, message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectMemberService } from "@/services/project.services";
import { DeleteOutlined } from "@ant-design/icons";

interface Props {
  projectId: string;
}

const ProjectMembers = ({ projectId }: Props) => {
  const qc = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: async () => await projectMemberService.getByProject(projectId),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => projectMemberService.remove(projectId, userId),
    onSuccess: () => {
      message.success("Đã xóa thành viên");
      qc.invalidateQueries({ queryKey: ["projectMembers", projectId] });
    },
  });

  return (
    <ProList
      headerTitle="Thành viên dự án"
      loading={isLoading}
      grid={{ gutter: 16, column: 1 }}
      metas={{
        title: {
          render: (_, item) => (
            <Space>
              <Avatar src={item.user.avatar} />
              <span>{item.user.name}</span>
            </Space>
          ),
        },
        description: {
          render: (_, item) => <Tag color={item.role === "leader" ? "gold" : "blue"}>{item.role}</Tag>,
        },
        actions: {
          render: (_, item) => (
            <Button
              icon={<DeleteOutlined />}
              danger
              type="link"
              onClick={() => removeMutation.mutate(item.user.id)}
            >
              Xóa
            </Button>
          ),
        },
      }}
      dataSource={members || []}
    />
  );
};

export default ProjectMembers;
