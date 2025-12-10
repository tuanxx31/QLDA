package com.qlda.backendjava.labels.controller;

import com.qlda.backendjava.labels.dto.CreateLabelDto;
import com.qlda.backendjava.labels.dto.UpdateLabelDto;
import com.qlda.backendjava.labels.entity.LabelEntity;
import com.qlda.backendjava.labels.service.LabelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Labels", description = "API quản lý nhãn/tag")
@RestController
@RequestMapping("/api/labels")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class LabelController {

    private final LabelService labelService;

    @PostMapping
    public ResponseEntity<Object> create(@Valid @RequestBody CreateLabelDto dto) {
        Object result = labelService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    public ResponseEntity<List<LabelEntity>> findAll() {
        List<LabelEntity> labels = labelService.findAll();
        return ResponseEntity.ok(labels);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<LabelEntity>> findByProject(@PathVariable String projectId) {
        List<LabelEntity> labels = labelService.findByProject(projectId);
        return ResponseEntity.ok(labels);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabelEntity> findOne(@PathVariable String id) {
        LabelEntity label = labelService.findOne(id);
        return ResponseEntity.ok(label);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<LabelEntity> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateLabelDto dto) {
        LabelEntity label = labelService.update(id, dto);
        return ResponseEntity.ok(label);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> remove(@PathVariable String id) {
        Map<String, String> result = labelService.remove(id);
        return ResponseEntity.ok(result);
    }
}

