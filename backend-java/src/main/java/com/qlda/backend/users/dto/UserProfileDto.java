package com.qlda.backend.users.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserProfileDto {
    private String id;
    private String name;
    private String email;
    private String avatar;
    private String studentCode;
    private String department;
    private LocalDate dateOfBirth;
    private String gender;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

