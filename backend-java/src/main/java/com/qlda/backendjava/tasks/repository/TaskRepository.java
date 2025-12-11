package com.qlda.backendjava.tasks.repository;

import com.qlda.backendjava.tasks.entity.TaskEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, String> {
    
    
    @Query("SELECT DISTINCT t FROM TaskEntity t " +
           "LEFT JOIN FETCH t.subtasks " +
           "WHERE t.columnId = :columnId " +
           "ORDER BY t.position ASC")
    List<TaskEntity> findByColumnIdOrderByPositionAsc(@Param("columnId") String columnId);
    
    @Query("SELECT MAX(t.position) FROM TaskEntity t WHERE t.columnId = :columnId")
    java.math.BigDecimal findMaxPositionByColumnId(@Param("columnId") String columnId);
    
    @EntityGraph(attributePaths = {"assignees", "labels", "subtasks", "column", "column.project"})
    Optional<TaskEntity> findById(String id);
    
    
    
    @Query("SELECT DISTINCT t FROM TaskEntity t " +
           "LEFT JOIN FETCH t.subtasks " +
           "WHERE t.id = :id")
    Optional<TaskEntity> findByIdWithRelations(@Param("id") String id);
    
    
    @Query("SELECT DISTINCT t FROM TaskEntity t " +
           "LEFT JOIN FETCH t.assignees " +
           "WHERE t.id = :id")
    Optional<TaskEntity> findByIdWithAssignees(@Param("id") String id);
    
    
    @Query("SELECT DISTINCT t FROM TaskEntity t " +
           "LEFT JOIN FETCH t.labels " +
           "WHERE t.id = :id")
    Optional<TaskEntity> findByIdWithLabels(@Param("id") String id);
    
    
    @Query("SELECT DISTINCT t FROM TaskEntity t " +
           "LEFT JOIN FETCH t.assignees " +
           "WHERE t.id IN :taskIds")
    List<TaskEntity> findByIdsWithAssignees(@Param("taskIds") List<String> taskIds);
    
    
    @Query("SELECT DISTINCT t FROM TaskEntity t " +
           "LEFT JOIN FETCH t.labels " +
           "WHERE t.id IN :taskIds")
    List<TaskEntity> findByIdsWithLabels(@Param("taskIds") List<String> taskIds);
}

