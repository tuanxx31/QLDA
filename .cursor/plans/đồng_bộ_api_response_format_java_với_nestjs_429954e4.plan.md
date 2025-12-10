---
name: Đồng bộ API response format Java với NestJS
overview: Loại bỏ ApiResponse wrapper từ tất cả controllers và cập nhật exception handler để response format khớp với NestJS backend, đảm bảo frontend hoạt động không cần thay đổi.
todos: []
---

# Đồng bộ API Response Format giữa Java Backend và NestJS Backend

## ⚠️ QUAN TRỌNG: CHỈ SỬA JAVA BACKEND

**Phạm vi thay đổi:**

- ✅ **CHỈ SỬA:** Java backend (`backend-java/src/main/java/`)
- ❌ **KHÔNG SỬA:** Frontend (`qlda-fe/`) - giữ nguyên 100%
- ❌ **KHÔNG SỬA:** NestJS backend (`be/`) - giữ nguyên 100%

**Mục tiêu:** Java backend phải trả về response format **giống hệt** NestJS backend để frontend hoạt động không cần thay đổi.

## Vấn đề hiện tại

**NestJS Backend:**

- Trả về dữ liệu trực tiếp: `return entity`, `return { message: '...' }`, `return [list]`
- Không có wrapper response
- Errors: Throw HttpException, NestJS tự động format

**Java Backend hiện tại:**

- Wrap tất cả responses trong `ApiResponse<T>`:
  ```json
  {
    "success": true,
    "message": null,
    "data": { ... }
  }
  ```

- Frontend expect `response.data` là dữ liệu trực tiếp → không khớp

## Giải pháp

### 1. Loại bỏ ApiResponse wrapper từ tất cả Controllers

**Các file cần cập nhật:**

- `backend-java/src/main/java/com/qlda/backendjava/auth/controller/AuthController.java`
- `backend-java/src/main/java/com/qlda/backendjava/users/controller/UserController.java`
- `backend-java/src/main/java/com/qlda/backendjava/projects/controller/ProjectController.java`
- `backend-java/src/main/java/com/qlda/backendjava/tasks/controller/TaskController.java`
- `backend-java/src/main/java/com/qlda/backendjava/columns/controller/ColumnController.java`
- `backend-java/src/main/java/com/qlda/backendjava/comments/controller/CommentController.java`
- `backend-java/src/main/java/com/qlda/backendjava/groups/controller/GroupController.java`
- `backend-java/src/main/java/com/qlda/backendjava/labels/controller/LabelController.java`
- `backend-java/src/main/java/com/qlda/backendjava/projectmember/controller/ProjectMemberController.java`
- `backend-java/src/main/java/com/qlda/backendjava/statistics/controller/StatisticsController.java`

**Thay đổi:**

- Từ: `return ResponseEntity.ok(ApiResponse.success(data))`
- Thành: `return ResponseEntity.ok(data)` hoặc chỉ `return data` (Spring Boot tự động wrap trong ResponseEntity)

### 2. Cập nhật GlobalExceptionHandler

**File:** `backend-java/src/main/java/com/qlda/backendjava/common/exception/GlobalExceptionHandler.java`

**Thay đổi:**

- Loại bỏ ApiResponse wrapper từ error responses
- Trả về format đơn giản giống NestJS:
  - Success: Dữ liệu trực tiếp
  - Error: `{ "statusCode": 404, "message": "..." }` (format mặc định của Spring Boot) hoặc chỉ message string

**Lưu ý:** Spring Boot mặc định format errors là:

```json
{
  "timestamp": "...",
  "status": 404,
  "error": "Not Found",
  "message": "...",
  "path": "..."
}
```

Có thể cần custom để chỉ trả về `{ "message": "..." }` giống NestJS hơn.

### 3. Đảm bảo Response Format khớp với NestJS

**Kiểm tra các endpoint quan trọng:**

**Auth:**

- `/api/auth/login` → `{ access_token: string, user: UserProfileDto }`
- `/api/auth/register` → `{ message: string }`

**Users:**

- `/api/users/profile` → `UserProfileDto` (trực tiếp, không wrap)
- `/api/users/profile` (PUT) → `{ message: string }`
- `/api/users/change-password` → `{ message: string }`
- `/api/users/delete` → `{ message: string }`
- `/api/users/avatar` → `{ message: string, avatar: string }`

**Projects:**

- `/api/projects` (GET) → `Project[]` (trực tiếp)
- `/api/projects/{id}` → `Project` (trực tiếp)
- `/api/projects` (POST) → `Project` (trực tiếp)
- `/api/projects/{id}` (PATCH/DELETE) → `Project` hoặc `{ message: string }`

**Tasks, Columns, Comments, Labels, Groups:** Tương tự - trả về entity hoặc list trực tiếp

### 4. Cập nhật Exception Format (Optional nhưng khuyến nghị)

Để khớp hoàn toàn với NestJS, có thể tạo custom error response format:

```java
// Custom error response DTO
public class ErrorResponse {
    private int statusCode;
    private String message;
    // getters/setters
}
```

Và cập nhật GlobalExceptionHandler để trả về format này thay vì format mặc định của Spring Boot.

## Thứ tự thực hiện

1. Cập nhật GlobalExceptionHandler trước (để errors format đúng)
2. Loại bỏ ApiResponse từ tất cả controllers (theo từng module)
3. Kiểm tra và đảm bảo response format khớp 100% với NestJS
4. Test các endpoint quan trọng để verify

## Lưu ý quan trọng

**CHỈ SỬA JAVA BACKEND - KHÔNG SỬA FRONTEND HOẶC NESTJS BACKEND**

### Phạm vi thay đổi

- ✅ **CHỈ SỬA:** Java backend (`backend-java/src/main/java/`)
- ❌ **KHÔNG SỬA:** Frontend (`qlda-fe/`) - giữ nguyên 100%
- ❌ **KHÔNG SỬA:** NestJS backend (`be/`) - giữ nguyên 100%

### Mục tiêu

Java backend phải trả về response format **giống hệt** NestJS backend để:

- Frontend không cần thay đổi code
- Frontend đang expect `response.data` là dữ liệu trực tiếp
- Sau khi sửa, frontend sẽ hoạt động với Java backend như đã hoạt động với NestJS

### Yêu cầu kỹ thuật

1. **Response format:**

   - Success: Dữ liệu trực tiếp (entity, DTO, list, hoặc `{ message: "..." }`)
   - Không có wrapper `ApiResponse<T>` với `{ success, message, data }`
   - Frontend expect `response.data` là dữ liệu trực tiếp, không phải `response.data.data`

2. **Error format:**

   - Format đơn giản giống NestJS: `{ "message": "..." }` hoặc format Spring Boot mặc định
   - Giữ nguyên HTTP status codes (200, 201, 400, 401, 403, 404, 500)

3. **Field names:**

   - Đảm bảo DTO field names khớp với NestJS (kiểm tra snake_case vs camelCase)
   - Kiểm tra các response có nested objects (relations) được serialize đúng

4. **Các file sẽ được sửa:**

   - Tất cả controllers trong `backend-java/src/main/java/com/qlda/backendjava/*/controller/`
   - `GlobalExceptionHandler.java` để format errors đúng
   - Có thể cần tạo `ErrorResponse` DTO nếu cần custom error format

## Kiểm tra format khớp

Sau khi sửa, verify các endpoint quan trọng:

1. **Auth:**

   - POST `/api/auth/login` → `{ access_token: "...", user: {...} }`
   - POST `/api/auth/register` → `{ message: "..." }`

2. **Users:**

   - GET `/api/users/profile` → `UserProfileDto` (object trực tiếp)
   - PUT `/api/users/profile` → `{ message: "..." }`

3. **Projects:**

   - GET `/api/projects` → `Project[]` (array trực tiếp)
   - GET `/api/projects/{id}` → `Project` (object trực tiếp)
   - POST `/api/projects` → `Project` (object trực tiếp)

Frontend đang expect `response.data` là dữ liệu trực tiếp, không phải `response.data.data`