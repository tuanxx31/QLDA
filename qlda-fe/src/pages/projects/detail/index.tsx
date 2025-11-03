import { PageContainer } from '@ant-design/pro-components';
import { Space, Spin, Typography, Button, message, Card } from 'antd';
import { ArrowLeftOutlined, UserAddOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/project.services';
import { useState } from 'react';
import ProjectInfoCard from './components/ProjectInfoCard';
import ProjectMembers from './components/ProjectMembers';
import MemberAddModal from './components/MemberAddModal';
import MemberAddFromGroupModal from './components/MemberAddFromGroupModal';
import useAuth from '@/hooks/useAuth';

const { Title } = Typography;

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const qc = useQueryClient();
  const [openAddMember, setOpenAddMember] = useState(false);
  const [openAddFromGroup, setOpenAddFromGroup] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => await projectService.getById(projectId!),
    enabled: !!projectId,
  });

  const isLeader = auth.authUser?.id === project?.owner?.id;

  if (isLoading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '120px 0' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer title="Không tìm thấy dự án" onBack={() => navigate('/projects')}>
        <Card>
          <Title level={5} type="danger">
            Không thể tải thông tin dự án
          </Title>
          <Button type="primary" onClick={() => navigate('/projects')}>
            Quay lại danh sách dự án
          </Button>
        </Card>
      </PageContainer>
    );
  }

  const isGroupProject = !!project.group?.id;

  return (
    <PageContainer
      title={
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')} />
          <span>{project.name}</span>
        </Space>
      }
      subTitle={project.description || 'Không có mô tả'}
      extra={[
        isLeader && <Button
          key="addMember"
          icon={<UserAddOutlined />}
          type="primary"
          onClick={() => setOpenAddMember(true)}
        >
          Thêm thành viên
        </Button>,
        isGroupProject && isLeader && (
          <Button
            key="addFromGroup"
            icon={<UserAddOutlined />}
            onClick={() => setOpenAddFromGroup(true)}
          >
            Thêm từ nhóm
          </Button>
        ),
        <Button key="viewBoard" onClick={() => navigate(`/projects/${projectId}/board`)}>
          Xem bảng công việc
        </Button>,
      ].filter(Boolean)}
    >
      <Card style={{ minHeight: '82vh' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <ProjectInfoCard
            project={project}
            onUpdate={() => qc.invalidateQueries({ queryKey: ['project', projectId] })}
          />
          <ProjectMembers projectId={projectId!} />
        </Space>
      </Card>

      <MemberAddModal
        open={openAddMember}
        onClose={() => setOpenAddMember(false)}
        projectId={projectId!}
      />

      {isGroupProject && (
        <MemberAddFromGroupModal
          open={openAddFromGroup}
          onClose={() => setOpenAddFromGroup(false)}
          projectId={projectId!}
          groupId={project.group?.id || ''}
          onSuccess={async () => {
            message.success('Đã thêm thành viên từ nhóm');
            await qc.invalidateQueries({ queryKey: ['project', projectId] });
            await qc.invalidateQueries({ queryKey: ['projectMembers', projectId] });
          }}
        />
      )}
    </PageContainer>
  );
};

export default ProjectDetailPage;
