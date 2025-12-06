/**
 * Unit tests for PermissionWrapper component
 */

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PermissionWrapper } from './PermissionWrapper';
import { useProjectPermission } from '@/hooks/useProjectPermission';

// Mock the hook
jest.mock('@/hooks/useProjectPermission');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('PermissionWrapper', () => {
  const mockUseProjectPermission = useProjectPermission as jest.MockedFunction<
    typeof useProjectPermission
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user has permission', () => {
    mockUseProjectPermission.mockReturnValue({
      role: 'leader',
      canEdit: true,
      canDelete: true,
      canManageMembers: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canEditColumns: true,
      canView: true,
      isLoading: false,
    });

    render(
      <PermissionWrapper projectId="project-1" permission="leader">
        <div>Protected Content</div>
      </PermissionWrapper>,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render children when user does not have permission', () => {
    mockUseProjectPermission.mockReturnValue({
      role: 'viewer',
      canEdit: false,
      canDelete: false,
      canManageMembers: false,
      canEditTasks: false,
      canDeleteTasks: false,
      canEditColumns: false,
      canView: true,
      isLoading: false,
    });

    render(
      <PermissionWrapper projectId="project-1" permission="leader">
        <div>Protected Content</div>
      </PermissionWrapper>,
      { wrapper: createWrapper() },
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render fallback when user does not have permission', () => {
    mockUseProjectPermission.mockReturnValue({
      role: 'viewer',
      canEdit: false,
      canDelete: false,
      canManageMembers: false,
      canEditTasks: false,
      canDeleteTasks: false,
      canEditColumns: false,
      canView: true,
      isLoading: false,
    });

    render(
      <PermissionWrapper
        projectId="project-1"
        permission="leader"
        fallback={<div>No Permission</div>}
      >
        <div>Protected Content</div>
      </PermissionWrapper>,
      { wrapper: createWrapper() },
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('No Permission')).toBeInTheDocument();
  });

  it('should not render anything when loading', () => {
    mockUseProjectPermission.mockReturnValue({
      role: null,
      canEdit: false,
      canDelete: false,
      canManageMembers: false,
      canEditTasks: false,
      canDeleteTasks: false,
      canEditColumns: false,
      canView: false,
      isLoading: true,
    });

    render(
      <PermissionWrapper projectId="project-1" permission="leader">
        <div>Protected Content</div>
      </PermissionWrapper>,
      { wrapper: createWrapper() },
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user has one of multiple required permissions', () => {
    mockUseProjectPermission.mockReturnValue({
      role: 'editor',
      canEdit: false,
      canDelete: false,
      canManageMembers: false,
      canEditTasks: true,
      canDeleteTasks: true,
      canEditColumns: true,
      canView: true,
      isLoading: false,
    });

    render(
      <PermissionWrapper projectId="project-1" permission={['leader', 'editor']}>
        <div>Protected Content</div>
      </PermissionWrapper>,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

