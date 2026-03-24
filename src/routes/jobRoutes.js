const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// --- CÁC ROUTE PUBLIC (Ai cũng xem được) ---
// GET /api/jobs -> Lấy danh sách việc làm
// 🌟 MỚI SỬA: Đổi getJobs thành getAllJobs cho khớp với Controller
router.get('/jobs', jobController.getAllJobs);


// ======================================================================
// 🏢 NHÓM 2: EMPLOYER ROUTES (Dành cho Nhà Tuyển Dụng quản lý tin của mình)
// *Lưu ý: Tương lai sẽ gắn thêm Middleware chặn quyền (checkRole) vào đây
// ======================================================================

// [Đăng tin mới] - Tạo một tin tuyển dụng ở trạng thái chờ duyệt (PENDING_REVIEW)
// - Method: POST
// - Link test: /api/jobs
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

// [Xóa mềm] - Đưa tin vào thùng rác (Cập nhật cột deleted_at), không hiển thị nữa
// - Method: DELETE
// - Link test: /api/jobs/1
router.delete('/jobs/:id', jobController.deleteJob);

// DELETE /api/jobs/:id/force -> Xóa cứng vĩnh viễn
router.delete('/jobs/:id/force', jobController.hardDeleteJob);


// --- CÁC ROUTE ADMIN ---
// PUT /api/admin/jobs/:id/approve -> Duyệt tin
router.put('/admin/jobs/:id/approve', jobController.approveJob);

// [Từ chối tin] - Đánh dấu tin vi phạm hoặc không đạt yêu cầu (Đổi status thành REJECTED)
// - Method: PUT
// - Link test: /api/admin/jobs/1/reject
router.put('/admin/jobs/:id/reject', jobController.rejectJob);
*/


// 1. API LẤY DANH SÁCH JOB (Dành cho Trang chủ & Trang Xem tất cả)
// Frontend sẽ gọi: GET http://localhost:3000/api/jobs
// Hoặc thêm phân trang: GET http://localhost:3000/api/jobs?limit=6&page=1
router.get('/', jobController.getAllJobs);

module.exports = router;