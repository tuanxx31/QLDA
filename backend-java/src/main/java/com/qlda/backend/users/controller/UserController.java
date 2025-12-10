package com.qlda.backend.users.controller;

import com.qlda.backend.common.ApiResponse;
import com.qlda.backend.users.dto.UpdatePasswordDto;
import com.qlda.backend.users.dto.UpdateUserDto;
import com.qlda.backend.users.dto.UserProfileDto;
import com.qlda.backend.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(Authentication authentication) {
        String userId = authentication.getName();
        UserProfileDto profile = userService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserDto dto) {
        String userId = authentication.getName();
        Map<String, String> result = userService.updateProfile(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Map<String, String>>> updatePassword(
            Authentication authentication,
            @Valid @RequestBody UpdatePasswordDto dto) {
        String userId = authentication.getName();
        Map<String, String> result = userService.updatePassword(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteUser(Authentication authentication) {
        String userId = authentication.getName();
        Map<String, String> result = userService.remove(userId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        String userId = authentication.getName();
        Map<String, String> result = userService.updateAvatar(userId, file);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

