-- Script để fix lỗi enum status trong group_members
-- Chạy script này TRƯỚC KHI start server để migrate dữ liệu

-- Bước 1: Update tất cả giá trị 'pending' thành 'pending_invite'
UPDATE group_members 
SET status = 'pending_invite' 
WHERE status = 'pending';

-- Bước 2: Kiểm tra xem còn giá trị 'pending' nào không
SELECT COUNT(*) as remaining_pending 
FROM group_members 
WHERE status = 'pending';

-- Nếu remaining_pending = 0, có thể tiếp tục
-- TypeORM sẽ tự động update enum khi synchronize: true

