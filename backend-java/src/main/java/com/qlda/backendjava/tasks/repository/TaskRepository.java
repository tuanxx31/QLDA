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
    
    // Load assignees riêng để tránh MultipleBagFetchException
    @Query("SELECT DISTINCT t FROM TaskEntity t " +
           "LEFT JOIN FETCH t.assignees " +
           "WHERE t.id IN :taskIds")
    List<TaskEntity> findByIdsWithAssignees(@Param("taskIds") List<String> taskIds);
    
    // Load labels riêng để tránh MultipleBagFetchException
    @Query("SELECT DISTINCT t FROM TaskEntity t " +
           "LEFT JOIN FETCH t.labels " +
           "WHERE t.id IN :taskIds")
    List<TaskEntity> findByIdsWithLabels(@Param("taskIds") List<String> taskIds);
}

