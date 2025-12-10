package com.qlda.backend.comments.dto;

import lombok.Data;

import java.util.List;

@Data
public class UpdateCommentDto {
    private String content;
    private String fileUrl;
    private List<String> mentionIds;
}

