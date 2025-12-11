package com.qlda.backendjava.projectmember.service;

import com.qlda.backendjava.common.exception.BadRequestException;
import com.qlda.backendjava.common.exception.ForbiddenException;
import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.projectmember.dto.AddProjectMembersDto;
import com.qlda.backendjava.projectmember.dto.CreateProjectMemberDto;
import com.qlda.backendjava.projectmember.dto.UpdateProjectMemberDto;
import com.qlda.backendjava.projectmember.entity.ProjectMemberEntity;
import com.qlda.backendjava.projectmember.repository.ProjectMemberRepository;
import com.qlda.backendjava.projects.entity.ProjectEntity;
import com.qlda.backendjava.projects.repository.ProjectRepository;
import com.qlda.backendjava.users.entity.UserEntity;
import com.qlda.backendjava.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<Map<String, Object>> getMembers(String projectId, List<String> excludeUserIds, String userId) {
        // Kiểm tra quyền truy cập project
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));
        
        // Kiểm tra owner
        boolean isOwner = project.getOwner().getId().equals(userId);
        
        // Kiểm tra member
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
        
        if (!isOwner && !isMember) {
            throw new ForbiddenException("Bạn không có quyền truy cập dự án này.");
        }
        
        List<ProjectMemberEntity> members;
        if (excludeUserIds != null && !excludeUserIds.isEmpty()) {
            members = projectMemberRepository.findByProjectIdExcludingUsers(projectId, excludeUserIds);
        } else {
            members = projectMemberRepository.findByProjectIdWithUser(projectId);
        }

        return members.stream()
                .map(m -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", m.getId());
                    result.put("user", m.getUser());
                    result.put("role", m.getRole().name());
                    result.put("joinedAt", m.getJoinedAt());
                    return result;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectMemberEntity addMember(String projectId, CreateProjectMemberDto dto, String userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        ProjectMemberEntity actor = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElse(null);
        if (actor == null || (actor.getRole() != ProjectMemberEntity.Role.leader && 
                              actor.getRole() != ProjectMemberEntity.Role.editor)) {
            throw new ForbiddenException("Không có quyền thêm thành viên.");
        }

        UserEntity user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng."));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId())) {
            throw new BadRequestException("Người dùng đã nằm trong dự án.");
        }

        List<ProjectMemberEntity> existingMembers = projectMemberRepository.findByProjectId(projectId);
        boolean hasLeader = existingMembers.stream()
                .anyMatch(m -> m.getRole() == ProjectMemberEntity.Role.leader);

        ProjectMemberEntity.Role role = ProjectMemberEntity.Role.valueOf(dto.getRole());
        if (role == ProjectMemberEntity.Role.leader && hasLeader) {
            throw new BadRequestException(
                    "Dự án đã có trưởng dự án. Mỗi dự án chỉ có thể có 1 trưởng dự án. Vui lòng sử dụng chức năng chuyển quyền để thay đổi trưởng dự án.");
        }

        ProjectMemberEntity newMember = new ProjectMemberEntity();
        newMember.setProject(project);
        newMember.setUser(user);
        newMember.setRole(role);

        if (role == ProjectMemberEntity.Role.leader) {
            project.setOwner(user);
            projectRepository.save(project);
        }

        return projectMemberRepository.save(newMember);
    }

    @Transactional
    public List<ProjectMemberEntity> addMembers(String projectId, AddProjectMembersDto dto) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        List<UserEntity> users = userRepository.findAllById(dto.getUserIds());
        if (users.size() != dto.getUserIds().size()) {
            throw new NotFoundException("Không tìm thấy người dùng.");
        }

        List<ProjectMemberEntity> existingMembers = projectMemberRepository.findByProjectId(projectId);
        List<String> existingUserIds = existingMembers.stream()
                .map(m -> m.getUser().getId())
                .collect(Collectors.toList());

        boolean hasConflict = users.stream()
                .anyMatch(u -> existingUserIds.contains(u.getId()));
        if (hasConflict) {
            throw new BadRequestException("Người dùng đã nằm trong dự án.");
        }

        boolean hasLeader = existingMembers.stream()
                .anyMatch(m -> m.getRole() == ProjectMemberEntity.Role.leader);

        ProjectMemberEntity.Role role = ProjectMemberEntity.Role.valueOf(dto.getRole());
        if (role == ProjectMemberEntity.Role.leader && hasLeader) {
            throw new BadRequestException(
                    "Dự án đã có trưởng dự án. Mỗi dự án chỉ có thể có 1 trưởng dự án. Vui lòng sử dụng chức năng chuyển quyền để thay đổi trưởng dự án.");
        }

        List<ProjectMemberEntity> newMembers = users.stream()
                .map(user -> {
                    ProjectMemberEntity member = new ProjectMemberEntity();
                    member.setProject(project);
                    member.setUser(user);
                    member.setRole(role);
                    return member;
                })
                .collect(Collectors.toList());

        if (role == ProjectMemberEntity.Role.leader && !users.isEmpty()) {
            project.setOwner(users.get(0));
            projectRepository.save(project);
        }

        return projectMemberRepository.saveAll(newMembers);
    }

    @Transactional
    public ProjectMemberEntity updateMemberRole(String projectId, String memberId, 
                                                 UpdateProjectMemberDto dto, String userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        ProjectMemberEntity actor = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElse(null);
        if (actor == null || actor.getRole() != ProjectMemberEntity.Role.leader) {
            throw new ForbiddenException("Chỉ leader mới có quyền chỉnh sửa vai trò.");
        }

        ProjectMemberEntity member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thành viên."));

        ProjectMemberEntity.Role newRole = ProjectMemberEntity.Role.valueOf(dto.getRole());
        
        if (newRole == ProjectMemberEntity.Role.leader) {
            List<ProjectMemberEntity> existingMembers = projectMemberRepository.findByProjectId(projectId);
            boolean hasOtherLeader = existingMembers.stream()
                    .anyMatch(m -> m.getRole() == ProjectMemberEntity.Role.leader && !m.getId().equals(memberId));
            if (hasOtherLeader) {
                throw new BadRequestException(
                        "Dự án đã có trưởng dự án. Mỗi dự án chỉ có thể có 1 trưởng dự án. Vui lòng sử dụng chức năng chuyển quyền để thay đổi trưởng dự án.");
            }
            project.setOwner(member.getUser());
            projectRepository.save(project);
        }

        member.setRole(newRole);
        return projectMemberRepository.save(member);
    }

    @Transactional
    public Map<String, String> removeMember(String projectId, String memberId, String userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        ProjectMemberEntity actor = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElse(null);
        if (actor == null || (actor.getRole() != ProjectMemberEntity.Role.leader && 
                              actor.getRole() != ProjectMemberEntity.Role.editor)) {
            throw new ForbiddenException("Không có quyền xóa thành viên.");
        }

        ProjectMemberEntity member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thành viên."));

        projectMemberRepository.delete(member);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã xóa thành viên khỏi dự án.");
        return response;
    }

    @Transactional
    public Map<String, String> transferLeader(String projectId, String newLeaderId, String userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        ProjectMemberEntity currentLeader = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElse(null);
        if (currentLeader == null || currentLeader.getRole() != ProjectMemberEntity.Role.leader) {
            throw new ForbiddenException("Chỉ leader hiện tại mới có thể chuyển quyền.");
        }

        ProjectMemberEntity newLeader = projectMemberRepository.findByProjectIdAndUserId(projectId, newLeaderId)
                .orElseThrow(() -> new NotFoundException("Người được chọn không nằm trong dự án."));

        currentLeader.setRole(ProjectMemberEntity.Role.editor);
        newLeader.setRole(ProjectMemberEntity.Role.leader);

        project.setOwner(newLeader.getUser());
        projectRepository.save(project);

        projectMemberRepository.save(currentLeader);
        projectMemberRepository.save(newLeader);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã chuyển quyền trưởng dự án.");
        return response;
    }
}

