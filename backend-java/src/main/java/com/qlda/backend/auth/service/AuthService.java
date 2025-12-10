package com.qlda.backend.auth.service;

import com.qlda.backend.auth.dto.LoginResponse;
import com.qlda.backend.auth.dto.LoginUserDto;
import com.qlda.backend.auth.dto.RegisterUserDto;
import com.qlda.backend.common.exception.BadRequestException;
import com.qlda.backend.common.exception.UnauthorizedException;
import com.qlda.backend.security.JwtTokenProvider;
import com.qlda.backend.users.dto.UserProfileDto;
import com.qlda.backend.users.entity.UserEntity;
import com.qlda.backend.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public Map<String, String> register(RegisterUserDto dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BadRequestException("Email đã tồn tại");
        }

        UserEntity user = new UserEntity();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        if (dto.getAvatar() != null) {
            user.setAvatar(dto.getAvatar());
        }

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đăng ký thành công");
        return response;
    }

    public LoginResponse login(LoginUserDto dto) {
        UserEntity user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        UserProfileDto userProfile = new UserProfileDto();
        userProfile.setId(user.getId());
        userProfile.setName(user.getName());
        userProfile.setEmail(user.getEmail());
        userProfile.setDateOfBirth(user.getDateOfBirth());
        userProfile.setAvatar(user.getAvatar());
        userProfile.setStudentCode(user.getStudentCode());
        userProfile.setDepartment(user.getDepartment());
        userProfile.setGender(user.getGender() != null ? user.getGender().name() : null);
        userProfile.setCreatedAt(user.getCreatedAt());
        userProfile.setUpdatedAt(user.getUpdatedAt());

        return new LoginResponse(token, userProfile);
    }
}

