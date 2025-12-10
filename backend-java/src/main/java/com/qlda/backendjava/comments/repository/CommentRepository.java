package com.qlda.backendjava.comments.repository;

import com.qlda.backendjava.comments.entity.CommentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, String> {
    Page<CommentEntity> findByTaskIdOrderByCreatedAtDesc(String taskId, Pageable pageable);
}

