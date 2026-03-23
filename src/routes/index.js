const express = require('express');
const router = express.Router();

// 1. Import Controllers hiện tại của huynh
const authController = require('../controllers/authController');
const applicationController = require('../controllers/applicationController');

// 2. Import Router riêng của module Escrow mà huynh vừa tạo
const escrowRoutes = require('./escrowRoutes');

// Import cái Route Jobs xịn xò anh em mình vừa viết
const jobRoutes = require('./jobRoutes');

const cvRoutes = require('./cvRoutes');

// 1. BÊ THÊM DÒNG NÀY VÀO TRÊN CÙNG (phần require):
const applicationRoutes = require('./applicationRoutes');

// ==========================================
// Các Route cũ giữ nguyên như ban đầu
// ==========================================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);


// ✅ Dùng dòng này để cắm toàn bộ 8 cái API Thêm/Sửa/Xóa Jobs vào hệ thống:
router.use('/', jobRoutes);

router.use('/cvs', cvRoutes);

// 2. CẮM ĐIỆN CHO API (Thêm vào phần router.use):
router.use('/applications', applicationRoutes);

// ==========================================
// Gắn module Escrow vào
// ==========================================
// Toàn bộ các API bên trong escrowRoutes.js sẽ tự động được thêm tiền tố '/escrow'
router.use('/escrow', escrowRoutes);

module.exports = router;