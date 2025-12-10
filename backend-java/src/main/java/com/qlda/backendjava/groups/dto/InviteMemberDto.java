package com.qlda.backendjava.groups.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InviteMemberDto {
    @NotBlank(message = "Group ID không được để trống")
    private String groupId;

    private String userId;
    private String email;
}

