package com.qlda.backend.labels.controller;

import com.qlda.backend.common.ApiResponse;
import com.qlda.backend.labels.dto.CreateLabelDto;
import com.qlda.backend.labels.dto.UpdateLabelDto;
import com.qlda.backend.labels.entity.LabelEntity;
import com.qlda.backend.labels.service.LabelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/labels")
@RequiredArgsConstructor
public class LabelController {

    private final LabelService labelService;

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> create(@Valid @RequestBody CreateLabelDto dto) {
        Object result = labelService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LabelEntity>>> findAll() {
        List<LabelEntity> labels = labelService.findAll();
        return ResponseEntity.ok(ApiResponse.success(labels));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<LabelEntity>>> findByProject(@PathVariable String projectId) {
        List<LabelEntity> labels = labelService.findByProject(projectId);
        return ResponseEntity.ok(ApiResponse.success(labels));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LabelEntity>> findOne(@PathVariable String id) {
        LabelEntity label = labelService.findOne(id);
        return ResponseEntity.ok(ApiResponse.success(label));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<LabelEntity>> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateLabelDto dto) {
        LabelEntity label = labelService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success(label));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> remove(@PathVariable String id) {
        Map<String, String> result = labelService.remove(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

