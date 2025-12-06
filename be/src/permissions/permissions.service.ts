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

  /**
   * Lấy role của user trong project
   */
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

    // Owner luôn là leader
    if (project.owner.id === userId) {
      return 'leader';
    }

    // Kiểm tra trong members
    const member = project.members.find((m) => m.user.id === userId);
    return member ? (member.role as ProjectRole) : null;
  }

  /**
   * Lấy role của user trong group
   */
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

    // Leader của group luôn là leader
    if (group.leader.id === userId) {
      return 'leader';
    }

    // Kiểm tra trong members với status accepted
    const member = group.members.find(
      (m) => m.user.id === userId && m.status === 'accepted',
    );
    return member ? (member.role as GroupRole) : null;
  }

  /**
   * Kiểm tra user có role cụ thể trong project không
   */
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

    // Leader có tất cả quyền
    if (userRole === 'leader') {
      return true;
    }

    return roles.includes(userRole);
  }

  /**
   * Kiểm tra user có role cụ thể trong group không
   */
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

  /**
   * Kiểm tra user có thể edit project không
   */
  async canEditProject(projectId: string, userId: string): Promise<boolean> {
    return this.checkProjectPermission(projectId, userId, 'leader');
  }

  /**
   * Kiểm tra user có thể delete project không
   */
  async canDeleteProject(projectId: string, userId: string): Promise<boolean> {
    return this.checkProjectPermission(projectId, userId, 'leader');
  }

  /**
   * Kiểm tra user có thể manage members không
   */
  async canManageMembers(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    return this.checkProjectPermission(projectId, userId, 'leader');
  }

  /**
   * Kiểm tra user có thể edit tasks không
   */
  async canEditTask(projectId: string, userId: string): Promise<boolean> {
    return this.checkProjectPermission(projectId, userId, ['leader', 'editor']);
  }

  /**
   * Kiểm tra user có thể delete tasks không
   */
  async canDeleteTask(projectId: string, userId: string): Promise<boolean> {
    return this.checkProjectPermission(projectId, userId, ['leader', 'editor']);
  }

  /**
   * Kiểm tra user có thể edit columns không
   */
  async canEditColumn(projectId: string, userId: string): Promise<boolean> {
    return this.checkProjectPermission(projectId, userId, ['leader', 'editor']);
  }

  /**
   * Kiểm tra user có thể update task status không (viewer chỉ được update nếu là assignee)
   */
  async canUpdateTaskStatus(
    projectId: string,
    userId: string,
    taskAssigneeIds?: string[],
  ): Promise<boolean> {
    const userRole = await this.getUserProjectRole(projectId, userId);

    if (!userRole) {
      return false;
    }

    // Leader và Editor luôn được phép
    if (userRole === 'leader' || userRole === 'editor') {
      return true;
    }

    // Viewer chỉ được update nếu là assignee
    if (userRole === 'viewer') {
      return taskAssigneeIds?.includes(userId) ?? false;
    }

    return false;
  }

  /**
   * Kiểm tra user có thể edit group không
   */
  async canEditGroup(groupId: string, userId: string): Promise<boolean> {
    return this.checkGroupPermission(groupId, userId, 'leader');
  }

  /**
   * Kiểm tra user có thể delete group không
   */
  async canDeleteGroup(groupId: string, userId: string): Promise<boolean> {
    return this.checkGroupPermission(groupId, userId, 'leader');
  }

  /**
   * Kiểm tra user có thể invite members vào group không
   */
  async canInviteMembers(groupId: string, userId: string): Promise<boolean> {
    return this.checkGroupPermission(groupId, userId, 'leader');
  }

  /**
   * Kiểm tra user có thể manage group members không
   */
  async canManageGroupMembers(
    groupId: string,
    userId: string,
  ): Promise<boolean> {
    return this.checkGroupPermission(groupId, userId, 'leader');
  }

  /**
   * Kiểm tra user có phải là member của project không (bất kỳ role nào)
   */
  async isProjectMember(projectId: string, userId: string): Promise<boolean> {
    const role = await this.getUserProjectRole(projectId, userId);
    return role !== null;
  }

  /**
   * Kiểm tra user có phải là member của group không (bất kỳ role nào)
   */
  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    const role = await this.getUserGroupRole(groupId, userId);
    return role !== null;
  }
}

