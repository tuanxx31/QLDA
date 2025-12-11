package com.qlda.backendjava.projects.controller;

import com.qlda.backendjava.projects.dto.CreateProjectDto;
import com.qlda.backendjava.projects.dto.UpdateProjectDto;
import com.qlda.backendjava.projects.entity.ProjectEntity;
import com.qlda.backendjava.projects.service.ProjectService;
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

@Tag(name = "Projects", description = "API quản lý dự án")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "Tạo dự án mới", description = "Tạo một dự án mới cho người dùng hiện tại")
    @PostMapping
    public ResponseEntity<ProjectEntity> create(
            Authentication authentication,
            @Valid @RequestBody CreateProjectDto dto) {
        String userId = authentication.getName();
        ProjectEntity project = projectService.create(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    @Operation(summary = "Lấy danh sách dự án của người dùng", description = "Lấy tất cả dự án mà người dùng hiện tại tham gia")
    @GetMapping
    public ResponseEntity<List<ProjectEntity>> findAllByUser(Authentication authentication) {
        String userId = authentication.getName();
        List<ProjectEntity> projects = projectService.findAllByUser(userId);
        return ResponseEntity.ok(projects);
    }

    @Operation(summary = "Lấy danh sách dự án theo nhóm", description = "Lấy tất cả dự án thuộc một nhóm cụ thể")
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<ProjectEntity>> findAllByGroup(
            @PathVariable String groupId,
            Authentication authentication) {
        String userId = authentication.getName();
        List<ProjectEntity> projects = projectService.findAllByGroup(groupId, userId);
        return ResponseEntity.ok(projects);
    }

    @Operation(summary = "Lấy thông tin dự án", description = "Lấy thông tin chi tiết của một dự án theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProjectEntity> findOne(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        ProjectEntity project = projectService.findOne(id, userId);
        return ResponseEntity.ok(project);
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<Map<String, Object>> getProjectProgress(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, Object> progress = projectService.getProjectProgress(id, userId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{id}/progress/columns")
    public ResponseEntity<List<Map<String, Object>>> getColumnProgress(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        List<Map<String, Object>> progress = projectService.getColumnProgress(id, userId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{id}/progress/users")
    public ResponseEntity<List<Map<String, Object>>> getUserProgress(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        List<Map<String, Object>> progress = projectService.getUserProgress(id, userId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{id}/progress/deadline-summary")
    public ResponseEntity<Map<String, Object>> getDeadlineSummary(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, Object> summary = projectService.getDeadlineSummary(id, userId);
        return ResponseEntity.ok(summary);
    }

    @Operation(summary = "Cập nhật dự án", description = "Cập nhật thông tin của một dự án")
    @PatchMapping("/{id}")
    public ResponseEntity<ProjectEntity> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateProjectDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        ProjectEntity project = projectService.update(id, dto, userId);
        return ResponseEntity.ok(project);
    }

    @Operation(summary = "Xóa dự án", description = "Xóa một dự án khỏi hệ thống")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> remove(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = projectService.remove(id, userId);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/convert-to-group/{groupId}")
    public ResponseEntity<Map<String, String>> convertToGroup(
            @PathVariable String id,
            @PathVariable String groupId,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = projectService.convertToGroup(id, groupId, userId);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/remove-group")
    public ResponseEntity<Map<String, String>> removeGroup(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = projectService.removeGroup(id, userId);
        return ResponseEntity.ok(result);
    }
}

