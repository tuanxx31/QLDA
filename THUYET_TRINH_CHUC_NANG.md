# THUYẾT TRÌNH VỀ CÁC CHỨC NĂNG HỆ THỐNG QLDA
## Hệ thống Quản Lý Dự Án cho Sinh viên

---

## 📋 MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Chức năng xác thực và người dùng](#2-chức-năng-xác-thực-và-người-dùng)
3. [Quản lý nhóm làm việc](#3-quản-lý-nhóm-làm-việc)
4. [Quản lý dự án](#4-quản-lý-dự-án)
5. [Quản lý công việc (Kanban Board)](#5-quản-lý-công-việc-kanban-board)
6. [Hệ thống phân quyền](#6-hệ-thống-phân-quyền)
7. [Thống kê và phân tích](#7-thống-kê-và-phân-tích)
8. [Lịch làm việc thông minh với AI](#8-lịch-làm-việc-thông-minh-với-ai)
9. [Công nghệ sử dụng](#9-công-nghệ-sử-dụng)

---

## 1. TỔNG QUAN HỆ THỐNG

**QLDA** là hệ thống quản lý dự án được thiết kế đặc biệt cho sinh viên, hỗ trợ:
- Quản lý dự án theo mô hình Kanban
- Làm việc nhóm hiệu quả
- Theo dõi tiến độ và thống kê chi tiết
- Gợi ý lịch làm việc thông minh bằng AI

### Kiến trúc hệ thống:
- **Frontend**: React + TypeScript + Vite + Ant Design
- **Backend**: NestJS + TypeORM + MySQL (và đang phát triển Spring Boot)
- **AI Integration**: OpenAI GPT-4o-mini

---

## 2. CHỨC NĂNG XÁC THỰC VÀ NGƯỜI DÙNG

### 2.1. Đăng ký và Đăng nhập
- ✅ Đăng ký tài khoản mới với email và mật khẩu
- ✅ Đăng nhập bằng email/password
- ✅ Đăng nhập bằng Google OAuth
- ✅ Quên mật khẩu và đặt lại mật khẩu
- ✅ Xác thực JWT cho tất cả các API

### 2.2. Quản lý hồ sơ người dùng
- ✅ Xem và chỉnh sửa thông tin cá nhân
- ✅ Đổi mật khẩu
- ✅ Upload avatar
- ✅ Quản lý cài đặt bảo mật

---

## 3. QUẢN LÝ NHÓM LÀM VIỆC

### 3.1. Tạo và quản lý nhóm
- ✅ Tạo nhóm làm việc mới
- ✅ Chỉnh sửa thông tin nhóm
- ✅ Xóa nhóm (chỉ Leader)
- ✅ Xem danh sách các nhóm đã tham gia

### 3.2. Quản lý thành viên nhóm
- ✅ Mời thành viên vào nhóm bằng email
- ✅ Chấp nhận/từ chối lời mời tham gia nhóm
- ✅ Xem danh sách thành viên và vai trò
- ✅ Thay đổi vai trò thành viên (Leader/Member)
- ✅ Xóa thành viên khỏi nhóm
- ✅ Rời khỏi nhóm

### 3.3. Vai trò trong nhóm
- **Leader**: Toàn quyền quản lý nhóm
- **Member**: Xem và tạo dự án trong nhóm

---

## 4. QUẢN LÝ DỰ ÁN

### 4.1. Tạo và quản lý dự án
- ✅ Tạo dự án mới trong nhóm
- ✅ Chỉnh sửa thông tin dự án (tên, mô tả, deadline)
- ✅ Xóa dự án (chỉ Leader)
- ✅ Xem danh sách dự án theo nhóm
- ✅ Xem chi tiết dự án

### 4.2. Quản lý thành viên dự án
- ✅ Thêm thành viên từ nhóm vào dự án
- ✅ Mời thành viên mới vào dự án
- ✅ Xem danh sách thành viên và vai trò
- ✅ Thay đổi vai trò thành viên (Leader/Editor/Viewer)
- ✅ Xóa thành viên khỏi dự án
- ✅ Rời khỏi dự án

### 4.3. Vai trò trong dự án
- **Leader**: Toàn quyền quản lý dự án
- **Editor**: Tạo/sửa/xóa columns và tasks
- **Viewer**: Chỉ xem, cập nhật status task được gán

---

## 5. QUẢN LÝ CÔNG VIỆC (KANBAN BOARD)

### 5.1. Quản lý cột (Columns)
- ✅ Tạo cột mới trong dự án
- ✅ Đổi tên và chỉnh sửa cột
- ✅ Xóa cột
- ✅ **Drag & Drop** để sắp xếp lại thứ tự cột
- ✅ Tự động lưu vị trí mới

### 5.2. Quản lý nhiệm vụ (Tasks)
- ✅ Tạo task mới trong cột
- ✅ Chỉnh sửa thông tin task:
  - Tiêu đề, mô tả
  - Ngày bắt đầu và deadline
  - Độ ưu tiên (High/Medium/Low)
  - Tiến độ (progress)
  - Trạng thái (todo/doing/done)
- ✅ Xóa task
- ✅ **Drag & Drop** để di chuyển task giữa các cột
- ✅ **Drag & Drop** để sắp xếp lại thứ tự task trong cùng cột
- ✅ Gán nhiều người thực hiện (assignees)
- ✅ Gán nhãn (labels) cho task

### 5.3. Quản lý nhiệm vụ con (Sub-tasks)
- ✅ Tạo sub-task trong task
- ✅ Chỉnh sửa sub-task
- ✅ Đánh dấu hoàn thành sub-task
- ✅ Xóa sub-task
- ✅ Hiển thị tiến độ hoàn thành sub-tasks

### 5.4. Quản lý nhãn (Labels)
- ✅ Tạo nhãn mới với màu sắc tùy chỉnh
- ✅ Gán nhãn cho task
- ✅ Xóa nhãn khỏi task
- ✅ Quản lý danh sách nhãn của dự án

### 5.5. Hệ thống bình luận (Comments)
- ✅ Thêm bình luận vào task
- ✅ Chỉnh sửa bình luận của mình
- ✅ Xóa bình luận
- ✅ **Mention** người dùng trong bình luận (@username)
- ✅ Upload file đính kèm trong bình luận
- ✅ **Real-time updates** - Cập nhật bình luận theo thời gian thực
- ✅ Hiển thị số bình luận chưa đọc

---

## 6. HỆ THỐNG PHÂN QUYỀN

### 6.1. Phân quyền theo vai trò
- ✅ Kiểm tra quyền tự động qua **Guards** và **Decorators**
- ✅ `@RequireGroupRole()` - Kiểm tra quyền trong nhóm
- ✅ `@RequireProjectRole()` - Kiểm tra quyền trong dự án
- ✅ Bảo vệ API endpoints theo vai trò

### 6.2. Quyền truy cập
- ✅ Chỉ Leader có thể xóa/sửa nhóm/dự án
- ✅ Editor có thể quản lý columns và tasks
- ✅ Viewer chỉ có thể xem và cập nhật task được gán
- ✅ Kiểm tra quyền ở cả Backend và Frontend

---

## 7. THỐNG KÊ VÀ PHÂN TÍCH

### 7.1. Thống kê tổng quan (Overview Analytics)
- ✅ Tổng số cột, tổng số nhiệm vụ
- ✅ Tổng số thành viên, tổng số bình luận
- ✅ Phân bổ nhiệm vụ theo trạng thái (todo/doing/done)
- ✅ Tiến độ tổng thể của dự án
- ✅ Hiển thị dạng thẻ thống kê trực quan

### 7.2. Thống kê theo cột (Column Statistics)
- ✅ Số lượng task trong mỗi cột
- ✅ Phân tích phân bổ công việc theo cột
- ✅ Biểu đồ cột (bar chart) hiển thị số lượng task

### 7.3. Thống kê thành viên (Member Statistics)
- ✅ Số nhiệm vụ hoàn thành của từng thành viên
- ✅ Mức độ tham gia (task activity) của từng thành viên
- ✅ Biểu đồ so sánh hiệu suất giữa các thành viên
- ✅ Bảng thống kê chi tiết theo thành viên

### 7.4. Thống kê theo thời gian (Timeline Statistics)
- ✅ Thống kê nhiệm vụ tạo mới theo ngày/tuần/tháng
- ✅ Thống kê nhiệm vụ hoàn thành theo ngày/tuần/tháng
- ✅ Biểu đồ đường (line chart) phân tích xu hướng công việc
- ✅ Lọc theo khoảng thời gian tùy chỉnh

### 7.5. Thống kê bình luận (Comment Statistics)
- ✅ Tổng số bình luận của dự án
- ✅ Thống kê bình luận theo từng nhiệm vụ
- ✅ Thống kê bình luận theo từng thành viên
- ✅ Top nhiệm vụ có số bình luận nhiều nhất
- ✅ Lọc theo thời gian (24h, 7 ngày, tất cả)

### 7.6. Phân tích deadline (Deadline Analytics)
- ✅ Thống kê nhiệm vụ sắp đến hạn
- ✅ Thống kê nhiệm vụ quá hạn
- ✅ Phân tích tỷ lệ hoàn thành đúng hạn
- ✅ Cảnh báo deadline sắp tới

---

## 8. LỊCH LÀM VIỆC THÔNG MINH VỚI AI

### 8.1. Lịch làm việc (Schedule)
- ✅ Xem lịch làm việc theo tháng (Calendar View)
- ✅ Xem lịch làm việc theo ngày (Day View)
- ✅ Lọc theo trạng thái (todo/done)
- ✅ Lọc theo độ ưu tiên (high/medium/low)
- ✅ Phân nhóm tasks theo buổi (Sáng/Chiều/Tối)
- ✅ Click vào ngày để xem chi tiết tasks
- ✅ Click vào task để điều hướng đến project board

### 8.2. Gợi ý lịch làm việc bằng AI 🤖
- ✅ **Tạo gợi ý lịch làm việc hôm nay**:
  - AI phân tích tất cả tasks của người dùng
  - Đề xuất thứ tự ưu tiên làm việc
  - Gợi ý thời gian bắt đầu cho mỗi task
  - Giải thích lý do cho từng gợi ý
  
- ✅ **Tính năng thông minh**:
  - Phân tích deadline và độ ưu tiên
  - Cảnh báo tasks có thể không kịp deadline
  - Đề xuất tasks có thể dời sang ngày khác
  - Tối ưu hóa lịch làm việc trong ngày

- ✅ **Trải nghiệm người dùng**:
  - Component có thể thu gọn/mở rộng
  - Lưu gợi ý vào LocalStorage (không mất khi F5)
  - Tick hoàn thành task → tự động cập nhật database
  - Hiển thị trạng thái loading và xử lý lỗi
  - Fallback khi AI không khả dụng

### 8.3. Phân tích workload
- ✅ Phân tích workload trong khoảng thời gian
- ✅ Cảnh báo khi có quá nhiều công việc
- ✅ Gợi ý phân bổ công việc hợp lý

---

## 9. CÔNG NGHỆ SỬ DỤNG

### Frontend
- **React 18+** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool nhanh
- **Ant Design** - UI Component Library
- **React Query** - Data fetching và caching
- **React DnD** - Drag and Drop

### Backend
- **NestJS 11** - Node.js Framework
- **TypeORM 0.3+** - ORM
- **MySQL** - Database
- **Passport JWT** - Authentication
- **OpenAI API** - AI Integration
- **Swagger** - API Documentation

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📊 TỔNG KẾT CÁC CHỨC NĂNG CHÍNH

| Module | Số lượng chức năng | Mô tả |
|--------|-------------------|-------|
| **Authentication** | 5+ | Đăng ký, đăng nhập, OAuth, quản lý mật khẩu |
| **Groups** | 8+ | Tạo nhóm, quản lý thành viên, phân quyền |
| **Projects** | 10+ | Tạo dự án, quản lý thành viên, phân quyền |
| **Kanban Board** | 15+ | Columns, Tasks, Sub-tasks, Labels, Comments |
| **Statistics** | 6 loại | Overview, Columns, Members, Timeline, Comments, Deadlines |
| **AI Scheduling** | 3+ | Gợi ý lịch làm việc, phân tích workload |
| **Permissions** | Toàn hệ thống | RBAC cho Groups và Projects |

---

## 🎯 ĐIỂM NỔI BẬT CỦA HỆ THỐNG

1. ✅ **Kanban Board đầy đủ tính năng** với Drag & Drop mượt mà
2. ✅ **Hệ thống phân quyền linh hoạt** theo vai trò
3. ✅ **Thống kê chi tiết** với nhiều loại biểu đồ và phân tích
4. ✅ **AI tích hợp** để gợi ý lịch làm việc thông minh
5. ✅ **Real-time updates** cho bình luận
6. ✅ **Giao diện hiện đại** với Ant Design
7. ✅ **API RESTful** đầy đủ với Swagger documentation
8. ✅ **Bảo mật tốt** với JWT và phân quyền chi tiết

---

## 📝 GHI CHÚ CHO THUYẾT TRÌNH

### Slide 1: Giới thiệu
- Tên dự án: QLDA - Hệ thống Quản Lý Dự Án
- Mục đích: Hỗ trợ sinh viên quản lý dự án và làm việc nhóm hiệu quả

### Slide 2-3: Kiến trúc và công nghệ
- Frontend: React + TypeScript + Ant Design
- Backend: NestJS + MySQL
- AI: OpenAI GPT-4o-mini

### Slide 4-5: Quản lý nhóm và dự án
- Tạo nhóm, mời thành viên
- Tạo dự án trong nhóm
- Phân quyền Leader/Member/Editor/Viewer

### Slide 6-7: Kanban Board
- Demo Drag & Drop
- Quản lý tasks, sub-tasks, labels
- Hệ thống bình luận với mention

### Slide 8: Thống kê và phân tích
- Show các biểu đồ thống kê
- Phân tích hiệu suất thành viên
- Timeline analytics

### Slide 9: AI Smart Scheduling
- Demo tính năng gợi ý lịch làm việc
- Giải thích cách AI phân tích và đề xuất

### Slide 10: Tổng kết
- Tổng hợp các chức năng chính
- Điểm nổi bật của hệ thống
- Hướng phát triển tiếp theo

---

**Tài liệu được tạo tự động từ phân tích codebase**
**Ngày tạo: 2026-01-10**
