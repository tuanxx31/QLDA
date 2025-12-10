package com.qlda.backendjava.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentByMemberDto {
    private String userId;
    private String userName;
    private String avatar;
    private Integer commentCount;
}

