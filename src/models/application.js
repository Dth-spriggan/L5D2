const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Application = sequelize.define('Application', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cvUrl: { type: DataTypes.STRING, allowNull: false },
    coverLetter: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'), defaultValue: 'PENDING' }
}, { tableName: 'applications' });

module.exports = Application;