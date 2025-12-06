import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { groupService } from '@/services/group.services';
import useAuth from './useAuth';
import type { GroupPermission, GroupRole } from '@/types/permission.type';
import {
  canEditGroup,
  canDeleteGroup,
  canInviteMembers,
  canManageGroupMembers,
  canViewGroup,
} from '@/utils/permissions';

/**
 * Hook để lấy permission của user trong group
 */
export function useGroupPermission(groupId: string | undefined) {
  const auth = useAuth();
  const userId = auth.authUser?.id;

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      return await groupService.getDetail(groupId);
    },
    enabled: !!groupId,
  });

  const permission: GroupPermission = useMemo(() => {
    if (!group || !userId) {
      return {
        role: null,
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManageMembers: false,
        canView: false,
      };
    }

    // Leader của group
    let role: GroupRole | null = null;
    if (group.leader?.id === userId) {
      role = 'leader';
    } else {
      // Tìm trong members với status accepted
      const member = group.members?.find(
        (m) => m.user?.id === userId && m.status === 'accepted',
      );
      role = member ? (member.role as GroupRole) : null;
    }

    return {
      role,
      canEdit: canEditGroup(role),
      canDelete: canDeleteGroup(role),
      canInvite: canInviteMembers(role),
      canManageMembers: canManageGroupMembers(role),
      canView: canViewGroup(role),
    };
  }, [group, userId]);

  return {
    ...permission,
    isLoading,
  };
}

