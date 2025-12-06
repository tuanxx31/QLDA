import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { GroupRoleGuard } from './group-role.guard';
import { PermissionsService } from '../permissions.service';

describe('GroupRoleGuard', () => {
  let guard: GroupRoleGuard;
  let reflector: Reflector;
  let permissionsService: PermissionsService;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockPermissionsService = {
    checkGroupPermission: jest.fn(),
  };

  const createMockExecutionContext = (
    groupId: string | null,
    userId: string | null,
  ): ExecutionContext => {
    const request = {
      params: groupId ? { groupId } : {},
      user: userId ? { sub: userId } : null,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupRoleGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    guard = module.get<GroupRoleGuard>(GroupRoleGuard);
    reflector = module.get<Reflector>(Reflector);
    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no required roles', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);

    const context = createMockExecutionContext('group-1', 'user-1');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockPermissionsService.checkGroupPermission).not.toHaveBeenCalled();
  });

  it('should allow access if user has required role', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['leader']);
    mockPermissionsService.checkGroupPermission.mockResolvedValue(true);

    const context = createMockExecutionContext('group-1', 'user-1');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockPermissionsService.checkGroupPermission).toHaveBeenCalledWith(
      'group-1',
      'user-1',
      ['leader'],
    );
  });

  it('should throw ForbiddenException if user does not have required role', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['leader']);
    mockPermissionsService.checkGroupPermission.mockResolvedValue(false);

    const context = createMockExecutionContext('group-1', 'user-1');

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw NotFoundException if groupId is missing', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['leader']);

    const context = createMockExecutionContext(null, 'user-1');

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });

  it('should extract groupId from params.id if groupId not found', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['leader']);
    mockPermissionsService.checkGroupPermission.mockResolvedValue(true);

    const request = {
      params: { id: 'group-1' },
      user: { sub: 'user-1' },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockPermissionsService.checkGroupPermission).toHaveBeenCalledWith(
      'group-1',
      'user-1',
      ['leader'],
    );
  });
});

