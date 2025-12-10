package com.qlda.backend.projectmember.controller;

import com.qlda.backend.common.ApiResponse;
import com.qlda.backend.projectmember.dto.AddProjectMembersDto;
import com.qlda.backend.projectmember.dto.CreateProjectMemberDto;
import com.qlda.backend.projectmember.dto.UpdateProjectMemberDto;
import com.qlda.backend.projectmember.entity.ProjectMemberEntity;
import com.qlda.backend.projectmember.service.ProjectMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/project-members")
@RequiredArgsConstructor
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMembers(
            @PathVariable String projectId,
            @RequestParam(required = false) String taskId) {
        // TODO: Get excludeUserIds from taskId if provided
        List<String> excludeUserIds = List.of();
        List<Map<String, Object>> members = projectMemberService.getMembers(projectId, excludeUserIds);
        return ResponseEntity.ok(ApiResponse.success(members));
    }

    @PostMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectMemberEntity>> addMember(
            @PathVariable String projectId,
            @Valid @RequestBody CreateProjectMemberDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        ProjectMemberEntity member = projectMemberService.addMember(projectId, dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(member));
    }

    @PostMapping("/{projectId}/add-members")
    public ResponseEntity<ApiResponse<List<ProjectMemberEntity>>> addMembers(
            @PathVariable String projectId,
            @Valid @RequestBody AddProjectMembersDto dto) {
        List<ProjectMemberEntity> members = projectMemberService.addMembers(projectId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(members));
    }

    @PatchMapping("/{projectId}/{memberId}")
    public ResponseEntity<ApiResponse<ProjectMemberEntity>> updateMemberRole(
            @PathVariable String projectId,
            @PathVariable String memberId,
            @Valid @RequestBody UpdateProjectMemberDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        ProjectMemberEntity member = projectMemberService.updateMemberRole(projectId, memberId, dto, userId);
        return ResponseEntity.ok(ApiResponse.success(member));
    }

    @DeleteMapping("/{projectId}/{memberId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> removeMember(
            @PathVariable String projectId,
            @PathVariable String memberId,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = projectMemberService.removeMember(projectId, memberId, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PutMapping("/{projectId}/transfer-leader/{newLeaderId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> transferLeader(
            @PathVariable String projectId,
            @PathVariable String newLeaderId,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = projectMemberService.transferLeader(projectId, newLeaderId, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

