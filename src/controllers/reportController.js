const Report = require('../models/Report');

const reportController = {
    // 1. [Ứng viên] Nộp báo cáo tin tuyển dụng rác
    createReport: async (req, res) => {
        try {
            const { reporter_id, job_id, reason } = req.body;
            
            const newReport = await Report.create({
                reporter_id,
                job_id,
                reason,
                status: 'pending'
            });

            res.status(201).json({ message: 'Báo cáo thành công, Admin sẽ kiểm duyệt!', data: newReport });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi server khi tạo báo cáo!' });
        }
    },

    // 2. [Admin] Lấy danh sách tất cả báo cáo
    getAllReports: async (req, res) => {
        try {
            const reports = await Report.findAll({
                order: [['created_at', 'DESC']]
            });
            res.status(200).json(reports);
        } catch (error) {
            console.error(error); // ← đã sửa res.error → console.error
            res.status(500).json({ message: 'Lỗi khi tải danh sách báo cáo!' });
        }
    },

    // 3. [Admin] Cập nhật trạng thái báo cáo
    updateReportStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const report = await Report.findByPk(id);
            if (!report) {
                return res.status(404).json({ message: 'Không tìm thấy báo cáo này!' });
            }

            report.status = status;
            await report.save();

            res.status(200).json({ message: 'Đã cập nhật trạng thái báo cáo!', data: report });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái!' });
        }
    },

    // 4. [Admin] Xóa báo cáo
    deleteReport: async (req, res) => {
        try {
            const { id } = req.params;
            const report = await Report.findByPk(id);

            if (!report) {
                return res.status(404).json({ message: 'Không tìm thấy báo cáo để xóa!' });
            }

            await report.destroy();
            res.status(200).json({ message: 'Đã xóa báo cáo thành công!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi server khi xóa báo cáo!' });
        }
    }

};

module.exports = reportController;