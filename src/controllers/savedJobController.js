const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

const savedJobController = {

    // 1. [Ứng viên] Lưu công việc
    saveJob: async (req, res) => {
        try {
            const { user_id, job_id } = req.body;

            // Kiểm tra đã lưu chưa
            const existing = await SavedJob.findOne({
                where: { user_id, job_id }
            });

            if (existing) {
                return res.status(400).json({ message: 'Công việc này đã được lưu trước đó!' });
            }

            const saved = await SavedJob.create({ user_id, job_id });
            res.status(201).json({ message: 'Đã lưu công việc thành công!', data: saved });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi server khi lưu công việc!' });
        }
    },

    // 2. [Ứng viên] Xem tất cả công việc đã lưu
    getSavedJobs: async (req, res) => {
        try {
            const { user_id } = req.params;

            const savedJobs = await SavedJob.findAll({
                where: { user_id },
                include: [
                    {
                        model: Job,
                        as: 'job',
                        attributes: [
                            'id', 'title', 'description', 'salary_min',
                            'salary_max', 'level', 'job_type', 'location',
                            'status', 'created_at'
                        ]
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            res.status(200).json({ message: 'Danh sách công việc đã lưu', data: savedJobs });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách!' });
        }
    },

    // 3. [Ứng viên] Xoá công việc đã lưu
    unsaveJob: async (req, res) => {
        try {
            const { user_id, job_id } = req.params;

            const saved = await SavedJob.findOne({
                where: { user_id, job_id }
            });

            if (!saved) {
                return res.status(404).json({ message: 'Không tìm thấy công việc đã lưu này!' });
            }

            await saved.destroy();
            res.status(200).json({ message: 'Đã xoá công việc khỏi danh sách đã lưu!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi server khi xoá công việc!' });
        }
    }

};

module.exports = savedJobController;