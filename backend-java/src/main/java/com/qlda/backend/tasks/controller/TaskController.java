package com.qlda.backend.tasks.controller;

import com.qlda.backend.common.ApiResponse;
import com.qlda.backend.tasks.dto.*;
import com.qlda.backend.tasks.entity.TaskEntity;
import com.qlda.backend.tasks.service.TaskService;
import com.qlda.backend.subtasks.entity.SubTaskEntity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskEntity>> findOne(@PathVariable String id) {
        TaskEntity task = taskService.findOne(id);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @GetMapping("/{id}/assignees")
    public ResponseEntity<ApiResponse<List<com.qlda.backend.users.entity.UserEntity>>> getAssignees(@PathVariable String id) {
        List<com.qlda.backend.users.entity.UserEntity> assignees = taskService.getAssignees(id);
        return ResponseEntity.ok(ApiResponse.success(assignees));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskEntity>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String userId = authentication.getName();
        String status = body.get("status");
        TaskEntity task = taskService.updateStatus(id, status, userId);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @GetMapping("/column/{columnId}")
    public ResponseEntity<ApiResponse<List<TaskEntity>>> findByColumn(@PathVariable String columnId) {
        List<TaskEntity> tasks = taskService.findByColumn(columnId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskEntity>> create(
            @Valid @RequestBody CreateTaskDto dto,
            Authentication authentication) {
        String creatorId = authentication.getName();
        TaskEntity task = taskService.create(dto, creatorId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(task));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskEntity>> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateTaskDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        TaskEntity task = taskService.update(id, dto, userId);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> remove(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = taskService.remove(id, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PatchMapping("/{id}/assignees")
    public ResponseEntity<ApiResponse<TaskEntity>> assignUsers(
            @PathVariable String id,
            @Valid @RequestBody AssignUsersDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        TaskEntity task = taskService.assignUsers(id, dto, userId);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @DeleteMapping("/{id}/assignees")
    public ResponseEntity<ApiResponse<TaskEntity>> unassignUsers(
            @PathVariable String id,
            @Valid @RequestBody UnassignUsersDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        TaskEntity task = taskService.unassignUsers(id, dto, userId);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @PatchMapping("/{id}/labels")
    public ResponseEntity<ApiResponse<TaskEntity>> assignLabels(
            @PathVariable String id,
            @Valid @RequestBody AssignLabelsDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        TaskEntity task = taskService.assignLabels(id, dto, userId);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @DeleteMapping("/{id}/labels")
    public ResponseEntity<ApiResponse<TaskEntity>> unassignLabels(
            @PathVariable String id,
            @Valid @RequestBody AssignLabelsDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        TaskEntity task = taskService.unassignLabels(id, dto, userId);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @PatchMapping("/{id}/position")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePosition(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String prevTaskId = body.get("prevTaskId");
        String nextTaskId = body.get("nextTaskId");
        String columnId = body.get("columnId");
        Map<String, Object> result = taskService.updatePosition(id, prevTaskId, nextTaskId, columnId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/{id}/subtasks")
    public ResponseEntity<ApiResponse<SubTaskEntity>> addSubTask(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String title = body.get("title");
        SubTaskEntity subTask = taskService.addSubTask(id, title);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(subTask));
    }

    @PatchMapping("/subtasks/{id}")
    public ResponseEntity<ApiResponse<TaskEntity>> updateSubTask(
            @PathVariable String id,
            @RequestBody Map<String, Object> update) {
        TaskEntity task = taskService.updateSubTask(id, update);
        return ResponseEntity.ok(ApiResponse.success(task));
    }
}

