

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGroupPermission } from './useGroupPermission';
import { groupService } from '@/services/group.services';
import useAuth from './useAuth';

jest.mock('@/services/group.services');
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

describe('useGroupPermission', () => {
  const mockGroupService = groupService as jest.Mocked<typeof groupService>;
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

  it('should return null permissions when groupId is undefined', () => {
    const { result } = renderHook(() => useGroupPermission(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.role).toBeNull();
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
  });

  it('should return leader permissions when user is group leader', async () => {
    const mockGroup = {
      id: 'group-1',
      leader: { id: 'user-1' },
      members: [],
    };

    mockGroupService.getDetail.mockResolvedValue(mockGroup as any);

    const { result } = renderHook(() => useGroupPermission('group-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('leader');
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.canInvite).toBe(true);
    expect(result.current.canManageMembers).toBe(true);
  });

  it('should return member permissions when user is accepted member', async () => {
    const mockGroup = {
      id: 'group-1',
      leader: { id: 'leader-1' },
      members: [
        {
          user: { id: 'user-1' },
          role: 'member',
          status: 'accepted',
        },
      ],
    };

    mockGroupService.getDetail.mockResolvedValue(mockGroup as any);

    const { result } = renderHook(() => useGroupPermission('group-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('member');
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canInvite).toBe(false);
    expect(result.current.canManageMembers).toBe(false);
    expect(result.current.canView).toBe(true);
  });

  it('should return null permissions when user is not accepted member', async () => {
    const mockGroup = {
      id: 'group-1',
      leader: { id: 'leader-1' },
      members: [
        {
          user: { id: 'user-1' },
          role: 'member',
          status: 'pending',
        },
      ],
    };

    mockGroupService.getDetail.mockResolvedValue(mockGroup as any);

    const { result } = renderHook(() => useGroupPermission('group-1'), {
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

