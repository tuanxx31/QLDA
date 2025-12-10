package com.qlda.backendjava.users.service;

import com.qlda.backendjava.common.exception.BadRequestException;
import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.common.service.FileUploadService;
import com.qlda.backendjava.users.dto.UpdatePasswordDto;
import com.qlda.backendjava.users.dto.UpdateUserDto;
import com.qlda.backendjava.users.dto.UserProfileDto;
import com.qlda.backendjava.users.entity.UserEntity;
import com.qlda.backendjava.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileUploadService fileUploadService;

    public UserProfileDto getProfile(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return mapToProfileDto(user);
    }

    @Transactional
    public Map<String, String> updateProfile(String userId, UpdateUserDto dto) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (dto.getName() != null) {
            user.setName(dto.getName());
        }
        if (dto.getDateOfBirth() != null) {
            user.setDateOfBirth(dto.getDateOfBirth());
        }
        if (dto.getGender() != null) {
            user.setGender(UserEntity.Gender.valueOf(dto.getGender()));
        }
        if (dto.getStudentCode() != null) {
            user.setStudentCode(dto.getStudentCode());
        }
        if (dto.getDepartment() != null) {
            user.setDepartment(dto.getDepartment());
        }

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Thông tin profile đã được cập nhật thành công");
        return response;
    }

    @Transactional
    public Map<String, String> updatePassword(String userId, UpdatePasswordDto dto) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu không đúng");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Mật khẩu đã được cập nhật thành công");
        return response;
    }

    @Transactional
    public Map<String, String> remove(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        userRepository.delete(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User " + userId + " delete success");
        return response;
    }

    @Transactional
    public Map<String, String> updateAvatar(String userId, MultipartFile file) {
        fileUploadService.validateImageFile(file);

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        try {
            String avatarUrl = fileUploadService.uploadFile(file, "avatar");
            user.setAvatar(avatarUrl);
            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Avatar đã được cập nhật thành công");
            response.put("avatar", avatarUrl);
            return response;
        } catch (IOException e) {
            throw new BadRequestException("Cập nhật avatar thất bại: " + e.getMessage());
        }
    }

    private UserProfileDto mapToProfileDto(UserEntity user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAvatar(user.getAvatar());
        dto.setStudentCode(user.getStudentCode());
        dto.setDepartment(user.getDepartment());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setGender(user.getGender() != null ? user.getGender().name() : null);
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}

