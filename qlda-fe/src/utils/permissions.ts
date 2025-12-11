import type { ProjectRole, GroupRole } from '@/types/permission.type';

export function hasProjectPermission(
  role: ProjectRole | null,
  requiredRoles: ProjectRole | ProjectRole[],
): boolean {
  if (!role) return false;

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  
  if (role === 'leader') {
    return true;
  }

  return roles.includes(role);
}

export function hasGroupPermission(
  role: GroupRole | null,
  requiredRoles: GroupRole | GroupRole[],
): boolean {
  if (!role) return false;

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(role);
}

export function canEditProject(role: ProjectRole | null): boolean {
  return hasProjectPermission(role, 'leader');
}

export function canDeleteProject(role: ProjectRole | null): boolean {
  return hasProjectPermission(role, 'leader');
}

export function canManageMembers(role: ProjectRole | null): boolean {
  return hasProjectPermission(role, 'leader');
}

export function canEditTasks(role: ProjectRole | null): boolean {
  return hasProjectPermission(role, ['leader', 'editor']);
}

export function canDeleteTasks(role: ProjectRole | null): boolean {
  return hasProjectPermission(role, ['leader', 'editor']);
}

export function canEditColumns(role: ProjectRole | null): boolean {
  return hasProjectPermission(role, ['leader', 'editor']);
}

export function canViewProject(role: ProjectRole | null): boolean {
  return role !== null;
}

export function canEditGroup(role: GroupRole | null): boolean {
  return hasGroupPermission(role, 'leader');
}

export function canDeleteGroup(role: GroupRole | null): boolean {
  return hasGroupPermission(role, 'leader');
}

export function canInviteMembers(role: GroupRole | null): boolean {
  return hasGroupPermission(role, 'leader');
}

export function canManageGroupMembers(role: GroupRole | null): boolean {
  return hasGroupPermission(role, 'leader');
}

export function canViewGroup(role: GroupRole | null): boolean {
  return role !== null;
}

