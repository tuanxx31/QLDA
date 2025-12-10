package com.qlda.backendjava.projectmember.controller;

import com.qlda.backendjava.projectmember.dto.AddProjectMembersDto;
import com.qlda.backendjava.projectmember.dto.CreateProjectMemberDto;
import com.qlda.backendjava.projectmember.dto.UpdateProjectMemberDto;
import com.qlda.backendjava.projectmember.entity.ProjectMemberEntity;
import com.qlda.backendjava.projectmember.service.ProjectMemberService;
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

@Tag(name = "Project Members", description = "API quản lý thành viên dự án")
@RestController
@RequestMapping("/api/project-members")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    @GetMapping("/{projectId}")
    public ResponseEntity<List<Map<String, Object>>> getMembers(
            @PathVariable String projectId,
            @RequestParam(required = false) String taskId) {
        // TODO: Get excludeUserIds from taskId if provided
        List<String> excludeUserIds = List.of();
        List<Map<String, Object>> members = projectMemberService.getMembers(projectId, excludeUserIds);
        return ResponseEntity.ok(members);
    }

    @PostMapping("/{projectId}")
    public ResponseEntity<ProjectMemberEntity> addMember(
            @PathVariable String projectId,
            @Valid @RequestBody CreateProjectMemberDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        ProjectMemberEntity member = projectMemberService.addMember(projectId, dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    @PostMapping("/{projectId}/add-members")
    public ResponseEntity<List<ProjectMemberEntity>> addMembers(
            @PathVariable String projectId,
            @Valid @RequestBody AddProjectMembersDto dto) {
        List<ProjectMemberEntity> members = projectMemberService.addMembers(projectId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(members);
    }

    @PatchMapping("/{projectId}/{memberId}")
    public ResponseEntity<ProjectMemberEntity> updateMemberRole(
            @PathVariable String projectId,
            @PathVariable String memberId,
            @Valid @RequestBody UpdateProjectMemberDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        ProjectMemberEntity member = projectMemberService.updateMemberRole(projectId, memberId, dto, userId);
        return ResponseEntity.ok(member);
    }

    @DeleteMapping("/{projectId}/{memberId}")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable String projectId,
            @PathVariable String memberId,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = projectMemberService.removeMember(projectId, memberId, userId);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{projectId}/transfer-leader/{newLeaderId}")
    public ResponseEntity<Map<String, String>> transferLeader(
            @PathVariable String projectId,
            @PathVariable String newLeaderId,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = projectMemberService.transferLeader(projectId, newLeaderId, userId);
        return ResponseEntity.ok(result);
    }
}

