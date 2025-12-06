import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProjectRoleGuard } from './project-role.guard';
import { PermissionsService } from '../permissions.service';
import { REQUIRE_PROJECT_ROLE_KEY } from '../decorators/require-project-role.decorator';

describe('ProjectRoleGuard', () => {
  let guard: ProjectRoleGuard;
  let reflector: Reflector;
  let permissionsService: PermissionsService;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockPermissionsService = {
    checkProjectPermission: jest.fn(),
  };

  const createMockExecutionContext = (
    projectId: string | null,
    userId: string | null,
  ): ExecutionContext => {
    const request = {
      params: projectId ? { projectId } : {},
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
        ProjectRoleGuard,
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

    guard = module.get<ProjectRoleGuard>(ProjectRoleGuard);
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

    const context = createMockExecutionContext('project-1', 'user-1');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockPermissionsService.checkProjectPermission).not.toHaveBeenCalled();
  });

  it('should allow access if user has required role', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['leader']);
    mockPermissionsService.checkProjectPermission.mockResolvedValue(true);

    const context = createMockExecutionContext('project-1', 'user-1');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockPermissionsService.checkProjectPermission).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      ['leader'],
    );
  });

  it('should throw ForbiddenException if user does not have required role', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['leader']);
    mockPermissionsService.checkProjectPermission.mockResolvedValue(false);

    const context = createMockExecutionContext('project-1', 'user-1');

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw NotFoundException if projectId is missing', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['leader']);

    const context = createMockExecutionContext(null, 'user-1');

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if userId is missing', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['leader']);

    const context = createMockExecutionContext('project-1', null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should extract projectId from params.id if projectId not found', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['leader']);
    mockPermissionsService.checkProjectPermission.mockResolvedValue(true);

    const request = {
      params: { id: 'project-1' },
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
    expect(mockPermissionsService.checkProjectPermission).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      ['leader'],
    );
  });
});

