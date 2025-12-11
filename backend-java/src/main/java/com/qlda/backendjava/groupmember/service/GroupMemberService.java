package com.qlda.backendjava.groupmember.service;

import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.groupmember.entity.GroupMemberEntity;
import com.qlda.backendjava.groupmember.repository.GroupMemberRepository;
import com.qlda.backendjava.groups.entity.GroupEntity;
import com.qlda.backendjava.groups.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupMemberService {

    private final GroupMemberRepository groupMemberRepository;
    private final GroupRepository groupRepository;

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
}

