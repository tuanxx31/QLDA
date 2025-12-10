package com.qlda.backendjava.columns.repository;

import com.qlda.backendjava.columns.entity.ColumnEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColumnRepository extends JpaRepository<ColumnEntity, String> {
    @Query("SELECT c FROM ColumnEntity c WHERE c.project.id = :projectId ORDER BY c.order ASC")
    List<ColumnEntity> findByProjectIdOrderByOrderAsc(@Param("projectId") String projectId);
    
    List<ColumnEntity> findByProjectId(String projectId);
}

