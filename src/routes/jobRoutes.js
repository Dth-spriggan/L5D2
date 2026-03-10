const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// --- CÁC ROUTE PUBLIC (Ai cũng xem được) ---
// GET /api/jobs -> Lấy danh sách việc làm
router.get('/jobs', jobController.getJobs);

// --- CÁC ROUTE EMPLOYER (Sau này sẽ chặn quyền, giờ mở tạm để test) ---
// POST /api/jobs -> Đăng tin mới
router.post('/jobs', jobController.createJob);

// PUT /api/jobs/:id -> Sửa tin
router.put('/jobs/:id', jobController.updateJob);

// DELETE /api/jobs/:id -> Xóa mềm tin (Vào thùng rác)
router.delete('/jobs/:id', jobController.deleteJob);

// DELETE /api/jobs/:id/force -> Xóa cứng vĩnh viễn (Phải có chữ /force để phân biệt với xóa mềm)
router.delete('/jobs/:id/force', jobController.hardDeleteJob);

// POST /api/jobs/:id/restore -> Khôi phục tin từ thùng rác
router.post('/jobs/:id/restore', jobController.restoreJob);

// --- CÁC ROUTE ADMIN (Sau này chặn quyền Admin) ---
// PUT /api/admin/jobs/:id/approve -> Duyệt tin
router.put('/admin/jobs/:id/approve', jobController.approveJob);

// PUT /api/admin/jobs/:id/reject -> Từ chối tin
router.put('/admin/jobs/:id/reject', jobController.rejectJob);

module.exports = router;