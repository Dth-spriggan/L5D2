const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    fullName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    education: { type: DataTypes.TEXT },
    skills: { type: DataTypes.STRING },
    facebook_url: { type: DataTypes.STRING },
    linkedin_url: { type: DataTypes.STRING }
}, { tableName: 'users' });

module.exports = User;