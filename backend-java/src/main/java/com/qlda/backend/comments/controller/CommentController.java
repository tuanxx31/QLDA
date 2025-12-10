package com.qlda.backend.comments.controller;

import com.qlda.backend.comments.dto.CreateCommentDto;
import com.qlda.backend.comments.dto.UpdateCommentDto;
import com.qlda.backend.comments.entity.CommentEntity;
import com.qlda.backend.comments.service.CommentService;
import com.qlda.backend.common.ApiResponse;
import com.qlda.backend.common.service.FileUploadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final FileUploadService fileUploadService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> findAll(
            @PathVariable String taskId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        Map<String, Object> result = commentService.findAll(taskId, page, limit);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommentEntity>> create(
            @PathVariable String taskId,
            @Valid @RequestBody CreateCommentDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        CommentEntity comment = commentService.create(taskId, userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(comment));
    }

    @PatchMapping("/{commentId}")
    public ResponseEntity<ApiResponse<CommentEntity>> update(
            @PathVariable String taskId,
            @PathVariable String commentId,
            @Valid @RequestBody UpdateCommentDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        CommentEntity comment = commentService.update(commentId, userId, dto);
        return ResponseEntity.ok(ApiResponse.success(comment));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> remove(
            @PathVariable String taskId,
            @PathVariable String commentId,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = commentService.remove(commentId, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadFile(
            @PathVariable String taskId,
            @RequestParam("file") MultipartFile file) {
        try {
            fileUploadService.validateCommentFile(file);
            String fileUrl = fileUploadService.uploadFile(file, "comment");
            
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("fileUrl", fileUrl);
            result.put("filename", file.getOriginalFilename());
            result.put("size", file.getSize());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(result));
        } catch (Exception e) {
            throw new com.qlda.backend.common.exception.BadRequestException(e.getMessage());
        }
    }
}

