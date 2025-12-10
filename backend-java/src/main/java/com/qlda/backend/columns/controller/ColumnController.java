package com.qlda.backend.columns.controller;

import com.qlda.backend.columns.dto.CreateColumnDto;
import com.qlda.backend.columns.dto.UpdateColumnDto;
import com.qlda.backend.columns.entity.ColumnEntity;
import com.qlda.backend.columns.service.ColumnService;
import com.qlda.backend.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/columns")
@RequiredArgsConstructor
public class ColumnController {

    private final ColumnService columnService;

    @PostMapping
    public ResponseEntity<ApiResponse<ColumnEntity>> create(
            @PathVariable String projectId,
            @Valid @RequestBody CreateColumnDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        ColumnEntity column = columnService.create(projectId, dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(column));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ColumnEntity>>> findAll(@PathVariable String projectId) {
        List<ColumnEntity> columns = columnService.findAll(projectId);
        return ResponseEntity.ok(ApiResponse.success(columns));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ColumnEntity>> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateColumnDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        ColumnEntity column = columnService.update(id, dto, userId);
        return ResponseEntity.ok(ApiResponse.success(column));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> remove(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = columnService.remove(id, userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

