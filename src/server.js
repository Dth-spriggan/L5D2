require('dotenv').config(); // Bắt buộc phải nằm trên cùng để đọc file .env
const express = require('express');
const cors = require('cors');

// 1. Import Database & Models
const { connectDB, sequelize } = require('./db');
const User = require('./models/user');
const Job = require('./models/job');
const Application = require('./models/application');
const routes = require('./routes/index');

const app = express();

// 2. Middlewares (Xử lý dữ liệu đầu vào)
app.use(cors());
app.use(express.json());

// 3. Thiết lập Quan hệ giữa các bảng (Associations)
// - Nhà tuyển dụng (User) & Công việc (Job)
User.hasMany(Job, { foreignKey: 'employerId' });
Job.belongsTo(User, { as: 'employer', foreignKey: 'employerId' });

// - Ứng viên (User) & Đơn ứng tuyển (Application)
User.hasMany(Application, { foreignKey: 'candidateId' });
Application.belongsTo(User, { as: 'candidate', foreignKey: 'candidateId' });

// - Công việc (Job) & Đơn ứng tuyển (Application)
Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

// 4. Kết nối Database
connectDB();

/* ==========================================================
   ⚠️ KHU VỰC XỬ LÝ DATABASE
   ========================================================== */
// Tạm tắt kiểm tra khóa ngoại -> Xóa sạch bảng cũ xây lại -> Bật lại kiểm tra
sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    .then(() => sequelize.sync({ alter: true })) // <--- LƯU Ý DÒNG NÀY
    .then(() => sequelize.query('SET FOREIGN_KEY_CHECKS = 1'))
    .then(() => {
        console.log('🚀 Đã đồng bộ cấu trúc bảng MySQL thành công!');
    })
    .catch(err => {
        console.error('❌ Lỗi đồng bộ:', err.message);
    });
/* ========================================================== */

// 5. Khai báo API Routes
app.use('/api', routes);

// 6. Khởi động Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Server đang chạy tại cổng ${PORT}`);
});