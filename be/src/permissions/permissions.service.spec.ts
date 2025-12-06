import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionsService } from './permissions.service';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';
import { GroupMember } from 'src/group-member/entities/group-member.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let projectMemberRepo: Repository<ProjectMember>;
  let groupMemberRepo: Repository<GroupMember>;
  let projectRepo: Repository<Project>;
  let groupRepo: Repository<Group>;

  const mockProjectMemberRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockGroupMemberRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockProjectRepo = {
    findOne: jest.fn(),
  };

  const mockGroupRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getRepositoryToken(ProjectMember),
          useValue: mockProjectMemberRepo,
        },
        {
          provide: getRepositoryToken(GroupMember),
          useValue: mockGroupMemberRepo,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepo,
        },
        {
          provide: getRepositoryToken(Group),
          useValue: mockGroupRepo,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    projectMemberRepo = module.get<Repository<ProjectMember>>(
      getRepositoryToken(ProjectMember),
    );
    groupMemberRepo = module.get<Repository<GroupMember>>(
      getRepositoryToken(GroupMember),
    );
    projectRepo = module.get<Repository<Project>>(getRepositoryToken(Project));
    groupRepo = module.get<Repository<Group>>(getRepositoryToken(Group));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProjectRole', () => {
    const projectId = 'project-1';
    const userId = 'user-1';
    const ownerId = 'owner-1';

    it('should return leader if user is owner', async () => {
      const mockProject = {
        id: projectId,
        owner: { id: userId } as User,
        members: [],
      };

      mockProjectRepo.findOne.mockResolvedValue(mockProject);

      const result = await service.getUserProjectRole(projectId, userId);

      expect(result).toBe('leader');
      expect(mockProjectRepo.findOne).toHaveBeenCalledWith({
        where: { id: projectId },
        relations: ['owner', 'members', 'members.user'],
      });
    });

    it('should return role from members if user is member', async () => {
      const mockProject = {
        id: projectId,
        owner: { id: ownerId } as User,
        members: [
          {
            user: { id: userId } as User,
            role: 'editor',
          } as ProjectMember,
        ],
      };

      mockProjectRepo.findOne.mockResolvedValue(mockProject);

      const result = await service.getUserProjectRole(projectId, userId);

      expect(result).toBe('editor');
    });

    it('should return null if user is not owner or member', async () => {
      const mockProject = {
        id: projectId,
        owner: { id: ownerId } as User,
        members: [],
      };

      mockProjectRepo.findOne.mockResolvedValue(mockProject);

      const result = await service.getUserProjectRole(projectId, userId);

      expect(result).toBeNull();
    });

    it('should throw NotFoundException if project not found', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getUserProjectRole(projectId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserGroupRole', () => {
    const groupId = 'group-1';
    const userId = 'user-1';
    const leaderId = 'leader-1';

    it('should return leader if user is group leader', async () => {
      const mockGroup = {
        id: groupId,
        leader: { id: userId } as User,
        members: [],
      };

      mockGroupRepo.findOne.mockResolvedValue(mockGroup);

      const result = await service.getUserGroupRole(groupId, userId);

      expect(result).toBe('leader');
    });

    it('should return role from members if user is accepted member', async () => {
      const mockGroup = {
        id: groupId,
        leader: { id: leaderId } as User,
        members: [
          {
            user: { id: userId } as User,
            role: 'member',
            status: 'accepted',
          } as GroupMember,
        ],
      };

      mockGroupRepo.findOne.mockResolvedValue(mockGroup);

      const result = await service.getUserGroupRole(groupId, userId);

      expect(result).toBe('member');
    });

    it('should return null if user is not accepted member', async () => {
      const mockGroup = {
        id: groupId,
        leader: { id: leaderId } as User,
        members: [
          {
            user: { id: userId } as User,
            role: 'member',
            status: 'pending',
          } as GroupMember,
        ],
      };

      mockGroupRepo.findOne.mockResolvedValue(mockGroup);

      const result = await service.getUserGroupRole(groupId, userId);

      expect(result).toBeNull();
    });

    it('should throw NotFoundException if group not found', async () => {
      mockGroupRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getUserGroupRole(groupId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkProjectPermission', () => {
    const projectId = 'project-1';
    const userId = 'user-1';

    beforeEach(() => {
      jest.spyOn(service, 'getUserProjectRole').mockResolvedValue('editor');
    });

    it('should return true if user has required role', async () => {
      const result = await service.checkProjectPermission(
        projectId,
        userId,
        'editor',
      );

      expect(result).toBe(true);
    });

    it('should return true if user has one of required roles', async () => {
      const result = await service.checkProjectPermission(
        projectId,
        userId,
        ['editor', 'viewer'],
      );

      expect(result).toBe(true);
    });

    it('should return false if user does not have required role', async () => {
      const result = await service.checkProjectPermission(
        projectId,
        userId,
        'leader',
      );

      expect(result).toBe(false);
    });

    it('should return true if user is leader (leader has all permissions)', async () => {
      jest.spyOn(service, 'getUserProjectRole').mockResolvedValue('leader');

      const result = await service.checkProjectPermission(
        projectId,
        userId,
        'viewer',
      );

      expect(result).toBe(true);
    });
  });

  describe('canEditProject', () => {
    const projectId = 'project-1';
    const userId = 'user-1';

    it('should return true if user is leader', async () => {
      jest.spyOn(service, 'checkProjectPermission').mockResolvedValue(true);

      const result = await service.canEditProject(projectId, userId);

      expect(result).toBe(true);
      expect(service.checkProjectPermission).toHaveBeenCalledWith(
        projectId,
        userId,
        'leader',
      );
    });
  });

  describe('canEditTask', () => {
    const projectId = 'project-1';
    const userId = 'user-1';

    it('should return true if user is leader or editor', async () => {
      jest.spyOn(service, 'checkProjectPermission').mockResolvedValue(true);

      const result = await service.canEditTask(projectId, userId);

      expect(result).toBe(true);
      expect(service.checkProjectPermission).toHaveBeenCalledWith(
        projectId,
        userId,
        ['leader', 'editor'],
      );
    });
  });

  describe('canUpdateTaskStatus', () => {
    const projectId = 'project-1';
    const userId = 'user-1';

    it('should return true if user is leader', async () => {
      jest.spyOn(service, 'getUserProjectRole').mockResolvedValue('leader');

      const result = await service.canUpdateTaskStatus(projectId, userId);

      expect(result).toBe(true);
    });

    it('should return true if user is editor', async () => {
      jest.spyOn(service, 'getUserProjectRole').mockResolvedValue('editor');

      const result = await service.canUpdateTaskStatus(projectId, userId);

      expect(result).toBe(true);
    });

    it('should return true if user is viewer and is assignee', async () => {
      jest.spyOn(service, 'getUserProjectRole').mockResolvedValue('viewer');

      const result = await service.canUpdateTaskStatus(
        projectId,
        userId,
        [userId],
      );

      expect(result).toBe(true);
    });

    it('should return false if user is viewer but not assignee', async () => {
      jest.spyOn(service, 'getUserProjectRole').mockResolvedValue('viewer');

      const result = await service.canUpdateTaskStatus(
        projectId,
        userId,
        ['other-user'],
      );

      expect(result).toBe(false);
    });
  });

  describe('isProjectMember', () => {
    const projectId = 'project-1';
    const userId = 'user-1';

    it('should return true if user is member', async () => {
      jest.spyOn(service, 'getUserProjectRole').mockResolvedValue('viewer');

      const result = await service.isProjectMember(projectId, userId);

      expect(result).toBe(true);
    });

    it('should return false if user is not member', async () => {
      jest.spyOn(service, 'getUserProjectRole').mockResolvedValue(null);

      const result = await service.isProjectMember(projectId, userId);

      expect(result).toBe(false);
    });
  });
});

