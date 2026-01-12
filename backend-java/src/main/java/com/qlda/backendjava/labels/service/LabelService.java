package com.qlda.backendjava.labels.service;

import com.qlda.backendjava.common.exception.BadRequestException;
import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.labels.dto.CreateLabelDto;
import com.qlda.backendjava.labels.dto.UpdateLabelDto;
import com.qlda.backendjava.labels.entity.LabelEntity;
import com.qlda.backendjava.labels.repository.LabelRepository;
import com.qlda.backendjava.projects.entity.ProjectEntity;
import com.qlda.backendjava.projects.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LabelService {

    private final LabelRepository labelRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public Object create(CreateLabelDto dto) {
        String trimmedName = dto.getName() != null ? dto.getName().trim() : "";

        List<LabelEntity> existing = labelRepository.findByProjectId(dto.getProjectId());
        boolean isExist = existing.stream().anyMatch(l -> l.getName() != null && l.getName().equals(trimmedName) && l.getColor().equals(dto.getColor()));

        if (isExist) {
            LabelEntity found = existing.stream().filter(l -> l.getName() != null && l.getName().equals(trimmedName) && l.getColor().equals(dto.getColor())).findFirst().orElse(null);
            if (found != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Nhãn đã có trong hệ thống");
                response.put("id", found.getId());
                response.put("isExist", true);
                return response;
            }
        }

        ProjectEntity project = projectRepository.findById(dto.getProjectId()).orElseThrow(() -> new NotFoundException("Không tìm thấy project."));

        LabelEntity label = new LabelEntity();
        label.setName(trimmedName);
        label.setColor(dto.getColor());
        label.setProject(project);

        return labelRepository.save(label);
    }

    public List<LabelEntity> findAll() {
        return labelRepository.findAll();
    }

    public List<LabelEntity> findByProject(String projectId) {
        return labelRepository.findByProjectId(projectId);

    }

    public LabelEntity findOne(String id) {
        return labelRepository.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy nhãn"));
    }

    @Transactional
    public LabelEntity update(String id, UpdateLabelDto dto) {
        LabelEntity label = labelRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhãn"));

        if (dto.getName() != null) {
            label.setName(dto.getName().trim());
        }
        if (dto.getColor() != null) {
            label.setColor(dto.getColor());
        }
        if (dto.getDescription() != null) {
            label.setDescription(dto.getDescription());
        }

        return labelRepository.save(label);
    }

    @Transactional
    public Map<String, String> remove(String id) {
        LabelEntity label = labelRepository.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy nhãn"));

        labelRepository.deleteById(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Xóa nhãn thành công");
        return response;
    }
}

