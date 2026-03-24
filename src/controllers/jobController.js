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
        // 1. Lôi đích danh các trường ra để kiểm soát, tránh frontend gửi data bậy bạ (ví dụ cố tình gửi status='OPEN')
        const { 
            title, description, job_type, location, 
            salary_min, salary_max, requirements, benefits, level, quantity, skills 
        } = req.body;

        // 2. Xử lý vụ kỹ năng: Nếu frontend gửi lên mảng ['ReactJS', 'Tailwind']
        // thì đệ gộp lại thành chuỗi 'ReactJS, Tailwind' để lưu vào DB cho mượt.
        const processedSkills = Array.isArray(skills) ? skills.join(', ') : skills;

        // 3. Tạo job mới với các trường đã chuẩn hóa
        const newJob = await Job.create({
            title,
            description,
            job_type,
            location,
            salary_min,
            salary_max,
            requirements,
            benefits,
            level,
            quantity,
            skills: processedSkills,
            employerId: req.user.id // Gắn ID công ty/người đăng từ token
            // status tự động là 'PENDING_REVIEW' theo model
        });

        res.status(201).json({ message: "Đăng tin thành công!", job: newJob });
    } catch (error) {
        console.error("Lỗi tạo job:", error);
        res.status(500).json({ message: "Lỗi server: " + error.message });
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

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({
            // Tạm thời đệ comment cái điều kiện OPEN lại để đại ca test tạo xong thấy ngay nhé. 
            // Lúc nào làm tính năng duyệt bài thì mở lại sau.
            // where: { status: 'OPEN' }, 
            
            include: [{ 
                model: User, 
                as: 'employer', 
                attributes: ['fullName', 'email'] 
            }]
        });
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Lỗi lấy danh sách job:", error);
        res.status(500).json({ message: "Lỗi server: " + error.message });
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

// Nằm ở src/controllers/jobController.js

exports.getAllJobs = async (req, res) => {
  try {
    // 1. Nhận lệnh từ Frontend gửi lên qua URL (Query Parameters)
    // Ví dụ: /api/jobs?limit=6&page=1
    const limit = parseInt(req.query.limit) || 10; // Nếu không bảo gì, mặc định lấy 10 job/trang
    const page = parseInt(req.query.page) || 1;    // Mặc định ở trang 1
    const offset = (page - 1) * limit;             // Công thức tính số Job bị bỏ qua

    // 2. Dùng findAndCountAll thay vì findAll (Để lấy được tổng số lượng Job)
    const jobs = await Job.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']],
      include: [
        { 
          model: Company, 
          as: 'company',
          attributes: ['companyName', 'logoUrl'] 
        }
      ]
    });

    // 3. Trả về kết quả siêu chi tiết cho Frontend
    res.status(200).json({ 
      success: true, 
      data: jobs.rows, // Chứa mảng dữ liệu các Job
      pagination: {
        totalItems: jobs.count, // Tổng cộng Database có bao nhiêu cái Job
        totalPages: Math.ceil(jobs.count / limit), // Tổng số trang
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
