package com.qlda.backend.groups.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinGroupDto {
    @NotBlank(message = "Mã mời không được để trống")
    private String inviteCode;
}

