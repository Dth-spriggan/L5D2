const Job = require('../models/job');
const User = require('../models/user');
const { Op } = require('sequelize'); // Cần import cái này để dùng lệnh LIKE tìm kiếm

// 1. LẤY DANH SÁCH & TÌM KIẾM (Có phân trang)
exports.getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const q = req.query.q || '';
    const status = req.query.status || 'ACTIVE';

    // Tuyệt chiêu findAndCountAll: Vừa lấy data, vừa đếm tổng số dòng
    const { count, rows } = await Job.findAndCountAll({
      where: {
        status: status,
        deleted_at: null,
        title: { [Op.like]: `%${q}%` } // Tìm kiếm chứa từ khóa
      },
      limit: limit,
      offset: offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'fullName', 'email'] // Nối bảng User để lấy tên người đăng
        }
      ]
    });

    res.status(200).json({
      success: true,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: rows // Dữ liệu trả về
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// 2. TẠO TIN MỚI
exports.createJob = async (req, res) => {
  try {
    // Lấy thông tin từ body
    const { title, description, salary_gross, job_type, location } = req.body; 
    
    // 💡 XỬ LÝ USER: Nếu có Token đăng nhập thì lấy req.user.id. Nếu đang test chay thì lấy từ body.
    const employerId = req.user?.id || req.body.employerId;

    if (!employerId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin người đăng (employerId)!' });
    }

    const newJob = await Job.create({
      title,
      description,
      salary_gross: salary_gross || null,
      job_type: job_type || null,
      location: location || 'Chưa cập nhật',
      status: 'PENDING_REVIEW', // Trạng thái mặc định chờ duyệt
      employerId: employerId,   // Nhét ID người đăng vào đây
      deleted_at: null
    });
    
    res.status(201).json({ success: true, message: 'Tạo tin thành công, chờ duyệt!', data: newJob });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. CẬP NHẬT TIN
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    const [updatedRows] = await Job.update(
      { title, description },
      { where: { id: id } }
    );

    if (updatedRows > 0) res.status(200).json({ success: true, message: 'Cập nhật thành công' });
    else res.status(404).json({ success: false, message: 'Không tìm thấy tin này' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. XÓA MỀM (Soft Delete bằng tay)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await Job.update(
      { deleted_at: new Date() }, 
      { where: { id: id, deleted_at: null } }
    );
    
    if (updatedRows > 0) res.status(200).json({ success: true, message: 'Đã đưa tin vào thùng rác (Soft Delete)' });
    else res.status(404).json({ success: false, message: 'Không tìm thấy tin này' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. KHÔI PHỤC TIN
exports.restoreJob = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await Job.update(
      { deleted_at: null }, 
      { where: { id: id } }
    );
    
    if (updatedRows > 0) res.status(200).json({ success: true, message: 'Đã khôi phục tin thành công' });
    else res.status(404).json({ success: false, message: 'Không tìm thấy tin này' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 6. ADMIN DUYỆT TIN
// PHIÊN BẢN NÂNG CẤP (Check logic kỹ hơn)
exports.approveJob = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Tìm cái tin đó trước xem nó có tồn tại và chưa bị xóa mềm không
    const job = await Job.findOne({ where: { id: id, deleted_at: null } });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin hoặc tin đã bị xóa!' });
    }

    // 2. Kiểm tra xem nó đã được duyệt chưa
    if (job.status === 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Tin này đã được duyệt từ trước rồi sếp ơi!' });
    }

    // 3. Nếu mọi thứ ok thì mới cập nhật
    await job.update({ status: 'ACTIVE' });
    
    res.status(200).json({ success: true, message: 'Đã duyệt tin thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// 7. ADMIN TỪ CHỐI TIN
// 7. ADMIN TỪ CHỐI TIN (Phiên bản nâng cấp chuẩn Product)
exports.rejectJob = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Tìm tin xem có tồn tại và chưa bị đưa vào thùng rác không
    const job = await Job.findOne({ where: { id: id, deleted_at: null } });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin hoặc tin đã bị xóa!' });
    }

    // 2. Kiểm tra xem nó đã bị trảm từ trước chưa
    if (job.status === 'REJECTED') {
      return res.status(400).json({ success: false, message: 'Tin này đã bị từ chối từ trước rồi sếp ơi, không cần chém bồi đâu!' });
    }

    // 3. Tiến hành trảm (Đổi status sang REJECTED)
    // 💡 Ghi chú Product: Khi ra thực tế, chỗ này có thể nhận thêm req.body.reason (Lý do từ chối) để gửi email chửi... à nhầm, nhắc nhở Giám đốc.
    await job.update({ status: 'REJECTED' });
    
    res.status(200).json({ success: true, message: 'Đã đánh dấu từ chối tin tuyển dụng này!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 8. XÓA CỨNG (Hard Delete)
exports.hardDeleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Job.destroy({ where: { id: id } });
    
    if (deletedRows > 0) {
      res.status(200).json({ success: true, message: 'Đã tiễn tin tuyển dụng bay màu vĩnh viễn!' });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy tin này để xóa' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};