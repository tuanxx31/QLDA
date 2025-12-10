package com.qlda.backendjava.projectmember.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

@Data
public class AddProjectMembersDto {
    @NotEmpty(message = "Danh sách user IDs không được để trống")
    private List<String> userIds;

    @Pattern(regexp = "viewer|editor|leader", message = "Role phải là viewer, editor hoặc leader")
    private String role = "viewer";
}

