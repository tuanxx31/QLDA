package com.qlda.backend.auth.controller;

import com.qlda.backend.auth.dto.LoginResponse;
import com.qlda.backend.auth.dto.LoginUserDto;
import com.qlda.backend.auth.dto.RegisterUserDto;
import com.qlda.backend.auth.service.AuthService;
import com.qlda.backend.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, String>>> register(@Valid @RequestBody RegisterUserDto dto) {
        Map<String, String> result = authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginUserDto dto) {
        LoginResponse result = authService.login(dto);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

