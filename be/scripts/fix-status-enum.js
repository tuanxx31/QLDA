/**
 * Script để fix enum status trong group_members
 * Chạy script này trước khi start server để migrate dữ liệu
 * 
 * Usage: node scripts/fix-status-enum.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixStatusEnum() {
  let connection;
  
  try {
    // Kết nối database
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
      user: process.env.DATABASE_USERNAME || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'qlda',
    });

    console.log('✅ Đã kết nối database');

    // Kiểm tra xem có giá trị 'pending' nào không
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as count FROM group_members WHERE status = ?',
      ['pending']
    );
    
    const pendingCount = rows[0].count;
    console.log(`📊 Tìm thấy ${pendingCount} bản ghi có status = 'pending'`);

    if (pendingCount > 0) {
      // Bước 1: Thêm 'pending_invite' vào enum hiện tại (nếu chưa có)
      try {
        await connection.execute(`
          ALTER TABLE group_members 
          MODIFY COLUMN status ENUM('pending', 'pending_invite', 'accepted', 'rejected') 
          NOT NULL DEFAULT 'accepted'
        `);
        console.log('✅ Đã thêm "pending_invite" vào enum');
      } catch (error) {
        if (error.message.includes('Duplicate')) {
          console.log('ℹ️  Enum đã có "pending_invite"');
        } else {
          throw error;
        }
      }

      // Bước 2: Update tất cả 'pending' thành 'pending_invite'
      const [result] = await connection.execute(
        'UPDATE group_members SET status = ? WHERE status = ?',
        ['pending_invite', 'pending']
      );
      
      console.log(`✅ Đã update ${result.affectedRows} bản ghi từ 'pending' sang 'pending_invite'`);

      // Bước 3: Thay đổi enum thành giá trị cuối cùng (loại bỏ 'pending')
      await connection.execute(`
        ALTER TABLE group_members 
        MODIFY COLUMN status ENUM('pending_invite', 'pending_approval', 'accepted', 'rejected') 
        NOT NULL DEFAULT 'accepted'
      `);
      console.log('✅ Đã cập nhật enum thành công');
    } else {
      console.log('ℹ️  Không có dữ liệu cần migrate');
      
      // Vẫn cần update enum nếu chưa có
      try {
        await connection.execute(`
          ALTER TABLE group_members 
          MODIFY COLUMN status ENUM('pending_invite', 'pending_approval', 'accepted', 'rejected') 
          NOT NULL DEFAULT 'accepted'
        `);
        console.log('✅ Đã cập nhật enum thành công');
      } catch (error) {
        if (error.message.includes('Duplicate') || error.message.includes('already exists')) {
          console.log('ℹ️  Enum đã được cập nhật');
        } else {
          throw error;
        }
      }
    }

    // Kiểm tra lại
    const [checkRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM group_members WHERE status = ?',
      ['pending']
    );
    
    if (checkRows[0].count === 0) {
      console.log('✅ Migration thành công! Bây giờ có thể start server.');
    } else {
      console.log('⚠️  Vẫn còn dữ liệu với status = "pending"');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Đã đóng kết nối database');
    }
  }
}

fixStatusEnum();

