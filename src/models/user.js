const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    fullName: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Candidate', 'Employer'), allowNull: false }
}, { tableName: 'users' });

module.exports = User;