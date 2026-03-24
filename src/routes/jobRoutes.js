const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// ======================================================================
// 🌍 NHÓM 1: PUBLIC ROUTES (Dành cho tất cả mọi người, kể cả chưa đăng nhập)
// ======================================================================

// [Lấy danh sách & Tìm kiếm] - Ai cũng có thể vào xem danh sách việc làm
// - Method: GET
// - Link test: /api/jobs?page=1&limit=10&q=Node&status=ACTIVE
router.get('/jobs', jobController.getJobs);


// ======================================================================
// 🏢 NHÓM 2: EMPLOYER ROUTES (Dành cho Nhà Tuyển Dụng quản lý tin của mình)
// *Lưu ý: Tương lai sẽ gắn thêm Middleware chặn quyền (checkRole) vào đây
// ======================================================================

// [Đăng tin mới] - Tạo một tin tuyển dụng ở trạng thái chờ duyệt (PENDING_REVIEW)
// - Method: POST
// - Link test: /api/jobs
router.post('/jobs', jobController.createJob);

// [Cập nhật tin] - Sửa tiêu đề, mô tả, mức lương... của tin đã đăng
// - Method: PUT
// - Link test: /api/jobs/1
router.put('/jobs/:id', jobController.updateJob);

// [Xóa mềm] - Đưa tin vào thùng rác (Cập nhật cột deleted_at), không hiển thị nữa
// - Method: DELETE
// - Link test: /api/jobs/1
router.delete('/jobs/:id', jobController.deleteJob);

// [Khôi phục tin] - Móc tin từ thùng rác ra (Đổi deleted_at thành null)
// - Method: POST
// - Link test: /api/jobs/1/restore
router.post('/jobs/:id/restore', jobController.restoreJob);

// [Xóa cứng] - Tiễn vong vĩnh viễn khỏi Database (Rất nguy hiểm, cẩn thận khi dùng)
// - Method: DELETE 
// - Link test: /api/jobs/1/force
router.delete('/jobs/:id/force', jobController.hardDeleteJob);


// ======================================================================
// 👑 NHÓM 3: ADMIN ROUTES (Dành cho Quản trị viên hệ thống TopCV)
// *Lưu ý: Tương lai sẽ gắn thêm Middleware checkRole('Admin') vào đây
// ======================================================================

// [Duyệt tin] - Cấp phép cho tin được hiển thị (Đổi status thành ACTIVE)
// - Method: PUT
// - Link test: /api/admin/jobs/1/approve
router.put('/admin/jobs/:id/approve', jobController.approveJob);

// [Từ chối tin] - Đánh dấu tin vi phạm hoặc không đạt yêu cầu (Đổi status thành REJECTED)
// - Method: PUT
// - Link test: /api/admin/jobs/1/reject
router.put('/admin/jobs/:id/reject', jobController.rejectJob);


// 1. API LẤY DANH SÁCH JOB (Dành cho Trang chủ & Trang Xem tất cả)
// Frontend sẽ gọi: GET http://localhost:3000/api/jobs
// Hoặc thêm phân trang: GET http://localhost:3000/api/jobs?limit=6&page=1
router.get('/', jobController.getAllJobs);

module.exports = router;