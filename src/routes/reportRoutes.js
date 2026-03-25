const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Sếp nhớ ném thêm middleware verify Token (JWT) vào mấy đường này cho bảo mật nhé
router.post('/', reportController.createReport);
router.get('/', reportController.getAllReports); 
router.put('/:id/status', reportController.updateReportStatus);

module.exports = router;