package com.qlda.backendjava.comments.dto;

import com.qlda.backendjava.tasks.dto.TaskResponseDto;
import com.qlda.backendjava.users.dto.UserResponseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDto {
    private String id;
    private String content;
    private String userId;
    private String taskId;
    private String fileUrl;
    
    // Nested objects
    private UserResponseDto user;
    private List<UserResponseDto> mentions;
    private TaskResponseDto task; // Optional, chỉ khi cần
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

