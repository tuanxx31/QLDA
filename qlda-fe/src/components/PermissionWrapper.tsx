import { ReactNode } from 'react';
import { useProjectPermission } from '@/hooks/useProjectPermission';
import type { ProjectRole } from '@/types/permission.type';
import { hasProjectPermission } from '@/utils/permissions';

interface PermissionWrapperProps {
  projectId: string | undefined;
  permission: ProjectRole | ProjectRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionWrapper({
  projectId,
  permission,
  children,
  fallback = null,
}: PermissionWrapperProps) {
  const { role, isLoading } = useProjectPermission(projectId);

  if (isLoading) {
    return null;
  }

  const hasPermission = hasProjectPermission(role, permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

