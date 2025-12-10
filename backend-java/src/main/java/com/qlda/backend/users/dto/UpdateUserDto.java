package com.qlda.backend.users.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserDto {
    private String name;
    private LocalDate dateOfBirth;
    
    @Pattern(regexp = "male|female|other", message = "Gender phải là male, female hoặc other")
    private String gender;
    private String studentCode;
    private String department;
}

