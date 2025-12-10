package com.qlda.backend.projectmember.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateProjectMemberDto {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @Pattern(regexp = "viewer|editor|leader", message = "Role phải là viewer, editor hoặc leader")
    private String role = "viewer";
}

