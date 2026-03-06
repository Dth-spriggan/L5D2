const db = require('../db').promise(); 

// 1. LẤY DANH SÁCH & TÌM KIẾM
exports.getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const q = req.query.q || '';
    const status = req.query.status || 'ACTIVE';

    // Đếm tổng số lượng (Phân trang)
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM jobs WHERE deleted_at IS NULL AND status = ? AND title LIKE ?`,
      [status, `%${q}%`]
    );
    const totalItems = countResult[0].total;

    // Lấy data
    const [jobs] = await db.query(
      `SELECT * FROM jobs WHERE deleted_at IS NULL AND status = ? AND title LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [status, `%${q}%`, limit, offset]
    );

    res.status(200).json({
      success: true,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// 2. TẠO TIN MỚI
exports.createJob = async (req, res) => {
  try {
    // 1. Phải có location ở đây
    const { title, description, salary_gross, job_type, location } = req.body; 
    
    // 2. Phải có chữ location trong ngoặc đơn ĐẦU TIÊN và dấu ? ở ngoặc đơn THỨ HAI
    const [result] = await db.query(
      `INSERT INTO jobs (title, description, salary_gross, job_type, location, status, employer_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, 'PENDING_REVIEW', 1, NOW(), NOW())`,
      [title, description, salary_gross || null, job_type || null, location || 'Chưa cập nhật'] // 3. Phải có location ở mảng này
    );
    
    res.status(201).json({ success: true, message: 'Tạo tin thành công, chờ duyệt!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. CẬP NHẬT TIN
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const [result] = await db.query(
      `UPDATE jobs SET title = ?, description = ?, updated_at = NOW() WHERE id = ?`,
      [title, description, id]
    );
    if (result.affectedRows > 0) res.status(200).json({ success: true, message: 'Cập nhật thành công' });
    else res.status(404).json({ success: false, message: 'Không tìm thấy tin này' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. XÓA MỀM (Soft Delete bằng tay)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE jobs SET deleted_at = NOW() WHERE id = ?`, [id]);
    res.status(200).json({ success: true, message: 'Đã đưa tin vào thùng rác (Soft Delete)' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. KHÔI PHỤC TIN
exports.restoreJob = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE jobs SET deleted_at = NULL WHERE id = ?`, [id]);
    res.status(200).json({ success: true, message: 'Đã khôi phục tin thành công' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 6. ADMIN DUYỆT TIN
exports.approveJob = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE jobs SET status = 'ACTIVE' WHERE id = ?`, [id]);
    res.status(200).json({ success: true, message: 'Đã duyệt tin thành công' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 7. ADMIN TỪ CHỐI TIN
exports.rejectJob = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE jobs SET status = 'REJECTED' WHERE id = ?`, [id]);
    res.status(200).json({ success: true, message: 'Đã từ chối tin' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 8. XÓA CỨNG (Hard Delete) - Bay màu vĩnh viễn khỏi Database
exports.hardDeleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(`DELETE FROM jobs WHERE id = ?`, [id]);
    
    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Đã tiễn tin tuyển dụng bay màu vĩnh viễn!' });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy tin này để xóa' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};