# AI Smart Scheduling - Context Documentation

## Tổng quan tính năng

Tính năng **AI Smart Scheduling** đã được triển khai để gợi ý lịch làm việc thông minh cho người dùng.

### Cập nhật mới nhất: 2026-01-10

---

## Cấu trúc Backend

### Files đã tạo:

```
be/src/ai/
├── ai.module.ts          # NestJS module để quản lý AI
├── ai.service.ts         # Service xử lý logic AI với OpenAI
├── ai.controller.ts      # REST endpoints
└── dto/
    └── suggest-schedule.dto.ts  # DTOs và response types
```

### API Endpoints:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/ai/suggest-schedule` | Gợi ý lịch làm việc cho ngày cụ thể |
| GET | `/api/ai/workload-analysis` | Phân tích workload trong khoảng thời gian |

### Cấu hình:

- **API Key**: Sử dụng `OPENAI_API_KEY` trong file `.env`
- **Model**: `gpt-4o-mini` (có thể thay đổi trong `ai.service.ts`)
- **Docker**: Đã thêm `OPENAI_API_KEY` vào `production/docker-compose.yaml`

---

## Cấu trúc Frontend

### Files đã tạo:

```
qlda-fe/src/
├── services/
│   └── ai.services.ts    # API service cho AI endpoints
└── pages/schedule/components/
    ├── AIScheduleSuggestion.tsx   # Component hiển thị gợi ý AI
    └── AIScheduleSuggestion.css   # Styles với gradient design
```

### Component Features:

1. **Manual Trigger**: AI không tự động gọi, người dùng phải click "Tạo gợi ý"
2. **Collapsible**: Có thể thu gọn/mở rộng
3. **LocalStorage Persistence**: Gợi ý được lưu theo ngày, không mất khi F5
4. **Database Update**: Tick hoàn thành → cập nhật status vào database
5. **Empty state**: Hiển thị thông báo khi không có task
6. **Error handling**: Hiển thị fallback khi AI không khả dụng

---

## Cách sử dụng

### 1. Tạo gợi ý AI

Truy cập trang **Lịch làm việc** (`/schedule`), click nút **"Tạo gợi ý"** để AI phân tích.

### 2. Hoàn thành task

Tick checkbox bên cạnh task → Task được cập nhật thành `done` trong database và biến mất khỏi gợi ý.

### 3. Làm mới gợi ý

Click nút **"Tạo gợi ý mới"** để AI phân tích lại (sẽ reset danh sách hoàn thành).

---

## LocalStorage Structure

Gợi ý được lưu với key: `ai_suggestions_YYYY-MM-DD`

```json
{
  "suggestions": { /* ScheduleSuggestionResponse */ },
  "completedTaskIds": ["task-id-1", "task-id-2"],
  "savedAt": "2026-01-10T22:25:00.000Z"
}
```

---

## Response Format

### Suggest Schedule Response:

```json
{
  "suggestions": [
    {
      "taskId": "uuid",
      "taskTitle": "Tên task",
      "order": 1,
      "suggestedStartTime": "09:00",
      "reason": "Deadline hôm nay, cần làm ngay",
      "priority": "high"
    }
  ],
  "warnings": ["Task X có thể không kịp deadline"],
  "summary": "Có 5 task cần làm hôm nay, ưu tiên 2 task deadline gấp"
}
```

---

## Bug Fixes đã thực hiện

### 1. userId field (2026-01-10)
- **File**: `be/src/ai/ai.controller.ts`
- **Vấn đề**: Sử dụng `req.user.id` thay vì `req.user.sub`
- **Fix**: Đổi thành `req.user.sub` để match với TaskController

---

## Lưu ý kỹ thuật

1. **Manual Trigger**: Sử dụng `useMutation` thay vì `useQuery` để không auto-fetch
2. **Persistence**: Lưu vào localStorage, load lại khi component mount
3. **Database Sync**: Gọi `taskService.updateStatus(id, 'done')` khi tick checkbox
4. **Query Invalidation**: Sau khi hoàn thành, invalidate `['schedule']` để refresh calendar
5. **Fallback Mode**: Khi OpenAI không khả dụng, service trả về gợi ý dựa trên priority đơn giản

---

## Phát triển tiếp theo

### Tính năng có thể thêm:

1. **Suggest Reschedule** - Gợi ý dời lịch khi có conflict
2. **Workload Analysis UI** - Hiển thị phân tích workload trên giao diện
3. **AI Chat** - Cho phép người dùng hỏi AI về lịch làm việc
4. **Smart Notifications** - Thông báo từ AI khi có task quan trọng

---

## Dependencies đã thêm

### Backend:
```bash
yarn add openai
```

Package `openai` version `6.16.0` đã được cài đặt.

---

## File đã sửa đổi

| File | Thay đổi |
|------|----------|
| `be/src/app.module.ts` | Thêm import AiModule |
| `be/src/ai/ai.controller.ts` | Fix `req.user.id` → `req.user.sub` |
| `qlda-fe/src/pages/schedule/index.tsx` | Tích hợp AIScheduleSuggestion component |
| `qlda-fe/src/pages/schedule/components/AIScheduleSuggestion.tsx` | Component chính với localStorage + API update |
| `qlda-fe/src/pages/schedule/components/AIScheduleSuggestion.css` | Styles với gradient design |
| `qlda-fe/src/services/ai.services.ts` | API service |
| `production/docker-compose.yaml` | Thêm OPENAI_API_KEY |

