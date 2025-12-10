package com.qlda.backend.groups.controller;

import com.qlda.backend.common.ApiResponse;
import com.qlda.backend.groups.dto.*;
import com.qlda.backend.groups.entity.GroupEntity;
import com.qlda.backend.groups.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<ApiResponse<GroupEntity>> createGroup(
            Authentication authentication,
            @Valid @RequestBody CreateGroupDto dto) {
        String userId = authentication.getName();
        GroupEntity group = groupService.create(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(group));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> findMyGroups(Authentication authentication) {
        String userId = authentication.getName();
        List<Map<String, Object>> groups = groupService.findAllByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    @GetMapping("/pending-invites")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> findPendingInvites(Authentication authentication) {
        String userId = authentication.getName();
        List<Map<String, Object>> invites = groupService.findPendingInvites(userId);
        return ResponseEntity.ok(ApiResponse.success(invites));
    }

    @GetMapping("/pending-approvals")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> findPendingApprovals(Authentication authentication) {
        String userId = authentication.getName();
        List<Map<String, Object>> approvals = groupService.findPendingApprovals(userId);
        return ResponseEntity.ok(ApiResponse.success(approvals));
    }

    @PostMapping("/accept-invite/{groupId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> acceptInvite(
            @PathVariable String groupId,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = groupService.acceptInvite(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/reject-invite/{groupId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> rejectInvite(
            @PathVariable String groupId,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = groupService.rejectInvite(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> findOne(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, Object> group = groupService.findOne(id, userId);
        return ResponseEntity.ok(ApiResponse.success(group));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GroupEntity>> updateGroup(
            @PathVariable String id,
            Authentication authentication,
            @Valid @RequestBody UpdateGroupDto dto) {
        String userId = authentication.getName();
        GroupEntity group = groupService.update(id, userId, dto);
        return ResponseEntity.ok(ApiResponse.success(group));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> removeGroup(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = groupService.remove(id, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<Map<String, Object>>> joinGroup(
            Authentication authentication,
            @Valid @RequestBody JoinGroupDto dto) {
        String userId = authentication.getName();
        Map<String, Object> result = groupService.joinByCode(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<Map<String, String>>> inviteMember(
            Authentication authentication,
            @Valid @RequestBody InviteMemberDto dto) {
        String userId = authentication.getName();
        Map<String, String> result = groupService.inviteMember(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/{groupId}/approve-join/{userId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> approveJoinRequest(
            @PathVariable String groupId,
            @PathVariable String userId,
            Authentication authentication) {
        String leaderId = authentication.getName();
        Map<String, String> result = groupService.approveJoinRequest(groupId, userId, leaderId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/{groupId}/reject-join/{userId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> rejectJoinRequest(
            @PathVariable String groupId,
            @PathVariable String userId,
            Authentication authentication) {
        String leaderId = authentication.getName();
        Map<String, String> result = groupService.rejectJoinRequest(groupId, userId, leaderId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}/pending-join-requests")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> findPendingJoinRequests(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        List<Map<String, Object>> requests = groupService.findPendingJoinRequests(id, userId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }
}

