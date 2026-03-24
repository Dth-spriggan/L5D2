const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Gọi dàn bảo vệ middleware
const { verifyToken, isEmployer } = require('../middlewares/authMiddleware');

// ----------------------------------------------------------------------
// NHÓM API GET (LẤY DỮ LIỆU)
// ----------------------------------------------------------------------
// 1. Dành cho tất cả mọi người (Không cần token)
router.get('/', jobController.getPublicJobs);

// 2. Dành cho Nhà tuyển dụng xem danh sách của họ
router.get('/my-jobs', verifyToken, isEmployer, jobController.getEmployerJobs);

// 3. Dành cho Admin xem tất cả (Tạm thời dùng verifyToken, nếu sếp có isAdmin thì thay thế nhé)
router.get('/admin/all', verifyToken, jobController.getAdminJobs);


// ----------------------------------------------------------------------
// NHÓM API THAO TÁC (TẠO, SỬA, XÓA)
// ----------------------------------------------------------------------
// 4. Công ty đăng việc mới
router.post('/', verifyToken, isEmployer, jobController.createJob);

// 5. Admin từ chối bài đăng
router.put('/:id/reject', verifyToken, jobController.rejectJob);

// 6. Admin xóa bài đăng
router.delete('/:id/force', verifyToken, jobController.hardDeleteJob);

module.exports = router;