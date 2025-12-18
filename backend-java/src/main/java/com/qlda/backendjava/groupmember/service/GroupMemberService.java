package com.qlda.backendjava.groupmember.service;

import com.qlda.backendjava.common.exception.BadRequestException;
import com.qlda.backendjava.common.exception.ForbiddenException;
import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.groupmember.dto.LeaveGroupDto;
import com.qlda.backendjava.groupmember.entity.GroupMemberEntity;
import com.qlda.backendjava.groupmember.repository.GroupMemberRepository;
import com.qlda.backendjava.groups.entity.GroupEntity;
import com.qlda.backendjava.groups.repository.GroupRepository;
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
public class GroupMemberService {

    private final GroupMemberRepository groupMemberRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public List<Map<String, Object>> findAllByGroup(String groupId) {
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm"));

        List<GroupMemberEntity> members = groupMemberRepository.findByGroupIdWithUser(groupId);

        return members.stream()
                .map(m -> {
                    Map<String, Object> memberMap = new HashMap<>();
                    memberMap.put("id", m.getUser().getId());
                    memberMap.put("name", m.getUser().getName());
                    memberMap.put("email", m.getUser().getEmail());
                    memberMap.put("avatar", m.getUser().getAvatar());
                    memberMap.put("role", m.getRole().name());
                    memberMap.put("joinedAt", m.getJoinedAt());
                    return memberMap;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, String> leaveGroup(String userId, LeaveGroupDto dto) {
        String groupId = dto.getGroupId();

        GroupMemberEntity member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new NotFoundException("Bạn không thuộc nhóm này"));

        if (member.getRole() == GroupMemberEntity.Role.leader) {
            throw new ForbiddenException("Trưởng nhóm không thể rời nhóm, hãy giải tán nhóm thay vào đó.");
        }

        groupMemberRepository.deleteById(member.getId());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã rời nhóm thành công");
        return response;
    }

    @Transactional
    public Map<String, String> transferLeader(String leaderId, String groupId, String newLeaderId) {
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm"));

        if (!group.getLeader().getId().equals(leaderId)) {
            throw new ForbiddenException("Bạn không phải trưởng nhóm");
        }

        if (leaderId.equals(newLeaderId)) {
            throw new BadRequestException("Bạn đã là trưởng nhóm");
        }

        GroupMemberEntity targetMember = groupMemberRepository.findByGroupIdAndUserId(groupId, newLeaderId)
                .orElseThrow(() -> new NotFoundException("Người được chọn chưa là thành viên nhóm"));

        if (targetMember.getStatus() != GroupMemberEntity.Status.accepted) {
            throw new BadRequestException("Người được chọn chưa được chấp nhận vào nhóm");
        }

        GroupMemberEntity currentLeader = groupMemberRepository.findByGroupIdAndUserId(groupId, leaderId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thành viên trưởng nhóm hiện tại"));

        currentLeader.setRole(GroupMemberEntity.Role.member);
        targetMember.setRole(GroupMemberEntity.Role.leader);

        groupMemberRepository.save(currentLeader);
        groupMemberRepository.save(targetMember);

        UserEntity newLeader = userRepository.findById(newLeaderId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng để chuyển quyền"));

        group.setLeader(newLeader);
        groupRepository.save(group);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã chuyển quyền trưởng nhóm thành công");
        return response;
    }

    @Transactional
    public Map<String, String> removeMember(String leaderId, String groupId, String userId) {
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm"));

        if (!group.getLeader().getId().equals(leaderId)) {
            throw new ForbiddenException("Chỉ trưởng nhóm mới có thể xóa thành viên");
        }

        GroupMemberEntity member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thành viên này"));

        if (member.getRole() == GroupMemberEntity.Role.leader) {
            throw new BadRequestException("Không thể xóa trưởng nhóm");
        }

        groupMemberRepository.deleteById(member.getId());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã xóa thành viên khỏi nhóm");
        return response;
    }
}

