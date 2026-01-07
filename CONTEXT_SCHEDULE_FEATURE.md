# Context: Tính năng Lịch làm việc (Schedule Feature)

## Ngày cập nhật: 2026-01-06

## Mục đích
User yêu cầu thêm tính năng hiển thị lịch làm việc từ dữ liệu bảng công việc, với mục đích sau này phát triển thêm chức năng tự động sắp xếp lịch làm việc bằng AI.

---

## Cấu trúc dự án
- **Backend**: `be/` - NestJS + TypeORM + MySQL
- **Frontend**: `qlda-fe/` - React + Vite + Ant Design + React Query

---

## Tính năng đã triển khai

### 1. Backend API
**Endpoint**: `GET /tasks/schedule/my?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Response**:
```typescript
{
  id, title, description, startDate, dueDate, status, priority,
  progress, projectId, projectName, columnName, labels, assignees
}[]
```

### 2. Frontend Components

| Component | Mô tả |
|-----------|-------|
| `SchedulePage` | Trang chính với thống kê, controls, calendar/day view |
| `CalendarView` | Calendar tháng với badges priority |
| `DayView` | Danh sách tasks phân nhóm Sáng/Chiều/Tối |
| `DayTasksPopover` | Popover khi hover/click ngày |

### 3. Features
- Toggle xem theo Tháng / Ngày
- Navigation: ◀ ▶ buttons, DatePicker, "Hôm nay"
- Filters: trạng thái (todo/done), priority (high/medium/low)
- Day view: tasks grouped by time of day
- Click ngày → xem chi tiết
- Click task → đến project board

---

## Files

**Backend:**
- `be/src/tasks/tasks.controller.ts` - Endpoint
- `be/src/tasks/tasks.service.ts` - Method `getMySchedule`

**Frontend:**
- `qlda-fe/src/pages/schedule/index.tsx`
- `qlda-fe/src/pages/schedule/components/CalendarView.tsx`
- `qlda-fe/src/pages/schedule/components/DayView.tsx`
- `qlda-fe/src/pages/schedule/components/DayTasksPopover.tsx`
- `qlda-fe/src/types/schedule.type.ts`
- `qlda-fe/src/services/schedule.services.ts`
- `qlda-fe/src/App.tsx` - Route `/schedule`
- `qlda-fe/src/layouts/AppLayout.tsx` - Menu item

---

## Hướng phát triển AI Scheduling

### Dữ liệu cần thêm
- `estimated_hours` - Thời gian ước tính
- `complexity` - Độ phức tạp
- User skills và workload
- Task dependencies

### API cần thêm
- `POST /schedule/suggest` - AI gợi ý
- `POST /schedule/optimize` - Tối ưu hóa
- `PATCH /tasks/:id/reschedule` - Di chuyển task

### UI Features
- Drag-drop trên calendar
- View theo tuần
- Conflict detection
- AI suggestion panel

---

## Test credentials
- Email: nguyenvanan@qlda.com
- Password: Password123!
