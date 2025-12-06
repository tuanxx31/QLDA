/**
 * Unit tests for useProjectPermission hook
 * 
 * Note: These tests require React Testing Library setup.
 * To run these tests, you need to install:
 * - @testing-library/react
 * - @testing-library/react-hooks (if using older version)
 * - @testing-library/jest-dom
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjectPermission } from './useProjectPermission';
import { projectService } from '@/services/project.services';
import useAuth from './useAuth';

// Mock dependencies
jest.mock('@/services/project.services');
jest.mock('./useAuth');

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

describe('useProjectPermission', () => {
  const mockProjectService = projectService as jest.Mocked<typeof projectService>;
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      authUser: { id: 'user-1' } as any,
      login: jest.fn(),
      logout: jest.fn(),
      updateAuthUser: jest.fn(),
    });
  });

  it('should return null permissions when projectId is undefined', () => {
    const { result } = renderHook(() => useProjectPermission(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.role).toBeNull();
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
  });

  it('should return leader permissions when user is owner', async () => {
    const mockProject = {
      id: 'project-1',
      owner: { id: 'user-1' },
      members: [],
    };

    mockProjectService.getById.mockResolvedValue(mockProject as any);

    const { result } = renderHook(() => useProjectPermission('project-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('leader');
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.canManageMembers).toBe(true);
    expect(result.current.canEditTasks).toBe(true);
    expect(result.current.canDeleteTasks).toBe(true);
  });

  it('should return editor permissions when user is editor member', async () => {
    const mockProject = {
      id: 'project-1',
      owner: { id: 'owner-1' },
      members: [
        {
          user: { id: 'user-1' },
          role: 'editor',
        },
      ],
    };

    mockProjectService.getById.mockResolvedValue(mockProject as any);

    const { result } = renderHook(() => useProjectPermission('project-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('editor');
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canManageMembers).toBe(false);
    expect(result.current.canEditTasks).toBe(true);
    expect(result.current.canDeleteTasks).toBe(true);
  });

  it('should return viewer permissions when user is viewer member', async () => {
    const mockProject = {
      id: 'project-1',
      owner: { id: 'owner-1' },
      members: [
        {
          user: { id: 'user-1' },
          role: 'viewer',
        },
      ],
    };

    mockProjectService.getById.mockResolvedValue(mockProject as any);

    const { result } = renderHook(() => useProjectPermission('project-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('viewer');
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canManageMembers).toBe(false);
    expect(result.current.canEditTasks).toBe(false);
    expect(result.current.canDeleteTasks).toBe(false);
    expect(result.current.canView).toBe(true);
  });

  it('should return null permissions when user is not a member', async () => {
    const mockProject = {
      id: 'project-1',
      owner: { id: 'owner-1' },
      members: [],
    };

    mockProjectService.getById.mockResolvedValue(mockProject as any);

    const { result } = renderHook(() => useProjectPermission('project-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBeNull();
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
  });
});

