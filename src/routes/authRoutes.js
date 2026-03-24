const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng ký Ứng viên
router.post('/register-candidate', authController.registerCandidate);

// Đăng ký Nhà tuyển dụng
router.post('/register-employer', authController.registerEmployer);

// Đăng nhập chung (Tự check 2 bảng)
router.post('/login', authController.login);

module.exports = router;