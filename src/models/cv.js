const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const CV = sequelize.define('CV', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  candidate_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cv_title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  is_searchable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // Mặc định up lên là ẩn, muốn cho HR tìm thì phải tự bật
  }
}, {
  tableName: 'cvs',
  timestamps: true, 
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // Bật khiên bảo vệ Xóa mềm
  paranoid: true, 
  deletedAt: 'deleted_at'
});

module.exports = CV;