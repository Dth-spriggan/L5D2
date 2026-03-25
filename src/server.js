require('dotenv').config(); 
const express = require('express');
const cors = require('cors');

const app = express();

// ==========================================================
// 1. IMPORT DATABASE & MODELS (Hệ 2 bảng Auth riêng biệt)
// ==========================================================
const { connectDB, sequelize } = require('./db');

const User = require('./models/user');       // Ứng viên (Email, Pass, Profile nằm đây hết)
const Company = require('./models/company'); // Nhà tuyển dụng (Email, Pass, Co_Info nằm đây hết)
const Job = require('./models/job');
const Application = require('./models/application');
const SavedJob = require('./models/SavedJob');
const EscrowContract = require('./models/escrowContract');
const Transaction = require('./models/transaction');

const routes = require('./routes/index'); 

// 2. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);
// ==========================================================
// 3. THIẾT LẬP QUAN HỆ MỚI (Dây cáp nối thẳng vào Company & User)
// ==========================================================

// --- NHÁNH NHÀ TUYỂN DỤNG (COMPANY) ---
// Công ty đăng tin tuyển dụng (Job)
Company.hasMany(Job, { foreignKey: 'employerId' });
Job.belongsTo(Company, { as: 'employer', foreignKey: 'employerId' });

// Công ty làm chủ hợp đồng Escrow
Company.hasMany(EscrowContract, { foreignKey: 'employerId' });
EscrowContract.belongsTo(Company, { as: 'escrow_employer', foreignKey: 'employerId' });


// --- NHÁNH ỨNG VIÊN (USER) ---
// Ứng viên lưu công việc
User.hasMany(SavedJob, { foreignKey: 'user_id' });          // ← bỏ comment
SavedJob.belongsTo(User, { foreignKey: 'user_id' });  


// Ứng viên đóng vai Freelancer trong hợp đồng Escrow
User.hasMany(EscrowContract, { foreignKey: 'freelancerId' });
EscrowContract.belongsTo(User, { as: 'freelancer', foreignKey: 'freelancerId' });

// Ứng viên thực hiện giao dịch (Transaction)
User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });


// --- QUAN HỆ CHUNG ---
// Job & Application
Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

// // Job & SavedJob
Job.hasMany(SavedJob, { foreignKey: 'job_id' });            // ← bỏ comment
SavedJob.belongsTo(Job, { as: 'job', foreignKey: 'job_id' }); // ← bỏ comment

// Job & Escrow (1 Job có 1 Hợp đồng)
Job.hasOne(EscrowContract, { foreignKey: 'jobId' });
EscrowContract.belongsTo(Job, { foreignKey: 'jobId' });

// Escrow & Transaction
EscrowContract.hasMany(Transaction, { foreignKey: 'escrowContractId' });
Transaction.belongsTo(EscrowContract, { foreignKey: 'escrowContractId' });


// ==========================================================
// 4. KẾT NỐI & ĐỒNG BỘ DATABASE (Đại tu móng)
// ==========================================================
connectDB();

// Bước này cực quan trọng để xóa sạch mấy cái bảng cũ (CandidateProfile, roles...)
sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    .then(() => sequelize.sync({ alter: true })) // ⚠️ Chạy 1 lần duy nhất để reset, sau đó đổi ngay về alter: true
    .then(() => sequelize.query('SET FOREIGN_KEY_CHECKS = 1'))
    .then(() => {
        console.log('🚀 Đã đập đi xây lại hệ thống 2 bảng Auth thành công! (Sạch bóng rác cũ)');
    })
    .catch(err => {
        console.error('❌ Lỗi đồng bộ MySQL:', err.message);
    });

// ==========================================================
// 5. KHAI BÁO API ROUTES
// ==========================================================
app.get('/api/ping', (req, res) => {
    res.json({ success: true, message: "Hệ thống 2 bảng Auth đang nổ máy giòn tan!" });
});

app.use('/api', routes);

// ==========================================================
// 6. KHỞI ĐỘNG SERVER
// ==========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Server Backend đang quẩy tại http://localhost:${PORT}`);
});