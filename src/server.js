require('dotenv').config(); // Bắt buộc phải nằm trên cùng để đọc file .env
const express = require('express');
const cors = require('cors');

const app = express();

// ==========================================================
// 1. IMPORT DATABASE & MODELS
// ==========================================================
const { connectDB, sequelize } = require('./db');

const User = require('./models/user');
// 🌟 MỚI: Import 2 model Hồ sơ riêng anh em mình vừa tạo
const CandidateProfile = require('./models/candidateProfile');
const Company = require('./models/company');

const Job = require('./models/job');
const Application = require('./models/application');
const EscrowContract = require('./models/escrowContract');
const Transaction = require('./models/transaction');

// Tùy sếp dùng routes/index.js hay tách lẻ. Nếu có file index.js gom route thì giữ nguyên dòng này:
const routes = require('./routes/index'); 

// 2. Middlewares (Xử lý dữ liệu đầu vào)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================================
// 3. THIẾT LẬP QUAN HỆ CÁC BẢNG (ASSOCIATIONS)
// ==========================================================

// 🌟 [QUAN HỆ MỚI] Danh tính (User) & Hồ sơ Ứng viên (CandidateProfile)
User.hasOne(CandidateProfile, { foreignKey: 'user_id' });
CandidateProfile.belongsTo(User, { foreignKey: 'user_id' });

// 🌟 [QUAN HỆ MỚI] Danh tính (User) & Hồ sơ Công ty (Company)
User.hasOne(Company, { foreignKey: 'employer_id' });
Company.belongsTo(User, { as: 'company_profile', foreignKey: 'employer_id' });

// --- QUAN HỆ CŨ SẾP ĐÃ VIẾT (GIỮ NGUYÊN) ---
// - Nhà tuyển dụng (User) & Công việc (Job)
User.hasMany(Job, { foreignKey: 'employerId' });
Job.belongsTo(User, { as: 'employer', foreignKey: 'employerId' });

// - Ứng viên (User) & Đơn ứng tuyển (Application)
User.hasMany(Application, { foreignKey: 'candidateId' });
Application.belongsTo(User, { as: 'candidate', foreignKey: 'candidateId' });

// - Công việc (Job) & Đơn ứng tuyển (Application)
Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

// --- QUAN HỆ CHO MODULE ESCROW ---
// - Nhà tuyển dụng & Hợp đồng Escrow
User.hasMany(EscrowContract, { foreignKey: 'employerId' });
EscrowContract.belongsTo(User, { as: 'escrow_employer', foreignKey: 'employerId' });

// - Freelancer & Hợp đồng Escrow
User.hasMany(EscrowContract, { foreignKey: 'freelancerId' });
EscrowContract.belongsTo(User, { as: 'freelancer', foreignKey: 'freelancerId' });

// - Công việc & Hợp đồng Escrow (1 Job có 1 Hợp đồng)
Job.hasOne(EscrowContract, { foreignKey: 'jobId' });
EscrowContract.belongsTo(Job, { foreignKey: 'jobId' });

// - Hợp đồng Escrow & Lịch sử giao dịch (Transaction)
EscrowContract.hasMany(Transaction, { foreignKey: 'escrowContractId' });
Transaction.belongsTo(EscrowContract, { foreignKey: 'escrowContractId' });

// - Người dùng & Lịch sử giao dịch
User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

// ==========================================================
// 4. KẾT NỐI & ĐỒNG BỘ DATABASE
// ==========================================================
connectDB();

// Tạm tắt kiểm tra khóa ngoại -> Xóa sạch bảng cũ xây lại -> Bật lại kiểm tra
sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    .then(() => sequelize.sync({ alter: true })) // alter: true giúp cập nhật bảng mà không xóa mất data cũ
    .then(() => sequelize.query('SET FOREIGN_KEY_CHECKS = 1'))
    .then(() => {
        console.log('🚀 Đã đồng bộ cấu trúc bảng MySQL thành công! (Bao gồm Profile, Escrow & Transaction)');
    })
    .catch(err => {
        console.error('❌ Lỗi đồng bộ MySQL:', err.message);
    });

// ==========================================================
// 5. KHAI BÁO API ROUTES
// ==========================================================
app.get('/api/ping', (req, res) => {
    res.json({ success: true, message: "Hệ thống đang chạy mượt mà!" });
});

// Cắm điện cho toàn bộ route thông qua routes/index.js
app.use('/api', routes);

// ==========================================================
// 6. KHỞI ĐỘNG SERVER
// ==========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Server Backend TopCV Clone đang quẩy tại http://localhost:${PORT}`);
});