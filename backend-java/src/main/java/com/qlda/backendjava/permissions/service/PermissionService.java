package com.qlda.backendjava.permissions.service;

import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.groupmember.entity.GroupMemberEntity;
import com.qlda.backendjava.groupmember.repository.GroupMemberRepository;
import com.qlda.backendjava.groups.entity.GroupEntity;
import com.qlda.backendjava.groups.repository.GroupRepository;
import com.qlda.backendjava.permissions.GroupRole;
import com.qlda.backendjava.permissions.ProjectRole;
import com.qlda.backendjava.projectmember.entity.ProjectMemberEntity;
import com.qlda.backendjava.projectmember.repository.ProjectMemberRepository;
import com.qlda.backendjava.projects.entity.ProjectEntity;
import com.qlda.backendjava.projects.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public GroupRole getUserGroupRole(String groupId, String userId) {
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm."));

        if (group.getLeader().getId().equals(userId)) {
            return GroupRole.leader;
        }

        GroupMemberEntity member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElse(null);

        if (member != null && member.getStatus() == GroupMemberEntity.Status.accepted) {
            return member.getRole() == GroupMemberEntity.Role.leader ? GroupRole.leader : GroupRole.member;
        }

        return null;
    }

    public ProjectRole getUserProjectRole(String projectId, String userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        if (project.getOwner().getId().equals(userId)) {
            return ProjectRole.leader;
        }

        ProjectMemberEntity member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElse(null);

        if (member != null) {
            return switch (member.getRole()) {
                case leader -> ProjectRole.leader;
                case editor -> ProjectRole.editor;
                case viewer -> ProjectRole.viewer;
            };
        }

        return null;
    }

    public boolean checkGroupPermission(String groupId, String userId, List<GroupRole> requiredRoles) {
        GroupRole userRole = getUserGroupRole(groupId, userId);
        if (userRole == null) {
            return false;
        }
        return requiredRoles.contains(userRole);
    }

    public boolean checkProjectPermission(String projectId, String userId, List<ProjectRole> requiredRoles) {
        ProjectRole userRole = getUserProjectRole(projectId, userId);
        if (userRole == null) {
            return false;
        }

        
        if (userRole == ProjectRole.leader) {
            return true;
        }

        return requiredRoles.contains(userRole);
    }

    public boolean canEditGroup(String groupId, String userId) {
        return checkGroupPermission(groupId, userId, Arrays.asList(GroupRole.leader));
    }

    public boolean canDeleteGroup(String groupId, String userId) {
        return checkGroupPermission(groupId, userId, Arrays.asList(GroupRole.leader));
    }

    public boolean canInviteMembers(String groupId, String userId) {
        return checkGroupPermission(groupId, userId, Arrays.asList(GroupRole.leader));
    }

    public boolean canEditProject(String projectId, String userId) {
        return checkProjectPermission(projectId, userId, Arrays.asList(ProjectRole.leader));
    }

    public boolean canDeleteProject(String projectId, String userId) {
        return checkProjectPermission(projectId, userId, Arrays.asList(ProjectRole.leader));
    }

    public boolean canManageMembers(String projectId, String userId) {
        return checkProjectPermission(projectId, userId, Arrays.asList(ProjectRole.leader));
    }

    public boolean canEditTask(String projectId, String userId) {
        return checkProjectPermission(projectId, userId, Arrays.asList(ProjectRole.leader, ProjectRole.editor));
    }

    public boolean canDeleteTask(String projectId, String userId) {
        return checkProjectPermission(projectId, userId, Arrays.asList(ProjectRole.leader, ProjectRole.editor));
    }

    public boolean canEditColumn(String projectId, String userId) {
        return checkProjectPermission(projectId, userId, Arrays.asList(ProjectRole.leader, ProjectRole.editor));
    }

    public boolean canUpdateTaskStatus(String projectId, String userId, List<String> taskAssigneeIds) {
        ProjectRole userRole = getUserProjectRole(projectId, userId);
        if (userRole == null) {
            return false;
        }

        
        if (userRole == ProjectRole.leader || userRole == ProjectRole.editor) {
            return true;
        }

        
        if (userRole == ProjectRole.viewer) {
            return taskAssigneeIds != null && taskAssigneeIds.contains(userId);
        }

        return false;
    }

    public boolean isProjectMember(String projectId, String userId) {
        ProjectRole role = getUserProjectRole(projectId, userId);
        return role != null;
    }

    public boolean isGroupMember(String groupId, String userId) {
        GroupRole role = getUserGroupRole(groupId, userId);
        return role != null;
    }
}

