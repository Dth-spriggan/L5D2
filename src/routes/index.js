const express = require('express');
const router = express.Router();

// 1. Import Controllers hiện tại của huynh
const authController = require('../controllers/authController');
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');

// 2. Import Router riêng của module Escrow mà huynh vừa tạo
const escrowRoutes = require('./escrowRoutes');

// ==========================================
// Các Route cũ giữ nguyên như ban đầu
// ==========================================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

router.get('/jobs', jobController.getAllJobs);

// ==========================================
// Gắn module Escrow vào
// ==========================================
// Toàn bộ các API bên trong escrowRoutes.js sẽ tự động được thêm tiền tố '/escrow'
router.use('/escrow', escrowRoutes);

module.exports = router;