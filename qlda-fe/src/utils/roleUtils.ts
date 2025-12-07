import type { ProjectRole } from '@/types/permission.type';

export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  leader: 'Trưởng dự án',
  editor: 'Người chỉnh sửa',
  viewer: 'Người xem',
};

export const PROJECT_ROLE_COLORS: Record<ProjectRole, string> = {
  leader: 'gold',
  editor: 'blue',
  viewer: 'default',
};

export function getProjectRoleLabel(role: ProjectRole): string {
  return PROJECT_ROLE_LABELS[role] || role;
}

export function getProjectRoleColor(role: ProjectRole): string {
  return PROJECT_ROLE_COLORS[role] || 'default';
}

export const PROJECT_ROLE_OPTIONS = [
  {
    label: 'Người xem (Viewer) - Chỉ xem, cập nhật status task được gán',
    value: 'viewer' as ProjectRole,
  },
  {
    label: 'Người chỉnh sửa (Editor) - Có thể chỉnh sửa columns và tasks',
    value: 'editor' as ProjectRole,
  },
];

export const PROJECT_ROLE_SIMPLE_OPTIONS = [
  { label: 'Người xem', value: 'viewer' as ProjectRole },
  { label: 'Người chỉnh sửa', value: 'editor' as ProjectRole },
];

