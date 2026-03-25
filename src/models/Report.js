const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Report = sequelize.define('Report', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    reporter_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    job_id: { 
        type:  DataTypes.INTEGER, 
        allowNull: false 
    },
    reason: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    status: { 
        type: DataTypes.STRING, 
        defaultValue: 'pending' // pending (đang chờ), resolved (đã xử lý), rejected (từ chối)
    }
}, {
    tableName: 'reports',
    timestamps: true, // Bật cái này lên để nó tự quản lý thời gian
    createdAt: 'created_at', // Ép nó dùng đúng tên cột trong DB của sếp
    updatedAt: false // Bảng của sếp không có cột updatedAt nên tắt đi
});

module.exports = Report;