const { DataTypes } = require('sequelize');
const { sequelize } = require('../db'); // Gọi cái db.js của bạn ông vào đây

// Định nghĩa khung xương mới của bảng 'jobs' (Đã update theo UI Frontend)
const Job = sequelize.define('Job', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  
  // --- BẮT ĐẦU DÀN LÍNH MỚI THÊM ---
  salary_min: { type: DataTypes.INTEGER },         // Lương tối thiểu
  salary_max: { type: DataTypes.INTEGER },         // Lương tối đa
  requirements: { type: DataTypes.TEXT },          // Yêu cầu ứng viên
  benefits: { type: DataTypes.TEXT },              // Quyền lợi
  level: { type: DataTypes.STRING },               // Cấp bậc
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 }, // Số lượng
  skills: { type: DataTypes.STRING },              // Kỹ năng (Lưu chuỗi)
  employerId: { type: DataTypes.INTEGER },         // Khóa ngoại liên kết nhà tuyển dụng/công ty
  // --- KẾT THÚC DÀN LÍNH MỚI ---

  job_type: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'PENDING_REVIEW' },
  deleted_at: { type: DataTypes.DATE }
}, {
  tableName: 'jobs', // Chỉ định đích danh tên bảng trong Database
  timestamps: true,  // Cho phép Sequelize tự quản lý created_at và updated_at
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Job;