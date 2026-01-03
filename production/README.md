# Hướng dẫn Deploy QLDA với Docker Compose

## Yêu cầu

- Docker Engine 20.10+
- Docker Compose 2.0+

## Cấu trúc

```
production/
├── docker-compose.yaml    # File docker-compose chính
├── .env.example           # Template cho biến môi trường
└── README.md              # File này
```

## Các bước deploy

### 1. Tạo file .env

Sao chép file `.env.example` thành `.env` và cập nhật các giá trị:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với các giá trị phù hợp:

```env
# MySQL Database Configuration
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=qlda
MYSQL_USER=qlda_user
MYSQL_PASSWORD=your_secure_password
MYSQL_PORT=3306

# Backend Configuration
BE_PORT=3000
JWT_SECRET=your-secret-jwt-key-change-this-in-production

# Frontend Configuration
FE_PORT=80
```

### 2. Tạo volume external cho file uploads

```bash
# Tạo volume external để lưu trữ file uploads
docker volume create qlda-uploads
```

### 3. Build và khởi động services

```bash
# Build và start tất cả services
docker compose up -d --build

# Xem logs
docker compose logs -f

# Xem logs của service cụ thể
docker compose logs -f be
docker compose logs -f qlda-fe
docker compose logs -f db
```

### 4. Chạy migrations (nếu cần)

```bash
# Vào container backend
docker compose exec be sh

# Chạy migrations
npm run migration:run
```

### 5. Truy cập ứng dụng

- **Frontend**: http://localhost (hoặc port bạn đã cấu hình trong FE_PORT)
- **Backend API**: http://localhost:3000/api (hoặc port bạn đã cấu hình trong BE_PORT)
- **Swagger API Docs**: http://localhost:3000/api

## Các lệnh hữu ích

### Dừng services
```bash
docker compose down
```

### Dừng và xóa volumes (⚠️ Xóa dữ liệu)
```bash
docker compose down -v
```

### Restart một service
```bash
docker compose restart be
docker compose restart qlda-fe
```

### Xem trạng thái services
```bash
docker compose ps
```

### Rebuild một service cụ thể
```bash
docker compose build be
docker compose up -d be
```

## Cấu trúc Services

### 1. **db** - MySQL Database
- Image: `mysql:8.0`
- Port: 3306 (mặc định)
- Volume: `mysql_data` (lưu trữ dữ liệu)

### 2. **qlda-be** - NestJS Backend
- Image: `registry.gitlab.com/tuanxx31/qlda/qlda-be:latest`
- Port: 3100 (exposed)
- Volume: `qlda-uploads:/qlda/be/uploads` (external volume cho file uploads)
- Environment variables:
  - `DATABASE_HOST=db`
  - `DATABASE_PORT=3306`
  - `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`
  - `JWT_SECRET`

### 3. **qlda-fe** - React Frontend
- Build từ: `../qlda-fe/Dockerfile`
- Port: 80 (mặc định)
- Sử dụng Nginx để serve static files
- Nginx proxy `/api` và `/uploads` đến backend

## Network

Tất cả services chạy trong network `shared-network` (external), cho phép:
- Frontend truy cập backend qua service name `qlda-be:3100`
- Backend truy cập database qua service name `db-mysql:3306`

**Tạo network external (nếu chưa có):**

```bash
docker network create shared-network
```

## Volumes

### Volume External cho File Uploads

Hệ thống sử dụng volume external `qlda-uploads` để lưu trữ các file upload (avatar, comment attachments). 

**Tạo volume external trước khi chạy docker-compose:**

```bash
# Tạo volume external
docker volume create qlda-uploads

# Kiểm tra volume đã được tạo
docker volume ls | grep qlda-uploads

# Xem thông tin chi tiết volume
docker volume inspect qlda-uploads
```

**Mount point:** Volume được mount vào `/qlda/be/uploads` trong container backend.

**Lưu ý:**
- Volume external tồn tại độc lập với docker-compose, dữ liệu sẽ không bị xóa khi chạy `docker compose down`
- Để xóa volume (⚠️ sẽ mất tất cả file uploads): `docker volume rm qlda-uploads`
- Để backup volume: Copy dữ liệu từ mount point của volume (thường ở `/var/lib/docker/volumes/qlda-uploads/_data` trên Linux)

### Các volumes khác

- `mysql_data`: Lưu trữ dữ liệu MySQL (nếu có)

## Troubleshooting

### Backend không kết nối được database
- Kiểm tra database đã sẵn sàng: `docker compose ps`
- Kiểm tra logs: `docker compose logs db`
- Đảm bảo các biến môi trường database đúng

### Frontend không gọi được API
- Kiểm tra nginx config: `docker compose exec qlda-fe cat /etc/nginx/conf.d/default.conf`
- Kiểm tra backend đã chạy: `docker compose ps be`
- Kiểm tra network: `docker network inspect production_qlda-network`

### Port đã được sử dụng
- Thay đổi port trong file `.env`
- Hoặc dừng service đang sử dụng port đó

## Production Checklist

- [ ] Đổi tất cả mật khẩu mặc định
- [ ] Đặt JWT_SECRET mạnh và bảo mật
- [ ] Cấu hình SSL/TLS (sử dụng reverse proxy như Traefik hoặc Nginx)
- [ ] Backup database thường xuyên
- [ ] Monitor logs và health checks
- [ ] Cấu hình firewall
- [ ] Sử dụng secrets management (Docker Secrets hoặc external tool)

