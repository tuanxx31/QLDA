package com.qlda.backend.common.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final String UPLOAD_DIR = "uploads";

    public String uploadFile(MultipartFile file, String prefix) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        // Tạo thư mục nếu chưa tồn tại
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Tạo tên file unique
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = prefix + "-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8) + extension;

        // Lưu file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + uniqueFilename;
    }

    public void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        String contentType = file.getContentType();
        if (contentType == null || 
            (!contentType.startsWith("image/") && 
             !contentType.equals("image/jpeg") && 
             !contentType.equals("image/jpg") && 
             !contentType.equals("image/png") && 
             !contentType.equals("image/webp"))) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh: jpg, png, webp");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File không được vượt quá 5MB");
        }
    }

    public void validateCommentFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("File không hợp lệ");
        }

        boolean isValid = contentType.startsWith("image/") ||
                          contentType.equals("application/pdf") ||
                          contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                          contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        if (!isValid) {
            throw new IllegalArgumentException("Chỉ chấp nhận file: jpg, png, pdf, docx, xlsx");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File không được vượt quá 5MB");
        }
    }
}

