const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Application = sequelize.define('Application', {
  // 1. Cột ID
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 2. Cột cvUrl (Có tick Not Null)
  cvUrl: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  // 3. Cột coverLetter (Không tick)
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 4. Cột status (Không tick)
  status: {
    type: DataTypes.ENUM('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'),
    allowNull: true,
    defaultValue: 'PENDING'
  },
  // 5. Cột createdAt (TRẢ LẠI SẾP ĐỂ KHỎI BẢO THIẾU NHÉ)
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // 6. Cột updatedAt (TRẢ LẠI SẾP LUÔN)
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // 7. Cột candidateId (Trả về nguyên bản Không tick Not Null)
  candidateId: {
    type: DataTypes.INTEGER,
    allowNull: true 
  },
  // 8. Cột jobId (Trả về nguyên bản Không tick Not Null)
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: true 
  }
}, {
  tableName: 'applications',
  timestamps: true // Vẫn để true để tự động điền giờ lúc HR bấm nút
});

// ⚠️ LƯU Ý CỰC MẠNH: 
// Tôi bắt buộc phải nhét lại khối "associate" này vào. Dù file cv.js của sếp không có, 
// nhưng nếu file này không có thì cái API getDanhSachUngVien() sẽ nổ tung vì nó không biết tìm thông tin User ở đâu!
Application.associate = function(models) {
  Application.belongsTo(models.User, { foreignKey: 'candidateId', as: 'candidate' });
  Application.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
  Application.hasMany(models.ApplicationLog, { foreignKey: 'applicationId', as: 'logs' });
};

module.exports = Application;