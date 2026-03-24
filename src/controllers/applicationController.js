const Application = require('../models/application');
const ApplicationLog = require('../models/applicationLog');
const Job = require('../models/job');
const User = require('../models/user');
const CV = require('../models/cv');
// Đừng quên import bảng CV ở trên cùng nhé: const CV = require('../models/cv');

exports.applyJob = async (req, res) => {
  try {
    const { jobId, cvId, coverLetter } = req.body;
    const candidateId = req.user.id; 
    let finalCvUrl = ''; // Biến này để chốt xem cuối cùng dùng link CV nào

    // 1. Check xem ứng viên đã nộp job này bao giờ chưa
    const existingApplication = await Application.findOne({
      where: { jobId, candidateId }
    });

    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'Bạn đã nộp CV cho công việc này rồi!' });
    }

    // ==========================================
    // 2. KHỐI LOGIC CHỌN LỌC CV (2 TRƯỜNG HỢP)
    // ==========================================
    
    if (req.file) {
      // TRƯỜNG HỢP A: ỨNG VIÊN TẢI FILE MỚI TRỰC TIẾP
      // Middleware multer upload lên Cloudinary sẽ trả về link ở req.file.path
      finalCvUrl = req.file.path; 
      
      // (Tùy chọn) Nếu sếp muốn tự động lưu luôn CV mới này vào kho cho ứng viên thì uncomment đoạn dưới:
      /*
      await CV.create({
        candidate_id: candidateId,
        cv_title: 'CV tải lên lúc nộp đơn',
        file_url: finalCvUrl
      });
      */

    } else if (cvId) {
      // TRƯỜNG HỢP B: ỨNG VIÊN CHỌN CV ĐÃ CÓ TRONG KHO
      const candidateCV = await CV.findOne({
        where: { id: cvId, candidate_id: candidateId } 
      });

      if (!candidateCV) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy CV này trong kho của bạn!' });
      }
      finalCvUrl = candidateCV.file_url; // Lấy link từ DB

    } else {
      // Bắt lỗi: Nếu không có cả File lẫn cvId
      return res.status(400).json({ success: false, message: 'Vui lòng tải lên CV hoặc chọn CV từ hệ thống!' });
    }

    // ==========================================

    // 3. Tiến hành chốt đơn
    const newApplication = await Application.create({
      jobId,
      candidateId,
      cvUrl: finalCvUrl,
      coverLetter
    });

    res.status(201).json({ success: true, message: 'Nộp CV thành công!', data: newApplication });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. [HR] LẤY DANH SÁCH ỨNG VIÊN CỦA 1 JOB
exports.getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.findAll({
      where: { jobId },
      include: [{ model: User, as: 'candidate', attributes: ['id', 'fullname', 'email'] }] 
    });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. [HR] ĐỔI TRẠNG THÁI ĐƠN & LƯU LOG LỊCH SỬ
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body; 

    const application = await Application.findByPk(id);
    if (!application) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn ứng tuyển!' });

    const oldStatus = application.status;

    // Lưu log vào bảng application_logs trước khi đổi
    await ApplicationLog.create({
      applicationId: application.id,
      oldStatus: oldStatus,
      newStatus: newStatus
    });

    // Cập nhật sang trạng thái mới
    application.status = newStatus;
    await application.save();

    res.status(200).json({ success: true, message: `Đã chuyển sang trạng thái: ${newStatus}`, data: application });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. [HR] UNDO - HOÀN TÁC TRẠNG THÁI GẦN NHẤT
exports.undoStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm log gần nhất dựa vào cột changedAt của sếp
    const latestLog = await ApplicationLog.findOne({
      where: { applicationId: id },
      order: [['changedAt', 'DESC']] 
    });

    if (!latestLog) {
      return res.status(400).json({ success: false, message: 'Không có hành động nào để hoàn tác!' });
    }

    const application = await Application.findByPk(id);

    // Rollback trạng thái
    application.status = latestLog.oldStatus;
    await application.save();

    // Xóa cái log vừa undo đi
    await latestLog.destroy();

    res.status(200).json({ success: true, message: 'Hoàn tác thành công!', data: application });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. [ỨNG VIÊN] RÚT ĐƠN ỨNG TUYỂN
exports.withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id;

    const application = await Application.findOne({
      where: { id, candidateId }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn của bạn!' });
    }

    if (application.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Nhà tuyển dụng đã xem CV, không thể rút đơn lúc này!' });
    }

    await application.destroy();

    res.status(200).json({ success: true, message: 'Đã rút đơn ứng tuyển thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};