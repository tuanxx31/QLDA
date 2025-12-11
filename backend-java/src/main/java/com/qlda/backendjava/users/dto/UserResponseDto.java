package com.qlda.backendjava.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private String id;
    private String name;
    private String email;
    private String avatar;
    private String studentCode;
    private String department;
    private LocalDate dateOfBirth;
    private String gender; // "male" | "female" | "other"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

