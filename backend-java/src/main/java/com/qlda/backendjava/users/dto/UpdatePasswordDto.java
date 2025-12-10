package com.qlda.backendjava.users.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdatePasswordDto {
    @NotBlank(message = "Mật khẩu hiện tại không được để trống")
    private String password;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    private String newPassword;
}

