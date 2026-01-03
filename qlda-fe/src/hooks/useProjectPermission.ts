import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService, projectMemberService } from '@/services/project.services';
import useAuth from './useAuth';
import type { ProjectPermission, ProjectRole } from '@/types/permission.type';
import {
  canEditProject,
  canDeleteProject,
  canManageMembers,
  canEditTasks as canEditTasksFn,
  canDeleteTasks as canDeleteTasksFn,
  canEditColumns as canEditColumnsFn,
  canViewProject,
} from '@/utils/permissions';

export function useProjectPermission(projectId: string | undefined) {
  const auth = useAuth();
  const userId = auth.authUser?.id;

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      return await projectService.getById(projectId);
    },
    enabled: !!projectId,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return await projectMemberService.getProjectMebers(projectId);
    },
    enabled: !!projectId,
  });

  const permission: ProjectPermission = useMemo(() => {
    if (!project || !userId) {
      return {
        role: null,
        canEdit: false,
        canDelete: false,
        canManageMembers: false,
        canEditTasks: false,
        canDeleteTasks: false,
        canEditColumns: false,
        canView: false,
      };
    }

    
    let role: ProjectRole | null = null;
    if (project.owner?.id === userId) {
      role = 'leader';
    } else {
      
      const member = members.find((m) => m.user?.id === userId);
      role = member ? (member.role as ProjectRole) : null;
    }

    return {
      role,
      canEdit: canEditProject(role),
      canDelete: canDeleteProject(role),
      canManageMembers: canManageMembers(role),
      canEditTasks: canEditTasksFn(role),
      canDeleteTasks: canDeleteTasksFn(role),
      canEditColumns: canEditColumnsFn(role),
      canView: canViewProject(role),
    };
  }, [project, members, userId]);

  return {
    ...permission,
    isLoading: projectLoading || membersLoading,
  };
}

