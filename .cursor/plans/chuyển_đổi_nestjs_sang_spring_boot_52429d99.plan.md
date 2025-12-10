---
name: Chuyển đổi NestJS sang Spring Boot
overview: "Chuyển đổi toàn bộ backend NestJS sang Spring Boot 4, giữ nguyên API endpoints và response format để frontend không cần thay đổi. Bao gồm tất cả các module: auth, users, groups, projects, tasks, columns, comments, labels, statistics và permissions."
todos:
  - id: setup-infrastructure
    content: "Setup cơ bản: cấu hình pom.xml, application.properties, package structure, ApiResponse wrapper, GlobalExceptionHandler, custom exceptions"
    status: completed
  - id: setup-security-jwt
    content: "Setup Security & JWT: JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig, UserDetailsServiceImpl"
    status: completed
    dependencies:
      - setup-infrastructure
  - id: auth-module
    content: "Implement Auth module: UserEntity, UserRepository, AuthService, AuthController với register/login endpoints"
    status: completed
    dependencies:
      - setup-security-jwt
  - id: users-module
    content: "Implement Users module: UserService, UserController với profile, password, avatar endpoints + file upload config"
    status: completed
    dependencies:
      - auth-module
  - id: groups-module
    content: "Implement Groups module: GroupEntity, GroupService, GroupController với tất cả endpoints (create, join, invite, approve, etc.)"
    status: completed
    dependencies:
      - users-module
  - id: groupmember-module
    content: "Implement GroupMember module: GroupMemberEntity, GroupMemberService, GroupMemberController"
    status: completed
    dependencies:
      - groups-module
  - id: projects-module
    content: "Implement Projects module: ProjectEntity, ProjectService, ProjectController với tất cả endpoints và progress methods"
    status: completed
    dependencies:
      - groupmember-module
  - id: projectmember-module
    content: "Implement ProjectMember module: ProjectMemberEntity, ProjectMemberService, ProjectMemberController với role management"
    status: completed
    dependencies:
      - projects-module
  - id: columns-module
    content: "Implement Columns module: ColumnEntity, ColumnService, ColumnController với position reordering logic"
    status: completed
    dependencies:
      - projectmember-module
  - id: tasks-module
    content: "Implement Tasks module: TaskEntity, TaskService, TaskController với assignees, labels, position, status management"
    status: completed
    dependencies:
      - columns-module
  - id: subtasks-module
    content: "Implement SubTasks module: SubTaskEntity, SubTaskService (có thể tích hợp vào TaskController)"
    status: completed
    dependencies:
      - tasks-module
  - id: comments-module
    content: "Implement Comments module: CommentEntity, CommentService, CommentController với file upload support"
    status: completed
    dependencies:
      - subtasks-module
  - id: labels-module
    content: "Implement Labels module: LabelEntity, LabelService, LabelController"
    status: completed
    dependencies:
      - comments-module
  - id: permissions-module
    content: "Implement Permissions module: PermissionService với group/project role checking logic"
    status: completed
    dependencies:
      - labels-module
  - id: statistics-module
    content: "Implement Statistics module: StatisticsService, StatisticsController với tất cả analytics endpoints"
    status: completed
    dependencies:
      - permissions-module
  - id: testing-validation
    content: "Testing: verify tất cả endpoints, JWT flow, file uploads, permissions. Đảm bảo response format giống hệt NestJS"
    status: pending
    dependencies:
      - statistics-module
---

# Kế hoạch chuyển đổi Backend NestJS sang Spring Boot

## Tổng quan

Chuyển đổi toàn bộ backend từ NestJS sang Spring Boot 4, đảm bảo:

- Giữ nguyên tất cả API endpoints và HTTP methods
- Giữ nguyên format request/response JSON
- Giữ nguyên JWT authentication flow
- Giữ nguyên file upload mechanism
- Frontend không cần thay đổi gì

## Cấu trúc Package Spring Boot

```
src/main/java/com/qlda/backend/
├── config/              # CORS, Jackson, Security, WebConfig
├── security/            # JWT filter, SecurityConfig, JwtTokenProvider
├── auth/                # AuthController, AuthService
├── common/              # ApiResponse, exceptions, constants
├── users/               # UserController, UserService, UserRepository, UserEntity, DTOs
├── groups/              # GroupController, GroupService, GroupRepository, GroupEntity, DTOs
├── groupmember/         # GroupMemberController, GroupMemberService, GroupMemberEntity, DTOs
├── projects/            # ProjectController, ProjectService, ProjectRepository, ProjectEntity, DTOs
├── projectmember/       # ProjectMemberController, ProjectMemberService, ProjectMemberEntity, DTOs
├── columns/             # ColumnController, ColumnService, ColumnRepository, ColumnEntity, DTOs
├── tasks/               # TaskController, TaskService, TaskRepository, TaskEntity, DTOs
├── subtasks/            # SubTaskController, SubTaskService, SubTaskEntity, DTOs
├── comments/            # CommentController, CommentService, CommentEntity, DTOs
├── labels/              # LabelController, LabelService, LabelEntity, DTOs
├── permissions/         # PermissionService, role checking utilities
└── statistics/          # StatisticsController, StatisticsService, DTOs
```

## Các bước thực hiện

### Phase 1: Setup cơ bản và Infrastructure

1. **Cấu hình cơ bản**

   - Cập nhật `pom.xml` với dependencies: JWT (io.jsonwebtoken), file upload (commons-fileupload), validation
   - Cấu hình `application.properties` với database connection (MySQL), JPA settings
   - Tạo package structure theo chuẩn Spring Boot

2. **Common Infrastructure**

   - Tạo `ApiResponse<T>` wrapper class để format response giống NestJS
   - Tạo `GlobalExceptionHandler` với `@RestControllerAdvice` để handle exceptions
   - Tạo custom exceptions: `NotFoundException`, `BadRequestException`, `ForbiddenException`
   - Cấu hình CORS để frontend có thể gọi API

3. **Security & JWT**

   - Tạo `JwtTokenProvider` để generate và validate JWT tokens
   - Tạo `JwtAuthenticationFilter` extends `OncePerRequestFilter` để verify JWT trong mỗi request
   - Tạo `SecurityConfig` với Spring Security 6:
     - Public endpoints: `/api/auth/**`
     - Protected endpoints: `/api/**` (yêu cầu JWT)
     - Password encoder: BCryptPasswordEncoder
   - Tạo `UserDetailsServiceImpl` implements `UserDetailsService`

### Phase 2: Core Modules (Auth & Users)

4. **Auth Module**

   - Entity: `UserEntity` (mapping từ `users` table)
   - Repository: `UserRepository` extends `JpaRepository<UserEntity, String>`
   - DTOs: `RegisterUserDto`, `LoginUserDto`
   - Service: `AuthService` với methods:
     - `register(RegisterUserDto)` - hash password với BCrypt, tạo user
     - `login(LoginUserDto)` - verify password, generate JWT, return `{access_token, user}`
   - Controller: `AuthController` với endpoints:
     - `POST /api/auth/register`
     - `POST /api/auth/login`

5. **Users Module**

   - DTOs: `UserProfileDto`, `UpdateUserDto`, `UpdatePasswordDto`
   - Service: `UserService` với methods:
     - `getProfile(String userId)` - lấy thông tin user (không bao gồm password)
     - `updateProfile(String userId, UpdateUserDto)`
     - `updatePassword(String userId, UpdatePasswordDto)` - verify old password, hash new password
     - `remove(String userId)` - soft delete hoặc hard delete
     - `updateAvatar(String userId, String avatarUrl)` - lưu URL avatar
   - Controller: `UserController` với endpoints:
     - `GET /api/users/profile` (protected)
     - `PUT /api/users/profile` (protected)
     - `PUT /api/users/change-password` (protected)
     - `DELETE /api/users/delete` (protected)
     - `POST /api/users/avatar` (protected, multipart/form-data) - file upload

6. **File Upload Configuration**

   - Cấu hình `MultipartConfigElement` và `CommonsMultipartResolver`
   - Tạo service `FileUploadService` để handle file uploads
   - Lưu files vào thư mục `uploads/` (giống NestJS)
   - Support: avatar (images), comment attachments (images, PDF, DOCX, XLSX)

### Phase 3: Groups & Group Members

7. **Groups Module**

   - Entity: `GroupEntity` với relationships:
     - `@ManyToOne UserEntity leader`
     - `@OneToMany GroupMemberEntity members`
     - `@OneToMany ProjectEntity projects`
   - Repository: `GroupRepository`
   - DTOs: `CreateGroupDto`, `UpdateGroupDto`, `JoinGroupDto`, `InviteMemberDto`
   - Service: `GroupService` với methods:
     - `create(CreateGroupDto, String userId)` - tạo group, set user làm leader
     - `findAllByUser(String userId)` - lấy groups mà user tham gia
     - `findPendingInvites(String userId)` - lấy lời mời chờ duyệt
     - `findPendingApprovals(String userId)` - lấy yêu cầu tham gia chờ duyệt
     - `acceptInvite(String groupId, String userId)`
     - `rejectInvite(String groupId, String userId)`
     - `joinByCode(String userId, JoinGroupDto)` - join bằng mã mời
     - `inviteMember(String userId, InviteMemberDto)` - mời thành viên (chỉ leader)
     - `approveJoinRequest(String groupId, String userId, String approverId)` - duyệt yêu cầu (chỉ leader)
     - `rejectJoinRequest(String groupId, String userId, String approverId)` - từ chối yêu cầu (chỉ leader)
     - `findPendingJoinRequests(String groupId, String userId)` - lấy danh sách chờ duyệt (chỉ leader)
     - `findOne(String id, String userId)` - chi tiết group
     - `update(String id, String userId, UpdateGroupDto)` - update (chỉ leader)
     - `remove(String id, String userId)` - xóa group (chỉ leader)
   - Controller: `GroupController` với tất cả endpoints từ NestJS

8. **Group Member Module**

   - Entity: `GroupMemberEntity` với:
     - `@ManyToOne GroupEntity group`
     - `@ManyToOne UserEntity user`
     - `role` enum: `leader`, `admin`, `member`, `viewer`
     - `status` enum: `active`, `pending`, `rejected`
   - Repository: `GroupMemberRepository`
   - DTOs: `CreateGroupMemberDto`, `UpdateGroupMemberDto`
   - Service: `GroupMemberService` với CRUD operations
   - Controller: `GroupMemberController` (nếu có endpoints riêng)

### Phase 4: Projects & Project Members

9. **Projects Module**

   - Entity: `ProjectEntity` với relationships:
     - `@ManyToOne UserEntity owner`
     - `@ManyToOne GroupEntity group` (nullable)
     - `@OneToMany ColumnEntity columns`
     - `@OneToMany ProjectMemberEntity members`
     - `@OneToMany LabelEntity labels`
   - Repository: `ProjectRepository`
   - DTOs: `CreateProjectDto`, `UpdateProjectDto`, `ProjectProgressDto`, `ColumnProgressDto`, `UserProgressDto`, `DeadlineSummaryDto`
   - Service: `ProjectService` với methods:
     - `create(CreateProjectDto, String userId)` - tạo project cá nhân hoặc thuộc group
     - `findAllByUser(String userId)` - lấy tất cả projects của user
     - `findAllByGroup(String groupId, String userId)` - lấy projects theo group
     - `findOne(String id)` - chi tiết project
     - `getProjectProgress(String id)` - tiến trình tổng
     - `getColumnProgress(String id)` - tiến trình theo cột
     - `getUserProgress(String id)` - tiến trình theo user
     - `getDeadlineSummary(String id)` - thống kê deadline
     - `update(String id, UpdateProjectDto, String userId)` - update (chỉ leader)
     - `remove(String id, String userId)` - xóa (chỉ leader)
     - `convertToGroup(String id, String groupId, String userId)` - chuyển project cá nhân thành group project
     - `removeGroup(String id, String userId)` - tách project khỏi group
   - Controller: `ProjectController` với tất cả endpoints

10. **Project Member Module**

    - Entity: `ProjectMemberEntity` với:
      - `@ManyToOne ProjectEntity project`
      - `@ManyToOne UserEntity user`
      - `role` enum: `leader`, `editor`, `viewer`
    - Repository: `ProjectMemberRepository`
    - DTOs: `CreateProjectMemberDto`, `UpdateProjectMemberDto`, `AddProjectMembersDto`
    - Service: `ProjectMemberService` với methods:
      - `getMembers(String projectId, List<String> excludeUserIds)` - lấy members (có thể exclude assignees của task)
      - `addMember(String projectId, CreateProjectMemberDto, String userId)` - thêm member (chỉ leader)
      - `addMembers(String projectId, AddProjectMembersDto)` - thêm nhiều members (chỉ leader)
      - `updateMemberRole(String projectId, String memberId, UpdateProjectMemberDto, String userId)` - update role (chỉ leader)
      - `removeMember(String projectId, String memberId, String userId)` - xóa member (chỉ leader)
      - `transferLeader(String projectId, String newLeaderId, String userId)` - chuyển quyền leader (chỉ leader)
    - Controller: `ProjectMemberController` với tất cả endpoints

### Phase 5: Columns & Tasks

11. **Columns Module**

    - Entity: `ColumnEntity` với:
      - `@ManyToOne ProjectEntity project`
      - `@OneToMany TaskEntity tasks`
      - `position` (int) - để sắp xếp
    - Repository: `ColumnRepository` với custom query: `findByProjectIdOrderByPositionAsc`
    - DTOs: `CreateColumnDto`, `UpdateColumnDto`
    - Service: `ColumnService` với methods:
      - `create(String projectId, CreateColumnDto, String userId)` - tạo column (leader/editor)
      - `findAll(String projectId)` - lấy tất cả columns của project
      - `update(String id, UpdateColumnDto, String userId)` - update (leader/editor)
      - `remove(String id, String userId)` - xóa (leader/editor)
      - `updatePositions(String projectId, List<PositionUpdateDto>)` - reorder columns (transactional)
    - Controller: `ColumnController` với base path `/api/projects/:projectId/columns`

12. **Tasks Module**

    - Entity: `TaskEntity` với:
      - `@ManyToOne ColumnEntity column`
      - `@ManyToMany UserEntity assignees` (join table: `task_assignees`)
      - `@ManyToMany LabelEntity labels` (join table: `task_labels`)
      - `@OneToMany SubTaskEntity subtasks`
      - `@OneToMany CommentEntity comments`
      - `position` (decimal/string) - để sắp xếp
      - `status` enum: `todo`, `done`
      - `priority` enum: `low`, `medium`, `high`
    - Repository: `TaskRepository` với custom queries
    - DTOs: `CreateTaskDto`, `UpdateTaskDto`, `AssignUsersDto`, `AssignLabelsDto`, `UnassignUsersDto`
    - Service: `TaskService` với methods:
      - `create(CreateTaskDto, String creatorId)` - tạo task
      - `findOne(String id)` - chi tiết task
      - `findByColumn(String columnId)` - lấy tasks theo column
      - `getAssignees(String id)` - lấy assignees
      - `update(String id, UpdateTaskDto, String userId)` - update (check permission)
      - `updateStatus(String id, String status, String userId)` - update status (check permission)
      - `updatePosition(String id, String prevTaskId, String nextTaskId, String columnId)` - reorder task
      - `assignUsers(String id, AssignUsersDto, String userId)` - gán users (check permission)
      - `unassignUsers(String id, UnassignUsersDto, String userId)` - hủy gán users
      - `assignLabels(String id, AssignLabelsDto, String userId)` - gán labels
      - `unassignLabels(String id, AssignLabelsDto, String userId)` - hủy gán labels
      - `remove(String id, String userId)` - xóa task (check permission)
      - `addSubTask(String taskId, String title)` - thêm subtask
      - `updateSubTask(String id, UpdateSubTaskDto)` - update subtask
    - Controller: `TaskController` với tất cả endpoints

13. **SubTasks Module**

    - Entity: `SubTaskEntity` với:
      - `@ManyToOne TaskEntity task`
      - `title`, `completed` (boolean)
    - Repository: `SubTaskRepository`
    - DTOs: `CreateSubTaskDto`, `UpdateSubTaskDto`
    - Service: `SubTaskService` với CRUD operations
    - Controller: `SubTaskController` (nếu có endpoints riêng, hoặc handle trong TaskController)

### Phase 6: Comments & Labels

14. **Comments Module**

    - Entity: `CommentEntity` với:
      - `@ManyToOne TaskEntity task`
      - `@ManyToOne UserEntity user`
      - `content` (text)
      - `attachmentUrl` (nullable)
    - Repository: `CommentRepository` với pagination support
    - DTOs: `CreateCommentDto`, `UpdateCommentDto`
    - Service: `CommentService` với methods:
      - `findAll(String taskId, int page, int limit)` - lấy comments với pagination
      - `create(String taskId, String userId, CreateCommentDto)` - tạo comment
      - `update(String commentId, String userId, UpdateCommentDto)` - update (chỉ người tạo)
      - `remove(String commentId, String userId)` - xóa (người tạo hoặc project leader)
    - Controller: `CommentController` với base path `/api/tasks/:taskId/comments`:
      - `GET /api/tasks/:taskId/comments` (với pagination query params)
      - `POST /api/tasks/:taskId/comments`
      - `PATCH /api/tasks/:taskId/comments/:commentId`
      - `DELETE /api/tasks/:taskId/comments/:commentId`
      - `POST /api/tasks/:taskId/comments/upload` - upload file attachment

15. **Labels Module**

    - Entity: `LabelEntity` với:
      - `@ManyToOne ProjectEntity project`
      - `@ManyToMany TaskEntity tasks` (join table: `task_labels`)
      - `name`, `color`
    - Repository: `LabelRepository`
    - DTOs: `CreateLabelDto`, `UpdateLabelDto`
    - Service: `LabelService` với CRUD operations
    - Controller: `LabelController` với endpoints:
      - `POST /api/labels`
      - `GET /api/labels`
      - `GET /api/labels/project/:projectId`
      - `GET /api/labels/:id`
      - `PATCH /api/labels/:id`
      - `DELETE /api/labels/:id`

### Phase 7: Permissions & Statistics

16. **Permissions Module**

    - Service: `PermissionService` với methods:
      - `checkGroupPermission(String groupId, String userId, List<GroupRole> requiredRoles)` - check group role
      - `checkProjectPermission(String projectId, String userId, List<ProjectRole> requiredRoles)` - check project role
      - `getGroupRole(String groupId, String userId)` - lấy role của user trong group
      - `getProjectRole(String projectId, String userId)` - lấy role của user trong project
    - Enums: `GroupRole` (leader, admin, member, viewer), `ProjectRole` (leader, editor, viewer)
    - Tạo `@PreAuthorize` annotations hoặc method-level security checks trong services

17. **Statistics Module**

    - DTOs: `ProjectOverviewDto`, `ColumnStatisticsDto`, `MemberStatisticsDto`, `TimelineStatisticsDto`, `CommentStatisticsDto`, `DeadlineAnalyticsDto`
    - Service: `StatisticsService` với methods:
      - `getProjectOverview(String projectId)` - tổng quan project
      - `getColumnStatistics(String projectId)` - thống kê theo cột
      - `getMemberStatistics(String projectId)` - thống kê theo member
      - `getTimelineStatistics(String projectId, String period, Date startDate, Date endDate)` - thống kê timeline
      - `getCommentStatistics(String projectId, String filter)` - thống kê comments
      - `getDeadlineAnalytics(String projectId)` - phân tích deadline
    - Controller: `StatisticsController` với base path `/api/projects/:projectId/statistics`:
      - `GET /api/projects/:projectId/statistics/overview`
      - `GET /api/projects/:projectId/statistics/columns`
      - `GET /api/projects/:projectId/statistics/members`
      - `GET /api/projects/:projectId/statistics/timeline` (với query params: period, startDate, endDate)
      - `GET /api/projects/:projectId/statistics/comments` (với query param: filter)
      - `GET /api/projects/:projectId/statistics/deadlines`

### Phase 8: Testing & Validation

18. **Testing**

    - Test các API endpoints với Postman hoặc unit tests
    - Verify response format giống hệt NestJS
    - Test JWT authentication flow
    - Test file uploads
    - Test permissions và role-based access

19. **Documentation**

    - Cập nhật API documentation (nếu có Swagger)
    - Ghi chú về các thay đổi so với NestJS (nếu có)

## Lưu ý quan trọng

1. **API Compatibility**: Tất cả endpoints phải giữ nguyên:

   - URL paths (ví dụ: `/api/auth/login`, `/api/projects/:id`)
   - HTTP methods (GET, POST, PUT, PATCH, DELETE)
   - Request/Response format (JSON structure)
   - Query parameters và path parameters

2. **JWT Token**: 

   - Format: `Bearer <token>` trong Authorization header
   - Payload: `{sub: userId, email: userEmail}`
   - Secret key phải giống với NestJS (hoặc configurable)

3. **Database**:

   - Sử dụng cùng database MySQL
   - Entity mapping phải match với database schema hiện tại
   - UUID primary keys (String trong Java)
   - Timestamps: `created_at`, `updated_at`

4. **File Uploads**:

   - Lưu vào thư mục `uploads/` (giống NestJS)
   - Return URL: `/uploads/{filename}`
   - Max file size: 5MB

5. **Error Handling**:

   - HTTP status codes giống NestJS
   - Error messages bằng tiếng Việt (giống NestJS)

6. **CORS**: Cấu hình để frontend có thể gọi API từ `http://localhost:5173` (hoặc port khác)

## Thứ tự ưu tiên implementation

1. Phase 1-2: Infrastructure + Auth + Users (cơ bản nhất)
2. Phase 3-4: Groups + Projects (core business logic)
3. Phase 5: Columns + Tasks (phức tạp nhất, có DnD)
4. Phase 6-7: Comments + Labels + Statistics (bổ sung)
5. Phase 8: Testing & Polish