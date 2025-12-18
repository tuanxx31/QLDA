package com.qlda.backendjava.groupmember.controller;

import com.qlda.backendjava.groupmember.dto.LeaveGroupDto;
import com.qlda.backendjava.groupmember.service.GroupMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Group Members", description = "API quản lý thành viên nhóm")
@RestController
@RequestMapping("/api/group-members")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class GroupMemberController {

    private final GroupMemberService groupMemberService;

    @GetMapping("/{groupId}")
    @Operation(summary = "Lấy danh sách thành viên của nhóm")
    public ResponseEntity<List<Map<String, Object>>> findAll(@PathVariable String groupId) {
        List<Map<String, Object>> members = groupMemberService.findAllByGroup(groupId);
        return ResponseEntity.ok(members);
    }

    @PostMapping("/leave")
    @Operation(summary = "Rời khỏi nhóm")
    public ResponseEntity<Map<String, String>> leaveGroup(
            Authentication authentication,
            @Valid @RequestBody LeaveGroupDto dto) {
        String userId = authentication.getName();
        Map<String, String> result = groupMemberService.leaveGroup(userId, dto);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{groupId}/{userId}")
    @Operation(summary = "Xóa thành viên khỏi nhóm (chỉ leader)")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable String groupId,
            @PathVariable String userId,
            Authentication authentication) {
        String leaderId = authentication.getName();
        Map<String, String> result = groupMemberService.removeMember(leaderId, groupId, userId);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{groupId}/transfer-leader/{userId}")
    @Operation(summary = "Chuyển quyền trưởng nhóm")
    public ResponseEntity<Map<String, String>> transferLeader(
            @PathVariable String groupId,
            @PathVariable String userId,
            Authentication authentication) {
        String leaderId = authentication.getName();
        Map<String, String> result = groupMemberService.transferLeader(leaderId, groupId, userId);
        return ResponseEntity.ok(result);
    }
}

