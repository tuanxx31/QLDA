# Frontend Permission Tests

## Setup Testing Environment

Để chạy tests cho frontend, bạn cần cài đặt các dependencies sau:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest @vitest/ui
```

Và thêm vào `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Test Files

- `permissions.test.ts` - Tests cho permission utility functions
- `hooks/useProjectPermission.test.tsx` - Tests cho useProjectPermission hook
- `hooks/useGroupPermission.test.tsx` - Tests cho useGroupPermission hook
- `components/PermissionWrapper.test.tsx` - Tests cho PermissionWrapper component

## Test Coverage

### Permission Utilities Tests
- ✅ hasProjectPermission - Kiểm tra permission với single/multiple roles
- ✅ hasGroupPermission - Kiểm tra permission trong group
- ✅ canEditProject, canDeleteProject, canManageMembers
- ✅ canEditTasks, canDeleteTasks, canEditColumns
- ✅ canViewProject
- ✅ canEditGroup, canDeleteGroup, canInviteMembers
- ✅ canManageGroupMembers, canViewGroup

### Hook Tests
- ✅ useProjectPermission - Kiểm tra permissions khi user là owner/member/không phải member
- ✅ useGroupPermission - Kiểm tra permissions khi user là leader/member/không phải member
- ✅ Loading states
- ✅ Null/undefined handling

### Component Tests
- ✅ PermissionWrapper - Render children khi có permission
- ✅ PermissionWrapper - Ẩn children khi không có permission
- ✅ PermissionWrapper - Render fallback khi không có permission
- ✅ PermissionWrapper - Loading state handling

