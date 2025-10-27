import { PageContainer, ProCard } from "@ant-design/pro-components";
import { Space, Spin, Typography, Button, message } from "antd";
import { ArrowLeftOutlined, UserAddOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.services";
import { useState } from "react";
import ProjectInfoCard from "./components/ProjectInfoCard";
import ProjectMembers from "./components/ProjectMembers";
import MemberAddModal from "./components/MemberAddModal";
import MemberAddFromGroupModal from "./components/MemberAddFromGroupModal";

const { Title } = Typography;

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [openAddMember, setOpenAddMember] = useState(false);
  const [openAddFromGroup, setOpenAddFromGroup] = useState(false); 

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => await projectService.getById(projectId!),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div style={{ textAlign: "center", padding: "120px 0" }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <ProCard>
          <Title level={5} type="danger">
            Không tìm thấy dự án
          </Title>
          <Button onClick={() => navigate("/projects")}>Quay lại</Button>
        </ProCard>
      </PageContainer>
    );
  }

  const isGroupProject = !!(project.group?.id); // 🔎 tùy backend trả về

  return (
    <PageContainer
      title={
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/projects")}
          />
          <span>{project.name}</span>
        </Space>
      }
      extra={[
        <Button
          key="addMember"
          icon={<UserAddOutlined />}
          type="primary"
          onClick={() => setOpenAddMember(true)}
        >
          Thêm thành viên
        </Button>,
        isGroupProject && (
          <Button
            key="addFromGroup"
            icon={<UserAddOutlined />}
            onClick={() => setOpenAddFromGroup(true)}
          >
            Thêm từ nhóm
          </Button>
        ),
      ].filter(Boolean)}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <ProjectInfoCard project={project} onUpdate={() => {qc.invalidateQueries({ queryKey: ["project", projectId] });}}/>
        <ProjectMembers projectId={projectId!} />
      </Space>

      <MemberAddModal
        open={openAddMember}
        onClose={() => setOpenAddMember(false)}
        projectId={projectId!}
      />

      {/* 🔹 Modal chọn thành viên từ Group (chỉ hiện khi dự án là nhóm) */}
      {isGroupProject && (
        <MemberAddFromGroupModal
          open={openAddFromGroup}
          onClose={() => setOpenAddFromGroup(false)}
          projectId={projectId!}
          groupId={project.group?.id || ""}
          onSuccess={async () => {
            message.success("Đã thêm thành viên từ nhóm");
            await qc.invalidateQueries({ queryKey: ["project", projectId] });
            await qc.invalidateQueries({ queryKey: ["projectMembers", projectId] });
          }}
        />
      )}
    </PageContainer>
  );
};

export default ProjectDetailPage;
