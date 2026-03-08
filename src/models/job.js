const { DataTypes } = require('sequelize');
const { sequelize } = require('../db'); // Gọi cái db.js của bạn ông vào đây

// Định nghĩa khung xương của bảng 'jobs'
const Job = sequelize.define('Job', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  salary_gross: { type: DataTypes.INTEGER },
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