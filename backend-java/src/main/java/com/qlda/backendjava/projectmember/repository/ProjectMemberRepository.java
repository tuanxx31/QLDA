package com.qlda.backendjava.projectmember.repository;

import com.qlda.backendjava.projectmember.entity.ProjectMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMemberEntity, String> {
    Optional<ProjectMemberEntity> findByProjectIdAndUserId(String projectId, String userId);
    
    @Query("SELECT pm FROM ProjectMemberEntity pm WHERE pm.project.id = :projectId")
    List<ProjectMemberEntity> findByProjectId(@Param("projectId") String projectId);
    
    @Query("SELECT pm FROM ProjectMemberEntity pm WHERE pm.user.id = :userId")
    List<ProjectMemberEntity> findByUserId(@Param("userId") String userId);
    
    @Query("SELECT pm FROM ProjectMemberEntity pm WHERE pm.project.id = :projectId AND pm.user.id NOT IN :excludeUserIds")
    List<ProjectMemberEntity> findByProjectIdExcludingUsers(@Param("projectId") String projectId, @Param("excludeUserIds") List<String> excludeUserIds);
    
    boolean existsByProjectIdAndUserId(String projectId, String userId);
}

