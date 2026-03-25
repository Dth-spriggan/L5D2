const express = require('express');
const router = express.Router();
const savedJobController = require('../controllers/savedJobController');

// Lưu công việc
router.post('/', savedJobController.saveJob);

// Xem tất cả công việc đã lưu của user
router.get('/:user_id', savedJobController.getSavedJobs);

// Xoá công việc đã lưu
router.delete('/:user_id/:job_id', savedJobController.unsaveJob);

module.exports = router;