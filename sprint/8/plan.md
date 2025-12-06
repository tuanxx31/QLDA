# Kế hoạch Sprint: Quản lý phân quyền

## Tổng quan

Xây dựng hệ thống phân quyền tập trung cho Groups và Projects, bao gồm:

- Backend: Permission Service, Guards, Decorators để kiểm tra quyền tự động
- Frontend: Permission Hooks và UI components để hiển thị/ẩn actions dựa trên quyền

## Phạm vi phân quyền

### Groups

- **Leader**: Toàn quyền (update, delete, invite, manage members)
- **Member**: Xem, tạo project trong nhóm

### Projects  

- **Leader**: Toàn quyền (update, delete, manage members, manage columns/tasks)
- **Editor**: Tạo/sửa/xóa columns và tasks
- **Viewer**: Chỉ xem, cập nhật status task được gán

## Phase 1: Backend Foundation

### 1.1 Tạo Permission Module

- Tạo `be/src/permissions/permissions.module.ts`
- Tạo `be/src/permissions/permissions.service.ts` với các methods:
- `checkProjectPermission(projectId, userId, requiredRole)`
- `checkGroupPermission(groupId, userId, requiredRole)`
- `getUserProjectRole(projectId, userId)`
- `getUserGroupRole(groupId, userId)`
- `canEditProject(projectId, userId)`
- `canDeleteProject(projectId, userId)`
- `canManageMembers(projectId, userId)`
- `canEditTask(projectId, userId)`
- `canDeleteTask(projectId, userId)`

### 1.2 Tạo Permission Guards & Decorators

- Tạo `be/src/permissions/guards/project-role.guard.ts`
- Tạo `be/src/permissions/guards/group-role.guard.ts`
- Tạo `be/src/permissions/decorators/require-project-role.decorator.ts`
- Tạo `be/src/permissions/decorators/require-group-role.decorator.ts`
- Tạo `be/src/permissions/decorators/project-param.decorator.ts` để extract projectId từ params

### 1.3 Cập nhật App Module

- Import `PermissionsModule` vào `be/src/app.module.ts`
- Export `PermissionsService` để các module khác sử dụng

## Phase 2: Backend Integration - Projects

### 2.1 Refactor Projects Controller

- Áp dụng `@RequireProjectRole()` vào các endpoints trong `be/src/projects/projects.controller.ts`:
- `PATCH /:id` → require 'leader'
- `DELETE /:id` → require 'leader'
- `PATCH /:id/convert-to-group` → require 'leader'
- `PATCH /:id/remove-group` → require 'leader'
- Giữ nguyên logic kiểm tra trong service để đảm bảo backward compatibility

### 2.2 Refactor Project Members Controller

- Áp dụng guards vào `be/src/project-members/project-members.controller.ts`:
- `POST /:projectId` → require 'leader'
- `PATCH /:projectId/:memberId` → require 'leader'
- `DELETE /:projectId/:memberId` → require 'leader'
- `PUT /:projectId/transfer-leader/:newLeaderId` → require 'leader'

### 2.3 Bảo vệ Columns Endpoints

- Cập nhật `be/src/columns/columns.controller.ts`:
- `POST /projects/:projectId/columns` → require 'leader' hoặc 'editor'
- `PATCH /projects/:projectId/columns/:id` → require 'leader' hoặc 'editor'
- `DELETE /projects/:projectId/columns/:id` → require 'leader' hoặc 'editor'
- Cập nhật `be/src/columns/columns.service.ts` để sử dụng `PermissionsService`

### 2.4 Bảo vệ Tasks Endpoints

- Cập nhật `be/src/tasks/tasks.controller.ts`:
- `POST /tasks` → require project membership với role 'leader' hoặc 'editor'
- `PATCH /tasks/:id` → require 'leader' hoặc 'editor' (viewer chỉ được update status nếu là assignee)
- `DELETE /tasks/:id` → require 'leader' hoặc 'editor'
- `PATCH /tasks/:id/assignees` → require 'leader' hoặc 'editor'
- `PATCH /tasks/:id/labels` → require 'leader' hoặc 'editor'
- Cập nhật `be/src/tasks/tasks.service.ts` để kiểm tra quyền qua column → project

## Phase 3: Backend Integration - Groups

### 3.1 Refactor Groups Controller

- Áp dụng `@RequireGroupRole()` vào `be/src/groups/groups.controller.ts`:
- `PUT /:id` → require 'leader'
- `DELETE /:id` → require 'leader'
- `POST /invite` → require 'leader'
- Cập nhật `be/src/groups/groups.service.ts` để sử dụng `PermissionsService` thay vì check thủ công

## Phase 4: Frontend Foundation

### 4.1 Tạo Permission Types

- Tạo `qlda-fe/src/types/permission.type.ts` với:
- `ProjectRole`, `GroupRole` enums
- `ProjectPermission`, `GroupPermission` interfaces
- Permission constants

### 4.2 Tạo Permission Hooks

- Tạo `qlda-fe/src/hooks/useProjectPermission.ts`:
- Trả về `{ role, canEdit, canDelete, canManageMembers, canEditTasks, canDeleteTasks }`
- Sử dụng React Query để cache permission data
- Tạo `qlda-fe/src/hooks/useGroupPermission.ts`:
- Trả về `{ role, canEdit, canDelete, canInvite, canManageMembers }`

### 4.3 Tạo Permission Utilities

- Tạo `qlda-fe/src/utils/permissions.ts` với:
- `hasProjectPermission(role, permission)`
- `hasGroupPermission(role, permission)`
- `canEditProject(role)`, `canDeleteProject(role)`, etc.

### 4.4 Tạo Permission Service (API)

- Cập nhật `qlda-fe/src/services/project.services.ts`:
- Thêm `getProjectPermission(projectId)` để lấy role của user trong project
- Cập nhật `qlda-fe/src/services/group.services.ts`:
- Thêm `getGroupPermission(groupId)` để lấy role của user trong group

## Phase 5: Frontend UI Updates

### 5.1 Cập nhật Project Detail Page

- Refactor `qlda-fe/src/pages/projects/detail/index.tsx`:
- Sử dụng `useProjectPermission()` thay vì check thủ công
- Ẩn/hiện buttons dựa trên permissions

### 5.2 Cập nhật Project Board

- Cập nhật `qlda-fe/src/pages/projects/detail/components/SortableColumn.tsx`:
- Ẩn nút "Add Task" nếu không có quyền 'editor' hoặc 'leader'
- Cập nhật `qlda-fe/src/pages/projects/detail/components/TaskCard.tsx`:
- Ẩn edit/delete buttons dựa trên permission
- Viewer chỉ có thể update status nếu là assignee

### 5.3 Cập nhật Task Detail Modal

- Cập nhật `qlda-fe/src/pages/projects/detail/components/TaskDetailModal.tsx`:
- Disable các fields dựa trên permission
- Ẩn delete button nếu không có quyền

### 5.4 Cập nhật Project Members Component

- Cập nhật `qlda-fe/src/pages/projects/detail/components/ProjectMembers.tsx`:
- Chỉ hiển thị action buttons (change role, remove) nếu có quyền 'leader'
- Hiển thị role badges

### 5.5 Tạo Permission Wrapper Component

- Tạo `qlda-fe/src/components/PermissionWrapper.tsx`:
- Component wrapper để ẩn/hiện children dựa trên permission
- Props: `projectId`, `permission`, `fallback?`

## Phase 6: Group UI Updates

### 6.1 Cập nhật Group Detail Page

- Sử dụng `useGroupPermission()` để kiểm tra quyền
- Ẩn/hiện actions dựa trên role

### 6.2 Cập nhật Group Members Management

- Chỉ leader mới thấy buttons để invite/remove members
- Hiển thị role badges

## Phase 7: Testing & Refinement

### 7.1 Backend Testing

- Test các guards với các role khác nhau
- Test edge cases (user không phải member, project không tồn tại, etc.)

### 7.2 Frontend Testing

- Test permission hooks với các role khác nhau
- Test UI hiển thị đúng với từng role

## Files sẽ được tạo/sửa đổi

### Backend

- `be/src/permissions/permissions.module.ts` (mới)
- `be/src/permissions/permissions.service.ts` (mới)
- `be/src/permissions/guards/project-role.guard.ts` (mới)
- `be/src/permissions/guards/group-role.guard.ts` (mới)
- `be/src/permissions/decorators/require-project-role.decorator.ts` (mới)
- `be/src/permissions/decorators/require-group-role.decorator.ts` (mới)
- `be/src/permissions/decorators/project-param.decorator.ts` (mới)
- `be/src/projects/projects.controller.ts` (sửa)
- `be/src/projects/projects.service.ts` (sửa - refactor permission checks)
- `be/src/project-members/project-members.controller.ts` (sửa)
- `be/src/columns/columns.controller.ts` (sửa)
- `be/src/columns/columns.service.ts` (sửa)
- `be/src/tasks/tasks.controller.ts` (sửa)
- `be/src/tasks/tasks.service.ts` (sửa)
- `be/src/groups/groups.controller.ts` (sửa)
- `be/src/groups/groups.service.ts` (sửa)
- `be/src/app.module.ts` (sửa)

### Frontend

- `qlda-fe/src/types/permission.type.ts` (mới)
- `qlda-fe/src/hooks/useProjectPermission.ts` (mới)
- `qlda-fe/src/hooks/useGroupPermission.ts` (mới)
- `qlda-fe/src/utils/permissions.ts` (mới)
- `qlda-fe/src/components/PermissionWrapper.tsx` (mới)
- `qlda-fe/src/services/project.services.ts` (sửa)
- `qlda-fe/src/services/group.services.ts` (sửa)
- `qlda-fe/src/pages/projects/detail/index.tsx` (sửa)
- `qlda-fe/src/pages/projects/detail/components/SortableColumn.tsx` (sửa)
- `qlda-fe/src/pages/projects/detail/components/TaskCard.tsx` (sửa)
- `qlda-fe/src/pages/projects/detail/components/TaskDetailModal.tsx` (sửa)
- `qlda-fe/src/pages/projects/detail/components/ProjectMembers.tsx` (sửa)