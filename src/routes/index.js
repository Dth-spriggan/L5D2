const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');

// Tạm thời comment middleware để huynh test luồng cơ bản trước (hoặc import nếu huynh đã viết)
// const { verifyToken, isEmployer } = require('../middlewares/authMiddleware'); 

// 1. Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// 2. Jobs
router.get('/jobs', jobController.getAllJobs);
// router.post('/jobs', verifyToken, isEmployer, jobController.createJob);

// 3. Applications
// router.post('/applications', verifyToken, applicationController.applyForJob);

module.exports = router;