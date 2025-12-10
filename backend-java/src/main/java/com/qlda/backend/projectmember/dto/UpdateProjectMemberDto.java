package com.qlda.backend.projectmember.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateProjectMemberDto {
    @NotBlank(message = "Role không được để trống")
    @Pattern(regexp = "leader|editor|viewer", message = "Role phải là leader, editor hoặc viewer")
    private String role;
}

