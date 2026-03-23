const { DataTypes, Sequelize } = require('sequelize');
const { sequelize } = require('../db');

const ApplicationLog = sequelize.define('ApplicationLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  applicationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  oldStatus: {
    type: DataTypes.STRING(50),
    allowNull: false 
  },
  newStatus: {
    type: DataTypes.STRING(50),
    allowNull: false 
  },
  changedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') 
  }
}, {
  tableName: 'application_logs',
  timestamps: false // DB của sếp tự tạo changedAt nên tắt cái mặc định đi
});

// Nối sang bảng Application
ApplicationLog.associate = function(models) {
  ApplicationLog.belongsTo(models.Application, { foreignKey: 'applicationId', as: 'application' });
};

module.exports = ApplicationLog;