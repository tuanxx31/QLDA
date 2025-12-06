import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/project.services';
import useAuth from './useAuth';
import type { ProjectPermission, ProjectRole } from '@/types/permission.type';
import {
  canEditProject,
  canDeleteProject,
  canManageMembers,
  canEditTasks,
  canDeleteTasks,
  canEditColumns,
  canViewProject,
} from '@/utils/permissions';

/**
 * Hook để lấy permission của user trong project
 */
export function useProjectPermission(projectId: string | undefined) {
  const auth = useAuth();
  const userId = auth.authUser?.id;

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      return await projectService.getById(projectId);
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

    // Owner luôn là leader
    let role: ProjectRole | null = null;
    if (project.owner?.id === userId) {
      role = 'leader';
    } else {
      // Tìm trong members
      const member = project.members?.find((m) => m.user?.id === userId);
      role = member ? (member.role as ProjectRole) : null;
    }

    return {
      role,
      canEdit: canEditProject(role),
      canDelete: canDeleteProject(role),
      canManageMembers: canManageMembers(role),
      canEditTasks: canEditTasks(role),
      canDeleteTasks: canDeleteTasks(role),
      canEditColumns: canEditColumns(role),
      canView: canViewProject(role),
    };
  }, [project, userId]);

  return {
    ...permission,
    isLoading,
  };
}

