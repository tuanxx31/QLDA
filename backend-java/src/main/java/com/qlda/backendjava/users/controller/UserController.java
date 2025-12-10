package com.qlda.backendjava.users.controller;

import com.qlda.backendjava.common.ApiResponse;
import com.qlda.backendjava.users.dto.UpdatePasswordDto;
import com.qlda.backendjava.users.dto.UpdateUserDto;
import com.qlda.backendjava.users.dto.UserProfileDto;
import com.qlda.backendjava.users.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Tag(name = "Users", description = "API quản lý người dùng")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Lấy thông tin profile", description = "Lấy thông tin profile của người dùng hiện tại")
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(Authentication authentication) {
        String userId = authentication.getName();
        UserProfileDto profile = userService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @Operation(summary = "Cập nhật profile", description = "Cập nhật thông tin profile của người dùng")
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserDto dto) {
        String userId = authentication.getName();
        Map<String, String> result = userService.updateProfile(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "Đổi mật khẩu", description = "Thay đổi mật khẩu của người dùng hiện tại")
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

    @Operation(summary = "Upload avatar", description = "Tải lên ảnh đại diện cho người dùng")
    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        String userId = authentication.getName();
        Map<String, String> result = userService.updateAvatar(userId, file);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

