const CV = require('../models/cv');

// ==========================================
// 👱‍♂️ NHÓM API CHO ỨNG VIÊN (CANDIDATE)
// ==========================================

// 1. TẢI CV LÊN (Đã nâng cấp lên Cloudinary)
exports.uploadCV = async (req, res) => {
  try {
    const { cv_title } = req.body;
    const candidate_id = req.user?.id || req.body.candidate_id; 

    // 💡 Thằng Multer cất link của Cloudinary vào biến req.file.path
    // 1. Lấy thẳng link gốc từ Cloudinary lưu vào DB
    const file_url = req.file?.path;

    if (!candidate_id || !file_url) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin file hoặc ID ứng viên!' });
    }

    const newCV = await CV.create({ candidate_id, cv_title, file_url });
    res.status(201).json({ success: true, message: 'Up CV lên mây thành công!', data: newCV });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. LẤY DANH SÁCH CV CỦA TÔI
exports.getMyCVs = async (req, res) => {
  try {
    const candidate_id = req.user?.id || req.query.candidate_id; 
    if (!candidate_id) return res.status(400).json({ success: false, message: 'Thiếu candidate_id' });

    const cvs = await CV.findAll({ where: { candidate_id } });
    res.status(200).json({ success: true, data: cvs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. SỬA TÊN HOẶC ĐỔI FILE CV
exports.updateCV = async (req, res) => {
  try {
    const { id } = req.params;
    const { cv_title, file_url } = req.body;

    const [updated] = await CV.update({ cv_title, file_url }, { where: { id } });
    if (updated) res.status(200).json({ success: true, message: 'Cập nhật CV thành công!' });
    else res.status(404).json({ success: false, message: 'Không tìm thấy CV' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. BẬT/TẮT TÌM KIẾM
exports.toggleSearchable = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_searchable } = req.body; 

    const [updated] = await CV.update({ is_searchable }, { where: { id } });
    if (updated) res.status(200).json({ success: true, message: `Đã ${is_searchable ? 'BẬT' : 'TẮT'} chế độ tìm việc!` });
    else res.status(404).json({ success: false, message: 'Không tìm thấy CV' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. XÓA MỀM CV (Ứng viên dùng)
exports.deleteCV = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CV.destroy({ where: { id } });
    if (deleted) res.status(200).json({ success: true, message: 'Đã xóa CV khỏi hồ sơ!' });
    else res.status(404).json({ success: false, message: 'Không tìm thấy CV' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 👑 NHÓM API CHO ADMIN ĐI TUẦN TRA
// ==========================================

// 6. ADMIN XEM TOÀN BỘ CV
exports.getAllCVsForAdmin = async (req, res) => {
  try {
    const cvs = await CV.findAll();
    res.status(200).json({ success: true, total: cvs.length, data: cvs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 7. ADMIN XÓA CỨNG CV
exports.hardDeleteCV = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CV.destroy({ where: { id }, force: true });
    if (deleted) res.status(200).json({ success: true, message: 'Đã tiêu hủy CV vĩnh viễn!' });
    else res.status(404).json({ success: false, message: 'Không tìm thấy CV' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 8. [ỨNG VIÊN] KHÔI PHỤC CV ĐÃ XÓA MỀM (UNDO)
exports.restoreCV = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm CV đã bị xóa mềm (Bắt buộc phải có paranoid: false thì mới mò được vào thùng rác)
    const cv = await CV.findOne({ where: { id }, paranoid: false });

    if (!cv) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy CV này!' });
    }

    if (!cv.deleted_at) {
      return res.status(400).json({ success: false, message: 'CV này có bị xóa đâu mà đòi khôi phục hả sếp?' });
    }

    // 💡 Ma thuật của Sequelize: 1 lệnh restore() là deleted_at sẽ biến thành NULL
    await cv.restore();
    
    res.status(200).json({ success: true, message: 'Đã hồi sinh CV thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};