package com.qlda.backendjava.columns.controller;

import com.qlda.backendjava.columns.dto.CreateColumnDto;
import com.qlda.backendjava.columns.dto.UpdateColumnDto;
import com.qlda.backendjava.columns.entity.ColumnEntity;
import com.qlda.backendjava.columns.service.ColumnService;
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

@Tag(name = "Columns", description = "API quản lý cột trong dự án")
@RestController
@RequestMapping("/api/projects/{projectId}/columns")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class ColumnController {

    private final ColumnService columnService;

    @PostMapping
    public ResponseEntity<ColumnEntity> create(
            @PathVariable String projectId,
            @Valid @RequestBody CreateColumnDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        ColumnEntity column = columnService.create(projectId, dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(column);
    }

    @GetMapping
    public ResponseEntity<List<ColumnEntity>> findAll(
            @PathVariable String projectId,
            Authentication authentication) {
        String userId = authentication.getName();
        List<ColumnEntity> columns = columnService.findAll(projectId, userId);
        return ResponseEntity.ok(columns);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ColumnEntity> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateColumnDto dto,
            Authentication authentication) {
        String userId = authentication.getName();
        ColumnEntity column = columnService.update(id, dto, userId);
        return ResponseEntity.ok(column);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> remove(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = columnService.remove(id, userId);
        return ResponseEntity.ok(result);
    }
}

