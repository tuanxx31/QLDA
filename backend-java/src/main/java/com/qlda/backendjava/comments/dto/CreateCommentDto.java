package com.qlda.backendjava.comments.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateCommentDto {
    private String content;
    private String fileUrl;
    private List<String> mentionIds;
}

