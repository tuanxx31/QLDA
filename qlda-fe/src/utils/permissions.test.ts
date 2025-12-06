import {
  hasProjectPermission,
  hasGroupPermission,
  canEditProject,
  canDeleteProject,
  canManageMembers,
  canEditTasks,
  canDeleteTasks,
  canEditColumns,
  canViewProject,
  canEditGroup,
  canDeleteGroup,
  canInviteMembers,
  canManageGroupMembers,
  canViewGroup,
} from './permissions';
import type { ProjectRole, GroupRole } from '@/types/permission.type';

describe('Permission Utilities', () => {
  describe('hasProjectPermission', () => {
    it('should return true if user has required role', () => {
      expect(hasProjectPermission('editor', 'editor')).toBe(true);
      expect(hasProjectPermission('leader', 'leader')).toBe(true);
      expect(hasProjectPermission('viewer', 'viewer')).toBe(true);
    });

    it('should return true if user has one of required roles', () => {
      expect(hasProjectPermission('editor', ['editor', 'viewer'])).toBe(true);
      expect(hasProjectPermission('viewer', ['editor', 'viewer'])).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      expect(hasProjectPermission('viewer', 'editor')).toBe(false);
      expect(hasProjectPermission('editor', 'leader')).toBe(false);
    });

    it('should return true if user is leader (leader has all permissions)', () => {
      expect(hasProjectPermission('leader', 'viewer')).toBe(true);
      expect(hasProjectPermission('leader', 'editor')).toBe(true);
      expect(hasProjectPermission('leader', ['viewer', 'editor'])).toBe(true);
    });

    it('should return false if role is null', () => {
      expect(hasProjectPermission(null, 'viewer')).toBe(false);
      expect(hasProjectPermission(null, ['viewer', 'editor'])).toBe(false);
    });
  });

  describe('hasGroupPermission', () => {
    it('should return true if user has required role', () => {
      expect(hasGroupPermission('leader', 'leader')).toBe(true);
      expect(hasGroupPermission('member', 'member')).toBe(true);
    });

    it('should return true if user has one of required roles', () => {
      expect(hasGroupPermission('member', ['leader', 'member'])).toBe(true);
      expect(hasGroupPermission('leader', ['leader', 'member'])).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      expect(hasGroupPermission('member', 'leader')).toBe(false);
    });

    it('should return false if role is null', () => {
      expect(hasGroupPermission(null, 'leader')).toBe(false);
      expect(hasGroupPermission(null, ['leader', 'member'])).toBe(false);
    });
  });

  describe('Project Permission Helpers', () => {
    it('canEditProject should return true only for leader', () => {
      expect(canEditProject('leader')).toBe(true);
      expect(canEditProject('editor')).toBe(false);
      expect(canEditProject('viewer')).toBe(false);
      expect(canEditProject(null)).toBe(false);
    });

    it('canDeleteProject should return true only for leader', () => {
      expect(canDeleteProject('leader')).toBe(true);
      expect(canDeleteProject('editor')).toBe(false);
      expect(canDeleteProject('viewer')).toBe(false);
      expect(canDeleteProject(null)).toBe(false);
    });

    it('canManageMembers should return true only for leader', () => {
      expect(canManageMembers('leader')).toBe(true);
      expect(canManageMembers('editor')).toBe(false);
      expect(canManageMembers('viewer')).toBe(false);
      expect(canManageMembers(null)).toBe(false);
    });

    it('canEditTasks should return true for leader and editor', () => {
      expect(canEditTasks('leader')).toBe(true);
      expect(canEditTasks('editor')).toBe(true);
      expect(canEditTasks('viewer')).toBe(false);
      expect(canEditTasks(null)).toBe(false);
    });

    it('canDeleteTasks should return true for leader and editor', () => {
      expect(canDeleteTasks('leader')).toBe(true);
      expect(canDeleteTasks('editor')).toBe(true);
      expect(canDeleteTasks('viewer')).toBe(false);
      expect(canDeleteTasks(null)).toBe(false);
    });

    it('canEditColumns should return true for leader and editor', () => {
      expect(canEditColumns('leader')).toBe(true);
      expect(canEditColumns('editor')).toBe(true);
      expect(canEditColumns('viewer')).toBe(false);
      expect(canEditColumns(null)).toBe(false);
    });

    it('canViewProject should return true for any role', () => {
      expect(canViewProject('leader')).toBe(true);
      expect(canViewProject('editor')).toBe(true);
      expect(canViewProject('viewer')).toBe(true);
      expect(canViewProject(null)).toBe(false);
    });
  });

  describe('Group Permission Helpers', () => {
    it('canEditGroup should return true only for leader', () => {
      expect(canEditGroup('leader')).toBe(true);
      expect(canEditGroup('member')).toBe(false);
      expect(canEditGroup(null)).toBe(false);
    });

    it('canDeleteGroup should return true only for leader', () => {
      expect(canDeleteGroup('leader')).toBe(true);
      expect(canDeleteGroup('member')).toBe(false);
      expect(canDeleteGroup(null)).toBe(false);
    });

    it('canInviteMembers should return true only for leader', () => {
      expect(canInviteMembers('leader')).toBe(true);
      expect(canInviteMembers('member')).toBe(false);
      expect(canInviteMembers(null)).toBe(false);
    });

    it('canManageGroupMembers should return true only for leader', () => {
      expect(canManageGroupMembers('leader')).toBe(true);
      expect(canManageGroupMembers('member')).toBe(false);
      expect(canManageGroupMembers(null)).toBe(false);
    });

    it('canViewGroup should return true for any role', () => {
      expect(canViewGroup('leader')).toBe(true);
      expect(canViewGroup('member')).toBe(true);
      expect(canViewGroup(null)).toBe(false);
    });
  });
});

