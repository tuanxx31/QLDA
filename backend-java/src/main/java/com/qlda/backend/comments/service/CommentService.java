package com.qlda.backend.comments.service;

import com.qlda.backend.common.exception.ForbiddenException;
import com.qlda.backend.common.exception.NotFoundException;
import com.qlda.backend.comments.dto.CreateCommentDto;
import com.qlda.backend.comments.dto.UpdateCommentDto;
import com.qlda.backend.comments.entity.CommentEntity;
import com.qlda.backend.comments.repository.CommentRepository;
import com.qlda.backend.projects.entity.ProjectEntity;
import com.qlda.backend.tasks.entity.TaskEntity;
import com.qlda.backend.tasks.repository.TaskRepository;
import com.qlda.backend.users.entity.UserEntity;
import com.qlda.backend.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommentEntity create(String taskId, String userId, CreateCommentDto dto) {
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User không tồn tại"));

        List<UserEntity> mentionUsers = List.of();
        if (dto.getMentionIds() != null && !dto.getMentionIds().isEmpty()) {
            mentionUsers = userRepository.findAllById(dto.getMentionIds());
        }

        CommentEntity comment = new CommentEntity();
        comment.setContent(dto.getContent());
        comment.setUserId(userId);
        comment.setTaskId(taskId);
        comment.setFileUrl(dto.getFileUrl());
        comment.setMentions(mentionUsers);

        return commentRepository.save(comment);
    }

    public Map<String, Object> findAll(String taskId, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<CommentEntity> commentPage = commentRepository.findByTaskIdOrderByCreatedAtDesc(taskId, pageable);

        Map<String, Object> result = new HashMap<>();
        result.put("data", commentPage.getContent());
        result.put("total", commentPage.getTotalElements());
        result.put("page", page);
        result.put("limit", limit);
        result.put("totalPages", commentPage.getTotalPages());
        return result;
    }

    public CommentEntity findOne(String id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Comment không tồn tại"));
    }

    @Transactional
    public CommentEntity update(String commentId, String userId, UpdateCommentDto dto) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment không tồn tại"));

        if (!comment.getUserId().equals(userId)) {
            throw new ForbiddenException("Chỉ người tạo mới có thể chỉnh sửa");
        }

        if (dto.getContent() != null) {
            comment.setContent(dto.getContent());
        }
        if (dto.getFileUrl() != null) {
            comment.setFileUrl(dto.getFileUrl());
        }
        if (dto.getMentionIds() != null) {
            List<UserEntity> mentionUsers = userRepository.findAllById(dto.getMentionIds());
            comment.setMentions(mentionUsers);
        }

        return commentRepository.save(comment);
    }

    @Transactional
    public Map<String, String> remove(String commentId, String userId) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment không tồn tại"));

        TaskEntity task = taskRepository.findById(comment.getTaskId())
                .orElse(null);

        String projectOwnerId = null;
        if (task != null && task.getColumn() != null && task.getColumn().getProject() != null) {
            ProjectEntity project = task.getColumn().getProject();
            projectOwnerId = project.getOwner() != null ? project.getOwner().getId() : null;
        }

        if (!comment.getUserId().equals(userId) && (projectOwnerId == null || !projectOwnerId.equals(userId))) {
            throw new ForbiddenException("Chỉ người tạo hoặc chủ dự án mới có thể xóa");
        }

        commentRepository.deleteById(commentId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã xóa comment thành công");
        return response;
    }
}

