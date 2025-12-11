package com.qlda.backendjava.tasks.controller;

import com.qlda.backendjava.tasks.dto.*;
import com.qlda.backendjava.tasks.entity.TaskEntity;
import com.qlda.backendjava.tasks.service.TaskService;
import com.qlda.backendjava.subtasks.entity.SubTaskEntity;
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

@Tag(name = "Tasks", description = "API quản lý công việc")
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/{id}")
    public ResponseEntity<TaskEntity> findOne(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        TaskEntity task = taskService.findOne(id, userId);
        return ResponseEntity.ok(task);
    }

    @GetMapping("/{id}/assignees")
    public ResponseEntity<List<com.qlda.backendjava.users.entity.UserEntity>> getAssignees(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        List<com.qlda.backendjava.users.entity.UserEntity> assignees = taskService.getAssignees(id, userId);
        return ResponseEntity.ok(assignees);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskEntity> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String userId = authentication.getName();
        String status = body.get("status");
        TaskEntity task = taskService.updateStatus(id, status, userId);
        return ResponseEntity.ok(task);
    }

    @GetMapping("/column/{columnId}")
    public ResponseEntity<List<TaskEntity>> findByColumn(
            @PathVariable String columnId,
            Authentication authentication) {
        String userId = authentication.getName();
        List<TaskEntity> tasks = taskService.findByColumn(columnId, userId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<TaskEntity> create(
            @Valid @RequestBody CreateTaskDto dto,
            Authentication authentication) {
        String creatorId = authentication.getName();
        TaskEntity task = taskService.create(dto, creatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskEntity> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateTaskDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        TaskEntity task = taskService.update(id, dto, userId);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> remove(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = taskService.remove(id, userId);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/assignees")
    public ResponseEntity<TaskEntity> assignUsers(
            @PathVariable String id,
            @Valid @RequestBody AssignUsersDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        TaskEntity task = taskService.assignUsers(id, dto, userId);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}/assignees")
    public ResponseEntity<TaskEntity> unassignUsers(
            @PathVariable String id,
            @Valid @RequestBody UnassignUsersDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        TaskEntity task = taskService.unassignUsers(id, dto, userId);
        return ResponseEntity.ok(task);
    }

    @PatchMapping("/{id}/labels")
    public ResponseEntity<TaskEntity> assignLabels(
            @PathVariable String id,
            @Valid @RequestBody AssignLabelsDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        TaskEntity task = taskService.assignLabels(id, dto, userId);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}/labels")
    public ResponseEntity<TaskEntity> unassignLabels(
            @PathVariable String id,
            @Valid @RequestBody AssignLabelsDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        TaskEntity task = taskService.unassignLabels(id, dto, userId);
        return ResponseEntity.ok(task);
    }

    @PatchMapping("/{id}/position")
    public ResponseEntity<Map<String, Object>> updatePosition(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String userId = authentication.getName();
        String prevTaskId = body.get("prevTaskId");
        String nextTaskId = body.get("nextTaskId");
        String columnId = body.get("columnId");
        Map<String, Object> result = taskService.updatePosition(id, prevTaskId, nextTaskId, columnId, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/subtasks")
    public ResponseEntity<SubTaskEntity> addSubTask(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String userId = authentication.getName();
        String title = body.get("title");
        SubTaskEntity subTask = taskService.addSubTask(id, title, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(subTask);
    }

    @PatchMapping("/subtasks/{id}")
    public ResponseEntity<TaskEntity> updateSubTask(
            @PathVariable String id,
            @RequestBody Map<String, Object> update,
            Authentication authentication) {
        String userId = authentication.getName();
        TaskEntity task = taskService.updateSubTask(id, update, userId);
        return ResponseEntity.ok(task);
    }
}

