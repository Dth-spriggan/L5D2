const express = require('express');
const router = express.Router();
const escrowController = require('../controllers/escrowController');

// Tạm thời comment middleware xác thực để dễ test bằng Postman
// const { verifyToken, isEmployer } = require('../middlewares/authMiddleware'); 

// 1. Khởi tạo hợp đồng
router.post('/contracts', escrowController.createContract); // Có thể thêm: verifyToken, isEmployer

// 2. Nạp tiền cọc (Sinh URL VNPay)
router.post('/deposit', escrowController.deposit); // Có thể thêm: verifyToken, isEmployer

// 3. Webhook (IPN) do cổng thanh toán tự động gọi (KHÔNG DÙNG MIDDLEWARE AUTH Ở ĐÂY)
router.post('/webhook', escrowController.webhookIPN);

// 4. Nghiệm thu & Giải ngân
router.post('/:id/release', escrowController.releaseFund); // Có thể thêm: verifyToken

// 5. Hủy hợp đồng
router.delete('/contracts/:id', escrowController.cancelContract); // Có thể thêm: verifyToken

module.exports = router;