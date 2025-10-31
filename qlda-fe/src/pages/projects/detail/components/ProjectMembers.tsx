import { message, Tabs } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectMemberService } from '@/services/project.services';
import { ProjectMembersTable } from './ProjectMembersTable ';
import type { ProjectMember } from '@/types/project.type';
import useAuth from '@/hooks/useAuth';
interface Props {
  projectId: string;
}

const ProjectMembers = ({ projectId }: Props) => {
  const qc = useQueryClient();

  const { data: projectMembers, isLoading } = useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: async () => await projectMemberService.getProjectMebers(projectId),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => projectMemberService.remove(projectId, userId),
    onSuccess: () => {
      message.success('Đã xóa thành viên');
      qc.invalidateQueries({ queryKey: ['projectMembers', projectId] });
    },
  });

  const auth = useAuth();

  const isLeader =
    projectMembers?.find((member: ProjectMember) => member.user.id === auth.authUser?.id)?.role ===
    'leader';

  return (
    <Tabs
      defaultActiveKey="members"
      style={{ marginTop: 24 }}
      items={[
        {
          key: 'members',
          label: 'Thành viên',
          children: (
            <ProjectMembersTable
              projectMembers={projectMembers}
              projectId={projectId}
              isLeader={isLeader}
              onUpdate={() => qc.invalidateQueries({ queryKey: ['projectMembers', projectId] })}
            />
          ),
        },
      ]}
    />
  );
};

export default ProjectMembers;
