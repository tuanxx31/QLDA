package com.qlda.backend.projects.controller;

import com.qlda.backend.common.ApiResponse;
import com.qlda.backend.projects.dto.CreateProjectDto;
import com.qlda.backend.projects.dto.UpdateProjectDto;
import com.qlda.backend.projects.entity.ProjectEntity;
import com.qlda.backend.projects.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectEntity>> create(
            Authentication authentication,
            @Valid @RequestBody CreateProjectDto dto) {
        String userId = authentication.getName();
        ProjectEntity project = projectService.create(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(project));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectEntity>>> findAllByUser(Authentication authentication) {
        String userId = authentication.getName();
        List<ProjectEntity> projects = projectService.findAllByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<ApiResponse<List<ProjectEntity>>> findAllByGroup(
            @PathVariable String groupId,
            Authentication authentication) {
        String userId = authentication.getName();
        List<ProjectEntity> projects = projectService.findAllByGroup(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectEntity>> findOne(@PathVariable String id) {
        ProjectEntity project = projectService.findOne(id);
        return ResponseEntity.ok(ApiResponse.success(project));
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProjectProgress(@PathVariable String id) {
        Map<String, Object> progress = projectService.getProjectProgress(id);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }

    @GetMapping("/{id}/progress/columns")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getColumnProgress(@PathVariable String id) {
        List<Map<String, Object>> progress = projectService.getColumnProgress(id);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }

    @GetMapping("/{id}/progress/users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUserProgress(@PathVariable String id) {
        List<Map<String, Object>> progress = projectService.getUserProgress(id);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }

    @GetMapping("/{id}/progress/deadline-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeadlineSummary(@PathVariable String id) {
        Map<String, Object> summary = projectService.getDeadlineSummary(id);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectEntity>> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateProjectDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        ProjectEntity project = projectService.update(id, dto, userId);
        return ResponseEntity.ok(ApiResponse.success(project));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> remove(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = projectService.remove(id, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PatchMapping("/{id}/convert-to-group/{groupId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> convertToGroup(
            @PathVariable String id,
            @PathVariable String groupId,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = projectService.convertToGroup(id, groupId, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PatchMapping("/{id}/remove-group")
    public ResponseEntity<ApiResponse<Map<String, String>>> removeGroup(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = projectService.removeGroup(id, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

