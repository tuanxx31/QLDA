import type { ProjectRole, GroupRole } from '@/types/permission.type';

/**
 * Kiểm tra user có role cụ thể trong project không
 */
export function hasProjectPermission(
  role: ProjectRole | null,
  requiredRoles: ProjectRole | ProjectRole[],
): boolean {
  if (!role) return false;

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  // Leader có tất cả quyền
  if (role === 'leader') {
    return true;
  }

  return roles.includes(role);
}

/**
 * Kiểm tra user có role cụ thể trong group không
 */
export function hasGroupPermission(
  role: GroupRole | null,
  requiredRoles: GroupRole | GroupRole[],
): boolean {
  if (!role) return false;

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(role);
}

/**
 * Kiểm tra user có thể edit project không
 */
export function canEditProject(role: ProjectRole | null): boolean {
  return hasProjectPermission(role, 'leader');
}

/**
 * Kiểm tra user có thể delete project không
 */
export function canDeleteProject(role: ProjectRole | null): boolean {
  return hasProjectPermission(role, 'leader');
}

/**
 * Kiểm tra user có thể manage members không
 */
export function canManageMembers(role: ProjectRole | null): boolean {
  return hasProjectPermission(role, 'leader');
}

/**
 * Kiểm tra user có thể edit tasks không
 */
export function canEditTasks(role: ProjectRole | null): boolean {
  return hasProjectPermission(role, ['leader', 'editor']);
}

/**
 * Kiểm tra user có thể delete tasks không
 */
export function canDeleteTasks(role: ProjectRole | null): boolean {
  return hasProjectPermission(role, ['leader', 'editor']);
}

/**
 * Kiểm tra user có thể edit columns không
 */
export function canEditColumns(role: ProjectRole | null): boolean {
  return hasProjectPermission(role, ['leader', 'editor']);
}

/**
 * Kiểm tra user có thể view project không
 */
export function canViewProject(role: ProjectRole | null): boolean {
  return role !== null;
}

/**
 * Kiểm tra user có thể edit group không
 */
export function canEditGroup(role: GroupRole | null): boolean {
  return hasGroupPermission(role, 'leader');
}

/**
 * Kiểm tra user có thể delete group không
 */
export function canDeleteGroup(role: GroupRole | null): boolean {
  return hasGroupPermission(role, 'leader');
}

/**
 * Kiểm tra user có thể invite members không
 */
export function canInviteMembers(role: GroupRole | null): boolean {
  return hasGroupPermission(role, 'leader');
}

/**
 * Kiểm tra user có thể manage group members không
 */
export function canManageGroupMembers(role: GroupRole | null): boolean {
  return hasGroupPermission(role, 'leader');
}

/**
 * Kiểm tra user có thể view group không
 */
export function canViewGroup(role: GroupRole | null): boolean {
  return role !== null;
}

