const { Op } = require('sequelize');
const Job = require('../models/job');
const Company = require('../models/company');
const User = require('../models/user'); // Cứ import để dành nếu sau này cần

// ======================================================================
// 1. PUBLIC: LẤY DANH SÁCH VIỆC LÀM (Ai cũng xem được, có phân trang + tìm kiếm)
// ======================================================================
exports.getPublicJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const q = req.query.q || '';

    const { count, rows } = await Job.findAndCountAll({
      where: {
        status: 'ACTIVE', // Chỉ hiển thị việc đã duyệt
        deleted_at: null,
        title: { [Op.like]: `%${q}%` }
      },
      limit: limit,
      offset: offset,
      order: [['created_at', 'DESC']],
      include: [{
        model: Company,
        as: 'employer',
        attributes: ['id', 'company_name', 'email']
      }]
    });

    res.status(200).json({
      success: true,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
};

// ======================================================================
// 2. EMPLOYER: LẤY DANH SÁCH VIỆC LÀM CỦA CHÍNH CÔNG TY ĐÓ ĐĂNG
// ======================================================================
exports.getEmployerJobs = async (req, res) => {
  try {
    const companyId = req.user.id; // Lấy ID công ty từ Token
    const jobs = await Job.findAll({
      where: { employerId: companyId, deleted_at: null },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
};

// ======================================================================
// 3. ADMIN: LẤY TOÀN BỘ VIỆC LÀM ĐỂ QUẢN LÝ / XÉT DUYỆT
// ======================================================================
exports.getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { deleted_at: null },
      order: [['created_at', 'DESC']],
      include: [{
        model: Company,
        as: 'employer',
        attributes: ['id', 'company_name']
      }]
    });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
};

// ======================================================================
// 4. EMPLOYER: TẠO TIN TUYỂN DỤNG MỚI
// ======================================================================
exports.createJob = async (req, res) => {
  try {
    const { 
      title, description, job_type, location, 
      salary_min, salary_max, requirements, benefits, level, quantity, skills 
    } = req.body;

    const processedSkills = Array.isArray(skills) ? skills.join(', ') : skills;

    const newJob = await Job.create({
      title, description, job_type, location, salary_min, salary_max, 
      requirements, benefits, level, quantity, skills: processedSkills,
      status: 'PENDING_REVIEW', // Mặc định chờ duyệt
      employerId: req.user.id
    });

    res.status(201).json({ success: true, message: "Đăng tin thành công!", job: newJob });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
  }
};

// ======================================================================
// 5. ADMIN: TỪ CHỐI TIN TUYỂN DỤNG
// ==========================================================
exports.rejectJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findOne({ where: { id: id, deleted_at: null } });

    if (!job) return res.status(404).json({ success: false, message: 'Không tìm thấy tin!' });
    if (job.status === 'REJECTED') return res.status(400).json({ success: false, message: 'Tin này đã bị từ chối rồi!' });

    await job.update({ status: 'REJECTED' });
    res.status(200).json({ success: true, message: 'Đã đánh dấu từ chối tin tuyển dụng này!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================================
// 6. ADMIN: XÓA CỨNG (Hard Delete)
// ======================================================================
exports.hardDeleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Job.destroy({ where: { id: id } });
    
    if (deletedRows > 0) {
      res.status(200).json({ success: true, message: 'Đã xóa vĩnh viễn!' });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy tin này để xóa' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};