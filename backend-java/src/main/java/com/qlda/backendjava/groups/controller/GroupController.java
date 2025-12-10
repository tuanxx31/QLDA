package com.qlda.backendjava.groups.controller;

import com.qlda.backendjava.groups.dto.*;
import com.qlda.backendjava.groups.entity.GroupEntity;
import com.qlda.backendjava.groups.service.GroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Groups", description = "API quản lý nhóm làm việc")
@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class GroupController {

    private final GroupService groupService;

    @Operation(summary = "Tạo nhóm mới", description = "Tạo một nhóm làm việc mới")
    @PostMapping
    public ResponseEntity<GroupEntity> createGroup(
            Authentication authentication,
            @Valid @RequestBody CreateGroupDto dto) {
        String userId = authentication.getName();
        GroupEntity group = groupService.create(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(group);
    }

    @Operation(summary = "Lấy danh sách nhóm của tôi", description = "Lấy tất cả nhóm mà người dùng hiện tại tham gia")
    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> findMyGroups(Authentication authentication) {
        String userId = authentication.getName();
        List<Map<String, Object>> groups = groupService.findAllByUser(userId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/pending-invites")
    public ResponseEntity<List<Map<String, Object>>> findPendingInvites(Authentication authentication) {
        String userId = authentication.getName();
        List<Map<String, Object>> invites = groupService.findPendingInvites(userId);
        return ResponseEntity.ok(invites);
    }

    @GetMapping("/pending-approvals")
    public ResponseEntity<List<Map<String, Object>>> findPendingApprovals(Authentication authentication) {
        String userId = authentication.getName();
        List<Map<String, Object>> approvals = groupService.findPendingApprovals(userId);
        return ResponseEntity.ok(approvals);
    }

    @PostMapping("/accept-invite/{groupId}")
    public ResponseEntity<Map<String, String>> acceptInvite(
            @PathVariable String groupId,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = groupService.acceptInvite(groupId, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reject-invite/{groupId}")
    public ResponseEntity<Map<String, String>> rejectInvite(
            @PathVariable String groupId,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = groupService.rejectInvite(groupId, userId);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Lấy thông tin nhóm", description = "Lấy thông tin chi tiết của một nhóm theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> findOne(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, Object> group = groupService.findOne(id, userId);
        return ResponseEntity.ok(group);
    }

    @Operation(summary = "Cập nhật nhóm", description = "Cập nhật thông tin của một nhóm")
    @PutMapping("/{id}")
    public ResponseEntity<GroupEntity> updateGroup(
            @PathVariable String id,
            Authentication authentication,
            @Valid @RequestBody UpdateGroupDto dto) {
        String userId = authentication.getName();
        GroupEntity group = groupService.update(id, userId, dto);
        return ResponseEntity.ok(group);
    }

    @Operation(summary = "Xóa nhóm", description = "Xóa một nhóm khỏi hệ thống")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> removeGroup(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = groupService.remove(id, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/join")
    public ResponseEntity<Map<String, Object>> joinGroup(
            Authentication authentication,
            @Valid @RequestBody JoinGroupDto dto) {
        String userId = authentication.getName();
        Map<String, Object> result = groupService.joinByCode(userId, dto);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/invite")
    public ResponseEntity<Map<String, String>> inviteMember(
            Authentication authentication,
            @Valid @RequestBody InviteMemberDto dto) {
        String userId = authentication.getName();
        Map<String, String> result = groupService.inviteMember(userId, dto);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{groupId}/approve-join/{userId}")
    public ResponseEntity<Map<String, String>> approveJoinRequest(
            @PathVariable String groupId,
            @PathVariable String userId,
            Authentication authentication) {
        String leaderId = authentication.getName();
        Map<String, String> result = groupService.approveJoinRequest(groupId, userId, leaderId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{groupId}/reject-join/{userId}")
    public ResponseEntity<Map<String, String>> rejectJoinRequest(
            @PathVariable String groupId,
            @PathVariable String userId,
            Authentication authentication) {
        String leaderId = authentication.getName();
        Map<String, String> result = groupService.rejectJoinRequest(groupId, userId, leaderId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/pending-join-requests")
    public ResponseEntity<List<Map<String, Object>>> findPendingJoinRequests(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        List<Map<String, Object>> requests = groupService.findPendingJoinRequests(id, userId);
        return ResponseEntity.ok(requests);
    }
}

