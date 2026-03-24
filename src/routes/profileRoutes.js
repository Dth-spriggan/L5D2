const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken, isCandidate, isEmployer } = require('../middlewares/authMiddleware');
const { uploadLogo } = require('../middlewares/uploadMiddleware');

// Cổng Ứng viên 
router.get('/candidate', verifyToken, isCandidate, profileController.getCandidateProfile);
router.put('/candidate', verifyToken, isCandidate, profileController.updateCandidateProfile);

// Cổng Nhà Tuyển Dụng (Kẹp thêm trạm bơm ảnh logo_file)
router.get('/employer', verifyToken, isEmployer, profileController.getEmployerProfile);
router.put('/employer', verifyToken, isEmployer, uploadLogo.single('logo_file'), profileController.updateEmployerProfile);

module.exports = router;