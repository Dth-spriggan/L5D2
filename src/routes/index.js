const express = require('express');
const router = express.Router();

const jobRoutes = require('./jobRoutes'); // Gọi file route của job

// Gắn route
router.use('/jobs', jobRoutes); 
// Nghĩa là API của huynh sẽ có dạng: http://localhost:3000/api/jobs

module.exports = router;