package com.qlda.backend.labels.repository;

import com.qlda.backend.labels.entity.LabelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabelRepository extends JpaRepository<LabelEntity, String> {
    List<LabelEntity> findByProjectId(String projectId);
}

