package com.qlda.backendjava.groups.service;

import com.qlda.backendjava.common.exception.BadRequestException;
import com.qlda.backendjava.common.exception.ForbiddenException;
import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.groupmember.entity.GroupMemberEntity;
import com.qlda.backendjava.groupmember.repository.GroupMemberRepository;
import com.qlda.backendjava.groups.dto.*;
import com.qlda.backendjava.groups.entity.GroupEntity;
import com.qlda.backendjava.groups.repository.GroupRepository;
import com.qlda.backendjava.permissions.service.PermissionService;
import com.qlda.backendjava.users.entity.UserEntity;
import com.qlda.backendjava.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final PermissionService permissionService;

    @Transactional
    public GroupEntity create(CreateGroupDto dto, String userId) {
        UserEntity leader = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        String inviteCode;
        do {
            inviteCode = generateInviteCode();
        } while (groupRepository.findByInviteCode(inviteCode).isPresent());

        GroupEntity group = new GroupEntity();
        group.setName(dto.getName());
        group.setDescription(dto.getDescription());
        group.setInviteCode(inviteCode);
        group.setLeader(leader);

        GroupEntity savedGroup = groupRepository.save(group);

        GroupMemberEntity member = new GroupMemberEntity();
        member.setGroup(savedGroup);
        member.setUser(leader);
        member.setRole(GroupMemberEntity.Role.leader);
        member.setStatus(GroupMemberEntity.Status.accepted);
        groupMemberRepository.save(member);

        return savedGroup;
    }

    public List<Map<String, Object>> findAllByUser(String userId) {
        List<GroupMemberEntity> memberships = groupMemberRepository.findByUserIdAndStatus(
                userId, GroupMemberEntity.Status.accepted);

        return memberships.stream()
                .map(m -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", m.getGroup().getId());
                    result.put("name", m.getGroup().getName());
                    result.put("description", m.getGroup().getDescription());
                    result.put("inviteCode", m.getGroup().getInviteCode());
                    
                    Map<String, Object> leaderInfo = new HashMap<>();
                    leaderInfo.put("id", m.getGroup().getLeader().getId());
                    leaderInfo.put("name", m.getGroup().getLeader().getName());
                    leaderInfo.put("email", m.getGroup().getLeader().getEmail());
                    result.put("leader", leaderInfo);
                    
                    result.put("role", m.getRole().name());
                    result.put("joinedAt", m.getJoinedAt());
                    return result;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> findPendingInvites(String userId) {
        List<GroupMemberEntity> invites = groupMemberRepository.findByUserIdAndStatus(
                userId, GroupMemberEntity.Status.pending_invite);

        return invites.stream()
                .map(m -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("groupId", m.getGroup().getId());
                    result.put("groupName", m.getGroup().getName());
                    
                    Map<String, Object> leaderInfo = new HashMap<>();
                    leaderInfo.put("id", m.getGroup().getLeader().getId());
                    leaderInfo.put("name", m.getGroup().getLeader().getName());
                    leaderInfo.put("email", m.getGroup().getLeader().getEmail());
                    result.put("leader", leaderInfo);
                    
                    result.put("invitedAt", m.getJoinedAt());
                    return result;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> findPendingApprovals(String userId) {
        List<GroupMemberEntity> approvals = groupMemberRepository.findByUserIdAndStatus(
                userId, GroupMemberEntity.Status.pending_approval);

        return approvals.stream()
                .map(m -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("groupId", m.getGroup().getId());
                    result.put("groupName", m.getGroup().getName());
                    
                    Map<String, Object> leaderInfo = new HashMap<>();
                    leaderInfo.put("id", m.getGroup().getLeader().getId());
                    leaderInfo.put("name", m.getGroup().getLeader().getName());
                    leaderInfo.put("email", m.getGroup().getLeader().getEmail());
                    result.put("leader", leaderInfo);
                    
                    result.put("requestedAt", m.getJoinedAt());
                    return result;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, String> acceptInvite(String groupId, String userId) {
        GroupMemberEntity member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lời mời"));

        if (member.getStatus() != GroupMemberEntity.Status.pending_invite) {
            throw new BadRequestException("Lời mời đã được xử lý");
        }

        member.setStatus(GroupMemberEntity.Status.accepted);
        groupMemberRepository.save(member);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã tham gia nhóm thành công");
        return response;
    }

    @Transactional
    public Map<String, String> rejectInvite(String groupId, String userId) {
        GroupMemberEntity member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lời mời"));

        if (member.getStatus() != GroupMemberEntity.Status.pending_invite) {
            throw new BadRequestException("Lời mời đã được xử lý");
        }

        member.setStatus(GroupMemberEntity.Status.rejected);
        groupMemberRepository.save(member);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã từ chối lời mời");
        return response;
    }

    public Map<String, Object> findOne(String id, String userId) {
        GroupEntity group = groupRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm"));

        
        List<GroupMemberEntity> allMembers = groupMemberRepository.findByGroupIdWithUser(id);

        boolean isLeader = group.getLeader().getId().equals(userId);
        boolean isMember = allMembers.stream()
                .anyMatch(m -> m.getUser().getId().equals(userId) && 
                              m.getStatus() == GroupMemberEntity.Status.accepted);
        boolean hasPendingRequest = allMembers.stream()
                .anyMatch(m -> m.getUser().getId().equals(userId) && 
                              (m.getStatus() == GroupMemberEntity.Status.pending_invite || 
                               m.getStatus() == GroupMemberEntity.Status.pending_approval));

        if (!isLeader && !isMember && !hasPendingRequest) {
            throw new ForbiddenException("Bạn không có quyền truy cập nhóm này");
        }

        
        List<Map<String, Object>> membersList = allMembers.stream()
                .map(m -> {
                    Map<String, Object> memberMap = new HashMap<>();
                    memberMap.put("id", m.getUser().getId());
                    memberMap.put("name", m.getUser().getName());
                    memberMap.put("email", m.getUser().getEmail());
                    memberMap.put("avatar", m.getUser().getAvatar());
                    memberMap.put("role", m.getRole().name());
                    memberMap.put("status", m.getStatus().name());
                    memberMap.put("joinedAt", m.getJoinedAt());
                    return memberMap;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("id", group.getId());
        result.put("name", group.getName());
        result.put("description", group.getDescription());
        result.put("inviteCode", group.getInviteCode());
        
        Map<String, Object> leaderInfo = new HashMap<>();
        leaderInfo.put("id", group.getLeader().getId());
        leaderInfo.put("name", group.getLeader().getName());
        leaderInfo.put("email", group.getLeader().getEmail());
        result.put("leader", leaderInfo);
        
        result.put("members", membersList);
        result.put("createdAt", group.getCreatedAt());
        return result;
    }

    @Transactional
    public GroupEntity update(String id, String userId, UpdateGroupDto dto) {
        GroupEntity group = groupRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm"));

        if (!permissionService.canEditGroup(id, userId)) {
            throw new ForbiddenException("Chỉ trưởng nhóm mới được cập nhật");
        }

        if (dto.getName() != null) {
            group.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            group.setDescription(dto.getDescription());
        }

        return groupRepository.save(group);
    }

    @Transactional
    public Map<String, String> remove(String id, String userId) {
        GroupEntity group = groupRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm"));

        if (!permissionService.canDeleteGroup(id, userId)) {
            throw new ForbiddenException("Chỉ trưởng nhóm mới có quyền xóa");
        }

        groupRepository.deleteById(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã giải tán nhóm");
        return response;
    }

    @Transactional
    public Map<String, Object> joinByCode(String userId, JoinGroupDto dto) {
        String inviteCode = dto.getInviteCode().trim().toUpperCase();
        GroupEntity group = groupRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new NotFoundException("Mã nhóm không hợp lệ"));

        if (groupMemberRepository.existsByGroupIdAndUserId(group.getId(), userId)) {
            throw new BadRequestException("Bạn đã tham gia hoặc đang chờ duyệt");
        }

        GroupMemberEntity member = new GroupMemberEntity();
        member.setGroup(group);
        member.setUser(userRepository.findById(userId).orElseThrow());
        member.setRole(GroupMemberEntity.Role.member);
        member.setStatus(GroupMemberEntity.Status.pending_approval);
        groupMemberRepository.save(member);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đã gửi yêu cầu tham gia nhóm. Chờ trưởng nhóm duyệt");
        response.put("groupId", group.getId());
        return response;
    }

    @Transactional
    public Map<String, String> inviteMember(String leaderId, InviteMemberDto dto) {
        GroupEntity group = groupRepository.findById(dto.getGroupId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm"));

        if (!permissionService.canInviteMembers(dto.getGroupId(), leaderId)) {
            throw new ForbiddenException("Chỉ trưởng nhóm mới có quyền mời");
        }

        UserEntity memberUser = null;
        if (dto.getUserId() != null) {
            memberUser = userRepository.findById(dto.getUserId()).orElse(null);
        } else if (dto.getEmail() != null) {
            memberUser = userRepository.findByEmail(dto.getEmail()).orElse(null);
        }

        if (memberUser == null) {
            throw new NotFoundException("Không tìm thấy người dùng cần mời");
        }

        if (groupMemberRepository.existsByGroupIdAndUserId(dto.getGroupId(), memberUser.getId())) {
            throw new BadRequestException("Người dùng đã ở trong nhóm hoặc đang chờ duyệt");
        }

        GroupMemberEntity newMember = new GroupMemberEntity();
        newMember.setGroup(group);
        newMember.setUser(memberUser);
        newMember.setRole(GroupMemberEntity.Role.member);
        newMember.setStatus(GroupMemberEntity.Status.pending_invite);
        groupMemberRepository.save(newMember);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã gửi lời mời thành viên");
        response.put("inviteCode", group.getInviteCode());
        return response;
    }

    @Transactional
    public Map<String, String> approveJoinRequest(String groupId, String userId, String leaderId) {
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm"));

        if (!group.getLeader().getId().equals(leaderId)) {
            throw new ForbiddenException("Chỉ trưởng nhóm mới có quyền duyệt");
        }

        GroupMemberEntity member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy yêu cầu tham gia"));

        if (member.getStatus() != GroupMemberEntity.Status.pending_approval) {
            throw new BadRequestException("Yêu cầu đã được xử lý");
        }

        member.setStatus(GroupMemberEntity.Status.accepted);
        groupMemberRepository.save(member);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã duyệt yêu cầu tham gia nhóm");
        return response;
    }

    @Transactional
    public Map<String, String> rejectJoinRequest(String groupId, String userId, String leaderId) {
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm"));

        if (!group.getLeader().getId().equals(leaderId)) {
            throw new ForbiddenException("Chỉ trưởng nhóm mới có quyền từ chối");
        }

        GroupMemberEntity member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy yêu cầu tham gia"));

        if (member.getStatus() != GroupMemberEntity.Status.pending_approval) {
            throw new BadRequestException("Yêu cầu đã được xử lý");
        }

        member.setStatus(GroupMemberEntity.Status.rejected);
        groupMemberRepository.save(member);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã từ chối yêu cầu tham gia nhóm");
        return response;
    }

    public List<Map<String, Object>> findPendingJoinRequests(String groupId, String leaderId) {
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm"));

        if (!group.getLeader().getId().equals(leaderId)) {
            throw new ForbiddenException("Chỉ trưởng nhóm mới có quyền xem");
        }

        List<GroupMemberEntity> requests = groupMemberRepository.findByGroupIdAndStatus(
                groupId, GroupMemberEntity.Status.pending_approval);

        return requests.stream()
                .map(m -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", m.getUser().getId());
                    result.put("name", m.getUser().getName());
                    result.put("email", m.getUser().getEmail());
                    result.put("avatar", m.getUser().getAvatar());
                    result.put("requestedAt", m.getJoinedAt());
                    return result;
                })
                .collect(Collectors.toList());
    }

    private String generateInviteCode() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}

