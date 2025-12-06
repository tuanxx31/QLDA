export type ProjectRole = 'leader' | 'editor' | 'viewer';
export type GroupRole = 'leader' | 'member';

export interface ProjectPermission {
  role: ProjectRole | null;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canEditColumns: boolean;
  canView: boolean;
}

export interface GroupPermission {
  role: GroupRole | null;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canManageMembers: boolean;
  canView: boolean;
}

export const PROJECT_PERMISSIONS = {
  LEADER: ['leader'] as ProjectRole[],
  EDITOR: ['leader', 'editor'] as ProjectRole[],
  VIEWER: ['leader', 'editor', 'viewer'] as ProjectRole[],
} as const;

export const GROUP_PERMISSIONS = {
  LEADER: ['leader'] as GroupRole[],
  MEMBER: ['leader', 'member'] as GroupRole[],
} as const;

