package com.qlda.backend.subtasks.repository;

import com.qlda.backend.subtasks.entity.SubTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubTaskRepository extends JpaRepository<SubTaskEntity, String> {
    List<SubTaskEntity> findByTaskId(String taskId);
}

