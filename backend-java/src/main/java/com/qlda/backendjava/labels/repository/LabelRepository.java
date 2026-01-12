package com.qlda.backendjava.labels.repository;

import com.qlda.backendjava.labels.entity.LabelEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabelRepository extends JpaRepository<LabelEntity, String> {
    List<LabelEntity> findByProjectId(String projectId);

    List<LabelEntity> findByProjectId(String projectId, Sort sort);

}

