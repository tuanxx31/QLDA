package com.qlda.backendjava.auth.dto;

import com.qlda.backendjava.users.dto.UserProfileDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String access_token;
    private UserProfileDto user;
}

