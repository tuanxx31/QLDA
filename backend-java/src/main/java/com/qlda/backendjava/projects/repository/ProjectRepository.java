package com.qlda.backendjava.projects.repository;

import com.qlda.backendjava.projects.entity.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, String> {
    @Query("SELECT p FROM ProjectEntity p WHERE p.group.id = :groupId")
    List<ProjectEntity> findByGroupId(@Param("groupId") String groupId);
}

