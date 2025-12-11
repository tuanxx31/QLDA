---
name: Sửa Response API Java khớp NestJS
overview: Kiểm tra và sửa lại tất cả các API endpoints trong Java để đảm bảo response format, relations, order, và structure khớp hoàn toàn với NestJS backend, đảm bảo frontend hoạt động đúng.
todos:
  - id: fix-comments
    content: "Sửa Comments Service: order, relations trong findAll, create, update, findOne"
    status: completed
  - id: check-tasks
    content: "Kiểm tra và sửa Tasks Service: relations, order, filter assignees"
    status: completed
  - id: check-projects
    content: "Kiểm tra và sửa Projects Service: format progress endpoints, relations"
    status: completed
  - id: check-groups
    content: "Kiểm tra và sửa Groups Service: format response, relations"
    status: completed
  - id: check-statistics
    content: "Kiểm tra và sửa Statistics Service: format DTOs, tính toán"
    status: completed
  - id: check-columns
    content: "Kiểm tra và sửa Columns Service: relations, format"
    status: completed
  - id: check-auth
    content: "Kiểm tra Auth Service: format login response"
    status: completed
  - id: verify-all
    content: Kiểm tra tổng thể tất cả endpoints, đảm bảo không có ApiResponse wrapper
    status: completed
    dependencies:
      - fix-comments
      - check-tasks
      - check-projects
      - check-groups
      - check-statistics
      - check-columns
      - check-auth
---

# Kế hoạch sửa Response API Java khớp với NestJS

## Mục tiêu

Đảm bảo tất cả các API endpoints trong Java backend trả về response có format, structure, relations, và order giống hệt với NestJS backend để frontend hoạt động đúng.

## Các vấn đề đã phát hiện

### 1. Comments Module

- **findAll**: Order sai (NestJS: `createdAt ASC`, Java: `createdAt DESC`)
- **create**: Thiếu load lại với relations `['user', 'mentions']` sau khi save
- **update**: Thiếu load lại với relations `['user', 'mentions']` sau khi save
- **findOne**: Thiếu relations `['user', 'mentions', 'task']`

### 2. Tasks Module

- Cần kiểm tra relations được load trong `findOne`, `findByColumn`
- Cần đảm bảo assignees được filter đúng theo project members

### 3. Projects Module

- Cần kiểm tra format của progress endpoints
- Cần đảm bảo relations được load đầy đủ

### 4. Groups Module

- Cần kiểm tra format response của các endpoints
- Cần đảm bảo relations được load đầy đủ

### 5. Statistics Module

- Cần kiểm tra format DTOs khớp với NestJS
- Cần đảm bảo tính toán và format số liệu khớp

### 6. Columns Module

- Cần kiểm tra relations và format response

### 7. Auth Module

- Cần kiểm tra format của login response (`access_token`, `user`)

## Kế hoạch thực hiện

### Bước 1: Comments Service

- Sửa `findAll`: Đổi order từ DESC sang ASC
- Sửa `create`: Load lại comment với relations `['user', 'mentions']` sau khi save
- Sửa `update`: Load lại comment với relations `['user', 'mentions']` sau khi save
- Sửa `findOne`: Load với relations `['user', 'mentions', 'task']`

**Files cần sửa:**

- `backend-java/src/main/java/com/qlda/backendjava/comments/service/CommentService.java`
- `backend-java/src/main/java/com/qlda/backendjava/comments/repository/CommentRepository.java` (nếu cần thêm method)

### Bước 2: Tasks Service

- Kiểm tra và đảm bảo `findOne` load đầy đủ relations: `['assignees', 'labels', 'subtasks', 'column', 'column.project']`
- Kiểm tra `findByColumn` load relations: `['assignees', 'labels', 'subtasks']`
- Đảm bảo order là `position ASC`

**Files cần sửa:**

- `backend-java/src/main/java/com/qlda/backendjava/tasks/service/TaskService.java`
- `backend-java/src/main/java/com/qlda/backendjava/tasks/repository/TaskRepository.java`

### Bước 3: Projects Service

- Kiểm tra format của progress endpoints
- Đảm bảo relations được load đầy đủ trong `findOne`

**Files cần kiểm tra:**

- `backend-java/src/main/java/com/qlda/backendjava/projects/service/ProjectService.java`

### Bước 4: Groups Service

- Kiểm tra format response của `findAllByUser`, `findPendingInvites`, etc.
- Đảm bảo structure Map khớp với NestJS

**Files cần kiểm tra:**

- `backend-java/src/main/java/com/qlda/backendjava/groups/service/GroupService.java`

### Bước 5: Statistics Service

- Kiểm tra format DTOs
- Đảm bảo tính toán khớp với NestJS

**Files cần kiểm tra:**

- `backend-java/src/main/java/com/qlda/backendjava/statistics/service/StatisticsService.java`
- `backend-java/src/main/java/com/qlda/backendjava/statistics/dto/*.java`

### Bước 6: Columns Service

- Kiểm tra relations và format response

**Files cần kiểm tra:**

- `backend-java/src/main/java/com/qlda/backendjava/columns/service/ColumnService.java`

### Bước 7: Auth Service

- Kiểm tra format login response

**Files cần kiểm tra:**

- `backend-java/src/main/java/com/qlda/backendjava/auth/service/AuthService.java`

### Bước 8: Kiểm tra tổng thể

- So sánh tất cả các controller methods
- Đảm bảo không có wrapper ApiResponse nào được sử dụng (NestJS trả về trực tiếp)
- Kiểm tra format của error responses

## Nguyên tắc sửa đổi

1. **Không thay đổi logic business**, chỉ sửa format response
2. **Đảm bảo relations được load đầy đủ** như NestJS
3. **Đảm bảo order khớp** với NestJS
4. **Đảm bảo structure response khớp** (Map/Object, không có wrapper)
5. **Chỉ sửa ở Java**, không thay đổi NestJS hoặc Frontend

## Testing

Sau khi sửa, cần test từng endpoint để đảm bảo:

- Response format khớp với NestJS
- Relations được load đầy đủ
- Order đúng
- Frontend hoạt động đúng