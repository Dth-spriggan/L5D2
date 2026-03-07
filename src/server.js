const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Mời file kết nối Database mà đại sư huynh đã tạo vào đây
const db = require('./db');

const app = express();

// Middlewares cơ bản
app.use(cors());
app.use(express.json()); // Để đọc được JSON từ body (người dùng gửi lên)

// Test API đầu tiên
app.get('/api/ping', (req, res) => {
    res.json({ success: true, message: "Hệ thống đang chạy mượt mà!" });
});

// Lắng nghe cổng
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server Backend TopCV Clone đang chạy tại http://localhost:${PORT}`);
});