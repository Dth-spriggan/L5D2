const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');

// 💡 DÒNG MỚI: Gọi thằng bảo vệ ra
const upload = require('../middlewares/uploadMiddleware');

// ======================================================================
// 📁 NHÓM QUẢN LÝ CV (Dành cho Ứng viên - Candidate)
// *Lưu ý: Tương lai sẽ gắn Middleware checkRole('Candidate') vào đây
// ======================================================================

// [Tải CV lên] - Thêm mới một bản CV vào hồ sơ
// - Method: POST
// - Link: /api/cvs
router.post('/', upload.single('cv_file'), cvController.uploadCV);

// [Danh sách CV] - Lấy tất cả CV mà ứng viên này đã up
// - Method: GET
// - Link: /api/cvs/me
router.get('/me', cvController.getMyCVs);

// [Sửa CV] - Đổi tên hiển thị hoặc cập nhật link file mới
// - Method: PUT
// - Link: /api/cvs/:id
router.put('/:id', cvController.updateCV);

// [Bật/Tắt tìm việc] - Cho phép Nhà tuyển dụng tìm thấy CV này hay không
// - Method: PUT
// - Link: /api/cvs/:id/toggle-search
router.put('/:id/toggle-search', cvController.toggleSearchable);

// [Xóa mềm CV] - Ẩn CV đi, không dùng nữa (Sequelize tự lo vụ ẩn)
// - Method: DELETE
// - Link: /api/cvs/:id
router.delete('/:id', cvController.deleteCV);

// [Khôi phục CV đã xóa] - Dành cho trường hợp lỡ tay xóa nhầm, muốn khôi phục lại CV
router.post('/:id/restore', cvController.restoreCV);

// --- DÀNH CHO ADMIN ---
router.get('/admin/all', cvController.getAllCVsForAdmin);
router.delete('/admin/:id/force', cvController.hardDeleteCV); // Xóa cứng

module.exports = router;