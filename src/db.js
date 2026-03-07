// Gọi thư viện dotenv ra để đọc file .env
require('dotenv').config();
const mysql = require('mysql2');

// Tạo kết nối bằng các thông tin đã lưu trong .env
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // ĐÂY LÀ CHÌA KHÓA QUAN TRỌNG CHO AIVEN: Bật mã hóa SSL
  ssl: {
    rejectUnauthorized: false // Tạm thời để false để test kết nối nhanh trên máy local
  }
});

// Chạy thử kết nối xem có thông không
connection.connect((err) => {
  if (err) {
    console.error('Báo cáo đại sư huynh, kết nối thất bại! Lỗi đây ạ:', err.message);
    return;
  }
  console.log('Tuyệt vời đại sư huynh! Đã kết nối Database Aiven thành công rực rỡ!');
});

// Xuất file này ra để các file code khác (như index.js) có thể dùng chung
module.exports = connection;
