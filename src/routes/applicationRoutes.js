const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const upload = require('../middlewares/uploadMiddleware'); 

// 1. IMPORT LỄ TÂN VÀO ĐÂY
const { verifyToken } = require('../middlewares/authMiddleware');

// 2. GẮN LỄ TÂN ĐỨNG TRƯỚC MIDDLEWARE UPLOAD
router.post('/', verifyToken, upload.single('cvFile'), applicationController.applyJob); 

router.delete('/:id', verifyToken, applicationController.withdrawApplication); 
router.get('/job/:jobId', verifyToken, applicationController.getApplicationsByJob); 
router.put('/:id/status', verifyToken, applicationController.updateStatus); 
router.post('/:id/undo', verifyToken, applicationController.undoStatus); 

module.exports = router;