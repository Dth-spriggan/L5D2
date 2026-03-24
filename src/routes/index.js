const express = require('express');
const router = express.Router();

// ==========================================
// 1. IMPORT TẤT CẢ CÁC TRẠM ĐIỀU PHỐI (ROUTES)
// ==========================================
const authRoutes = require('./authRoutes');         // 🌟 MỚI: Trạm Xác thực (Login/Register 2 luồng)
const profileRoutes = require('./profileRoutes');   // 🌟 MỚI: Trạm Hồ sơ (Candidate/Employer)
const jobRoutes = require('./jobRoutes');           // Trạm Quản lý tin tuyển dụng
const cvRoutes = require('./cvRoutes');             // Trạm Quản lý CV
const applicationRoutes = require('./applicationRoutes'); // Trạm Ứng tuyển
const escrowRoutes = require('./escrowRoutes');     // Trạm Thanh toán đảm bảo (Khét lẹt!)

// ==========================================
// 2. CẮM ĐIỆN PHÂN LUỒNG TỪNG MODULE
// ==========================================

// 🔐 Luồng Xác thực (Sẽ tự động nhận /api/auth/register/candidate...)
router.use('/auth', authRoutes);

// 👤 Luồng Hồ sơ (Sẽ tự động nhận /api/profile/candidate...)
router.use('/profile', profileRoutes);

// 💼 Luồng Việc làm
// (Lưu ý nhỏ: Sếp nên dùng '/jobs' thay vì '/' để URL nó chuẩn RESTful API nhé: /api/jobs)
router.use('/jobs', jobRoutes); 

// 📄 Luồng CV
router.use('/cvs', cvRoutes);

// 📩 Luồng Ứng tuyển
router.use('/applications', applicationRoutes);

// 💰 Luồng Thanh toán đảm bảo
router.use('/escrow', escrowRoutes);

module.exports = router;