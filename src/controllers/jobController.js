const Job = require('../models/job');
const User = require('../models/user');

exports.createJob = async (req, res) => {
    try {
        const newJob = await Job.create({ ...req.body, employerId: req.user.id });
        res.status(201).json({ message: "Đăng tin thành công!", job: newJob });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({
            where: { status: 'OPEN' },
            include: [{ model: User, as: 'employer', attributes: ['fullName', 'email'] }]
        });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};