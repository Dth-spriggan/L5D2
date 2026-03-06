const Application = require('../models/application');
const Job = require('../models/job');

exports.applyForJob = async (req, res) => {
    try {
        const { jobId, cvUrl, coverLetter } = req.body;
        
        const job = await Job.findByPk(jobId);
        if (!job || job.status !== 'OPEN') return res.status(404).json({ message: "Job không hợp lệ!" });

        const application = await Application.create({ jobId, candidateId: req.user.id, cvUrl, coverLetter });
        res.status(201).json({ message: "Nộp CV thành công!", application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};