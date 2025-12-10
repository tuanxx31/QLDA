package com.qlda.backend.columns.service;

import com.qlda.backend.common.exception.ForbiddenException;
import com.qlda.backend.common.exception.NotFoundException;
import com.qlda.backend.columns.dto.CreateColumnDto;
import com.qlda.backend.columns.dto.UpdateColumnDto;
import com.qlda.backend.columns.entity.ColumnEntity;
import com.qlda.backend.columns.repository.ColumnRepository;
import com.qlda.backend.permissions.service.PermissionService;
import com.qlda.backend.projects.entity.ProjectEntity;
import com.qlda.backend.projects.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ColumnService {

    private final ColumnRepository columnRepository;
    private final ProjectRepository projectRepository;
    private final PermissionService permissionService;

    @Transactional
    public ColumnEntity create(String projectId, CreateColumnDto dto, String userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        if (!permissionService.canEditColumn(projectId, userId)) {
            throw new ForbiddenException("Không có quyền tạo cột.");
        }

        List<ColumnEntity> existingColumns = columnRepository.findByProjectId(projectId);
        int maxOrder = existingColumns.stream()
                .mapToInt(c -> c.getOrder() != null ? c.getOrder() : 0)
                .max()
                .orElse(0);

        ColumnEntity column = new ColumnEntity();
        column.setName(dto.getName());
        column.setOrder(dto.getOrder() != null ? dto.getOrder() : maxOrder + 1);
        column.setProject(project);

        return columnRepository.save(column);
    }

    public List<ColumnEntity> findAll(String projectId) {
        return columnRepository.findByProjectIdOrderByOrderAsc(projectId);
    }

    @Transactional
    public ColumnEntity update(String id, UpdateColumnDto dto, String userId) {
        ColumnEntity column = columnRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy cột."));

        if (!permissionService.canEditColumn(column.getProject().getId(), userId)) {
            throw new ForbiddenException("Không có quyền cập nhật cột.");
        }

        if (dto.getName() != null) {
            column.setName(dto.getName());
        }
        if (dto.getOrder() != null) {
            column.setOrder(dto.getOrder());
        }

        return columnRepository.save(column);
    }

    @Transactional
    public Map<String, String> remove(String id, String userId) {
        ColumnEntity column = columnRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy cột."));

        if (!permissionService.canEditColumn(column.getProject().getId(), userId)) {
            throw new ForbiddenException("Không có quyền xóa cột.");
        }

        columnRepository.deleteById(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã xóa cột thành công.");
        return response;
    }
}

