package com.qlda.backendjava.subtasks.repository;

import com.qlda.backendjava.subtasks.entity.SubTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubTaskRepository extends JpaRepository<SubTaskEntity, String> {
    List<SubTaskEntity> findByTaskId(String taskId);
    
    // Load subtasks cho nhiều tasks cùng lúc
    @Query("SELECT st FROM SubTaskEntity st WHERE st.taskId IN :taskIds ORDER BY st.position ASC")
    List<SubTaskEntity> findByTaskIds(@Param("taskIds") List<String> taskIds);
}

