package com.qlda.backendjava.comments.repository;

import com.qlda.backendjava.comments.entity.CommentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, String> {
    @EntityGraph(attributePaths = {"user", "mentions"})
    Page<CommentEntity> findByTaskIdOrderByCreatedAtAsc(String taskId, Pageable pageable);
    
    @EntityGraph(attributePaths = {"user", "mentions", "task"})
    Optional<CommentEntity> findById(String id);
    
    @EntityGraph(attributePaths = {"user", "mentions"})
    @Query("SELECT c FROM CommentEntity c WHERE c.id = :id")
    Optional<CommentEntity> findByIdWithRelations(@Param("id") String id);
    
    @Query("SELECT c FROM CommentEntity c " +
           "LEFT JOIN FETCH c.user " +
           "LEFT JOIN FETCH c.task " +
           "WHERE c.taskId IN :taskIds " +
           "AND (:startDate IS NULL OR c.createdAt >= :startDate) " +
           "ORDER BY c.createdAt DESC")
    List<CommentEntity> findByTaskIdsAndCreatedAtAfter(
        @Param("taskIds") List<String> taskIds,
        @Param("startDate") LocalDateTime startDate
    );
}

