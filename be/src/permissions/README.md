# Permission System Tests

## Chạy Tests

```bash
# Chạy tất cả tests
npm test

# Chạy tests với coverage
npm run test:cov

# Chạy tests trong watch mode
npm run test:watch

# Chạy tests cho permissions module cụ thể
npm test -- permissions
```

## Test Files

- `permissions.service.spec.ts` - Tests cho PermissionsService
- `guards/project-role.guard.spec.ts` - Tests cho ProjectRoleGuard
- `guards/group-role.guard.spec.ts` - Tests cho GroupRoleGuard

## Test Coverage

### PermissionsService Tests
- ✅ getUserProjectRole - Kiểm tra role của user trong project
- ✅ getUserGroupRole - Kiểm tra role của user trong group
- ✅ checkProjectPermission - Kiểm tra permission với single/multiple roles
- ✅ checkGroupPermission - Kiểm tra permission trong group
- ✅ canEditProject, canDeleteProject, canManageMembers
- ✅ canEditTask, canDeleteTask, canEditColumn
- ✅ canUpdateTaskStatus - Kiểm tra quyền update status (viewer chỉ được update nếu là assignee)
- ✅ isProjectMember, isGroupMember

### Guard Tests
- ✅ Cho phép access nếu không có required roles
- ✅ Cho phép access nếu user có required role
- ✅ Throw ForbiddenException nếu user không có quyền
- ✅ Throw NotFoundException nếu thiếu projectId/groupId
- ✅ Extract projectId từ params.id nếu không có projectId
- ✅ Extract groupId từ params.id nếu không có groupId

