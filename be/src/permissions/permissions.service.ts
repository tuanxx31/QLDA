import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';
import { GroupMember } from 'src/group-member/entities/group-member.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Group } from 'src/groups/entities/group.entity';

export type ProjectRole = 'leader' | 'editor' | 'viewer';
export type GroupRole = 'leader' | 'member';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepo: Repository<ProjectMember>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
  ) {}

  
  async getUserProjectRole(
    projectId: string,
    userId: string,
  ): Promise<ProjectRole | null> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['owner', 'members', 'members.user'],
    });

    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án.');
    }

    
    if (project.owner.id === userId) {
      return 'leader';
    }

    
    const member = project.members.find((m) => m.user.id === userId);
    return member ? (member.role as ProjectRole) : null;
  }

  
  async getUserGroupRole(
    groupId: string,
    userId: string,
  ): Promise<GroupRole | null> {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['leader', 'members', 'members.user'],
    });

    if (!group) {
      throw new NotFoundException('Không tìm thấy nhóm.');
    }

    
    if (group.leader.id === userId) {
      return 'leader';
    }

    
    const member = group.members.find(
      (m) => m.user.id === userId && m.status === 'accepted',
    );
    return member ? (member.role as GroupRole) : null;
  }

  
  async checkProjectPermission(
    projectId: string,
    userId: string,
    requiredRole: ProjectRole | ProjectRole[],
  ): Promise<boolean> {
    const userRole = await this.getUserProjectRole(projectId, userId);

    if (!userRole) {
      return false;
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    
    if (userRole === 'leader') {
      return true;
    }

    return roles.includes(userRole);
  }

  
  async checkGroupPermission(
    groupId: string,
    userId: string,
    requiredRole: GroupRole | GroupRole[],
  ): Promise<boolean> {
    const userRole = await this.getUserGroupRole(groupId, userId);

    if (!userRole) {
      return false;
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(userRole);
  }

  
  async canEditProject(projectId: string, userId: string): Promise<boolean> {
    return this.checkProjectPermission(projectId, userId, 'leader');
  }

  
  async canDeleteProject(projectId: string, userId: string): Promise<boolean> {
    return this.checkProjectPermission(projectId, userId, 'leader');
  }

  
  async canManageMembers(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    return this.checkProjectPermission(projectId, userId, 'leader');
  }

  
  async canEditTask(projectId: string, userId: string): Promise<boolean> {
    return this.checkProjectPermission(projectId, userId, ['leader', 'editor']);
  }

  
  async canDeleteTask(projectId: string, userId: string): Promise<boolean> {
    return this.checkProjectPermission(projectId, userId, ['leader', 'editor']);
  }

  
  async canEditColumn(projectId: string, userId: string): Promise<boolean> {
    return this.checkProjectPermission(projectId, userId, ['leader', 'editor']);
  }

  
  async canUpdateTaskStatus(
    projectId: string,
    userId: string,
    taskAssigneeIds?: string[],
  ): Promise<boolean> {
    const userRole = await this.getUserProjectRole(projectId, userId);

    if (!userRole) {
      return false;
    }

    
    if (userRole === 'leader' || userRole === 'editor') {
      return true;
    }

    
    if (userRole === 'viewer') {
      return taskAssigneeIds?.includes(userId) ?? false;
    }

    return false;
  }

  
  async canEditGroup(groupId: string, userId: string): Promise<boolean> {
    return this.checkGroupPermission(groupId, userId, 'leader');
  }

  
  async canDeleteGroup(groupId: string, userId: string): Promise<boolean> {
    return this.checkGroupPermission(groupId, userId, 'leader');
  }

  
  async canInviteMembers(groupId: string, userId: string): Promise<boolean> {
    return this.checkGroupPermission(groupId, userId, 'leader');
  }

  
  async canManageGroupMembers(
    groupId: string,
    userId: string,
  ): Promise<boolean> {
    return this.checkGroupPermission(groupId, userId, 'leader');
  }

  
  async isProjectMember(projectId: string, userId: string): Promise<boolean> {
    const role = await this.getUserProjectRole(projectId, userId);
    return role !== null;
  }

  
  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    const role = await this.getUserGroupRole(groupId, userId);
    return role !== null;
  }
}

