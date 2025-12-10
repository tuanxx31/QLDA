package com.qlda.backendjava.tasks.repository;

import com.qlda.backendjava.tasks.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, String> {
    List<TaskEntity> findByColumnIdOrderByPositionAsc(String columnId);
    
    @Query("SELECT MAX(t.position) FROM TaskEntity t WHERE t.columnId = :columnId")
    java.math.BigDecimal findMaxPositionByColumnId(@Param("columnId") String columnId);
}

