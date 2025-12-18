package com.qlda.backendjava.groupmember.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeaveGroupDto {
    @NotBlank(message = "Group ID không được để trống")
    private String groupId;
}

