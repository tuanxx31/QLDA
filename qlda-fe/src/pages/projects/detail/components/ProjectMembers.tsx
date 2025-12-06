import { message, Tabs } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectMemberService } from '@/services/project.services';
import { ProjectMembersTable } from './ProjectMembersTable ';
import type { ProjectMember } from '@/types/project.type';
import { useProjectPermission } from '@/hooks/useProjectPermission';
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
      // Invalidate task assignees để filter lại assignees khi thành viên bị xóa
      qc.invalidateQueries({ queryKey: ['taskAssignees'] });
      qc.invalidateQueries({ queryKey: ['task'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['columns'] });
    },
  });

  const { canManageMembers } = useProjectPermission(projectId);

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
              isLeader={canManageMembers}
              onUpdate={() => {
                qc.invalidateQueries({ queryKey: ['projectMembers', projectId] });
                // Invalidate task assignees để filter lại assignees khi thành viên bị xóa
                qc.invalidateQueries({ queryKey: ['taskAssignees'] });
                qc.invalidateQueries({ queryKey: ['task'] });
                qc.invalidateQueries({ queryKey: ['tasks'] });
                qc.invalidateQueries({ queryKey: ['columns'] });
              }}
            />
          ),
        },
      ]}
    />
  );
};

export default ProjectMembers;
