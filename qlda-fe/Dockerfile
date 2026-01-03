# Sử dụng hình ảnh Node.js chính thức với phiên bản Alpine nhẹ
FROM node:22-bullseye

# Tạo thư mục ứng dụng
WORKDIR /tuan/qlda-fe

# Sao chép package.json và package-lock.json vào thư mục làm việc
# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Xóa node_modules và package-lock.json để npm install tải đúng binary cho Linux
RUN rm -rf node_modules package-lock.json

# Cài đặt các phụ thuộc của ứng dụng
RUN npm install

# Nhận VITE_API_BASE từ build args
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

# Xây dựng ứng dụng Vite
RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "dist"]