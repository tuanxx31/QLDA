# Hướng dẫn cấu hình Authentication

## Cấu hình API URL

Tạo file `.env` trong thư mục `client` với nội dung:

```
VITE_REACT_APP_API_URL=http://localhost:3000
```

## Chức năng đã triển khai

### 1. Đăng nhập (Login)
- Sử dụng email và password
- Gọi API `POST /auth/login`
- Lưu JWT token vào localStorage
- Tự động redirect về trang chủ sau khi đăng nhập thành công

### 2. Đăng ký (Register)
- Sử dụng name, email, password (avatar là optional)
- Gọi API `POST /auth/register`
- Sau khi đăng ký thành công, tự động đăng nhập
- Lưu JWT token và thông tin user vào localStorage

### 3. Đăng xuất (Logout)
- Xóa token và user info khỏi localStorage
- Redirect về trang login

### 4. Kiểm tra trạng thái đăng nhập
- Kiểm tra token trong localStorage
- Tự động redirect về login nếu chưa đăng nhập

### 5. Xử lý lỗi
- Hiển thị thông báo lỗi từ API
- Tự động đăng xuất khi token hết hạn (401 error)

## API Endpoints được sử dụng

- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `GET /users/profile` - Lấy thông tin user (cần token)

## Cấu trúc dữ liệu

### LoginRequest
```typescript
{
  email: string;
  password: string;
}
```

### RegisterRequest
```typescript
{
  name: string;
  email: string;
  password: string;
  avatar?: string;
}
```

### AuthResponse
```typescript
{
  access_token: string;
}
```

### User
```typescript
{
  id: number;
  name: string;
  email: string;
  avatar?: string;
}
```

## Toast Notifications

Hệ thống đã được tích hợp toast notifications để thông báo trạng thái cho người dùng:

### Thông báo thành công (màu xanh)
- ✅ "Đăng nhập thành công!" - Khi đăng nhập thành công
- ✅ "Đăng ký tài khoản thành công!" - Khi đăng ký thành công
- ✅ "Tự động đăng nhập thành công!" - Khi tự động đăng nhập sau đăng ký
- ✅ "Đăng xuất thành công!" - Khi đăng xuất thành công

### Thông báo lỗi (màu đỏ)
- ❌ "Đăng nhập thất bại" - Khi thông tin đăng nhập không đúng
- ❌ "Đăng ký thất bại" - Khi đăng ký không thành công
- ❌ "Email đã tồn tại" - Khi email đã được sử dụng
- ❌ "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!" - Khi token hết hạn
- ❌ "Kết nối timeout. Vui lòng thử lại!" - Khi request timeout
- ❌ "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!" - Khi mất kết nối
- ❌ "Lỗi server. Vui lòng thử lại sau!" - Khi server lỗi (5xx)

### Thông báo cảnh báo (màu vàng)
- ⚠️ "Vui lòng nhập email và mật khẩu" - Khi thiếu thông tin đăng nhập

### Thông báo thông tin (màu xanh dương)
- ℹ️ "Chức năng đổi mật khẩu chưa được triển khai" - Cho các chức năng chưa hoàn thiện
- ℹ️ "Chức năng quên mật khẩu chưa được triển khai" - Cho các chức năng chưa hoàn thiện

## Lưu ý

1. Đảm bảo backend đang chạy trên port 3000
2. Backend phải có CORS được cấu hình để cho phép frontend gọi API
3. JWT token được lưu trong localStorage với key "token"
4. Thông tin user được lưu trong localStorage với key "user"
5. Toast notifications sử dụng Ant Design message component
6. Tất cả thông báo đều được hiển thị bằng tiếng Việt
7. Toast sẽ tự động biến mất sau vài giây
