const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// --- CÁC ROUTE PUBLIC (Ai cũng xem được) ---
// GET /api/jobs -> Lấy danh sách việc làm
// 🌟 MỚI SỬA: Đổi getJobs thành getAllJobs cho khớp với Controller
router.get('/jobs', jobController.getAllJobs);

// --- CÁC ROUTE EMPLOYER (Sau này sẽ chặn quyền, giờ mở tạm để test) ---
// POST /api/jobs -> Đăng tin mới
router.post('/jobs', jobController.createJob);

// =====================================================================
// ⚠️ LƯU Ý CHO ĐẠI SƯ HUYNH: 
// Mấy API dưới này đệ tạm rào lại để server chạy được. 
// Bao giờ đại ca code xong mấy hàm updateJob, deleteJob... bên file 
// jobController.js thì hãy bỏ cặp dấu /* và */ đi để mở khóa nhé!
// =====================================================================

/*
// PUT /api/jobs/:id -> Sửa tin
router.put('/jobs/:id', jobController.updateJob);

// DELETE /api/jobs/:id -> Xóa mềm tin (Vào thùng rác)
router.delete('/jobs/:id', jobController.deleteJob);

// DELETE /api/jobs/:id/force -> Xóa cứng vĩnh viễn
router.delete('/jobs/:id/force', jobController.hardDeleteJob);

// POST /api/jobs/:id/restore -> Khôi phục tin từ thùng rác
router.post('/jobs/:id/restore', jobController.restoreJob);

// --- CÁC ROUTE ADMIN ---
// PUT /api/admin/jobs/:id/approve -> Duyệt tin
router.put('/admin/jobs/:id/approve', jobController.approveJob);

// PUT /api/admin/jobs/:id/reject -> Từ chối tin
router.put('/admin/jobs/:id/reject', jobController.rejectJob);
*/

module.exports = router;