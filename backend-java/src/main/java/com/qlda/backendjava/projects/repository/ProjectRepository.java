package com.qlda.backendjava.projects.repository;

import com.qlda.backendjava.projects.entity.ProjectEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, String> {
    @Query("SELECT p FROM ProjectEntity p WHERE p.group.id = :groupId")
    List<ProjectEntity> findByGroupId(@Param("groupId") String groupId);
    
    @EntityGraph(attributePaths = {"group", "owner", "members", "members.user"})
    @Query("SELECT p FROM ProjectEntity p WHERE p.id = :id")
    Optional<ProjectEntity> findByIdWithMembers(@Param("id") String id);
}

