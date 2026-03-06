const { DataTypes } = require('sequelize');
const { sequelize } = require('../db'); 

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Candidate', 'Employer', 'BLV XoiLacTV'), allowNull: false },
    fullName: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    kybDocument: { type: DataTypes.STRING },
    kybStatus: { type: DataTypes.ENUM('UNVERIFIED', 'PENDING', 'VERIFIED'), defaultValue: 'UNVERIFIED' }
}, { tableName: 'users' });

module.exports = User;