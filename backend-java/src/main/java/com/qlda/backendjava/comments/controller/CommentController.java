package com.qlda.backendjava.comments.controller;

import com.qlda.backendjava.comments.dto.CreateCommentDto;
import com.qlda.backendjava.comments.dto.UpdateCommentDto;
import com.qlda.backendjava.comments.entity.CommentEntity;
import com.qlda.backendjava.comments.service.CommentService;
import com.qlda.backendjava.common.service.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Tag(name = "Comments", description = "API quản lý bình luận")
@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class CommentController {

    private final CommentService commentService;
    private final FileUploadService fileUploadService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> findAll(
            @PathVariable String taskId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        Map<String, Object> result = commentService.findAll(taskId, page, limit);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<CommentEntity> create(
            @PathVariable String taskId,
            @Valid @RequestBody CreateCommentDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        CommentEntity comment = commentService.create(taskId, userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentEntity> update(
            @PathVariable String taskId,
            @PathVariable String commentId,
            @Valid @RequestBody UpdateCommentDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        CommentEntity comment = commentService.update(commentId, userId, dto);
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Map<String, String>> remove(
            @PathVariable String taskId,
            @PathVariable String commentId,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = commentService.remove(commentId, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @PathVariable String taskId,
            @RequestParam("file") MultipartFile file) {
        try {
            fileUploadService.validateCommentFile(file);
            String fileUrl = fileUploadService.uploadFile(file, "comment");
            
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("fileUrl", fileUrl);
            result.put("filename", file.getOriginalFilename());
            result.put("size", file.getSize());
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            throw new com.qlda.backendjava.common.exception.BadRequestException(e.getMessage());
        }
    }
}

