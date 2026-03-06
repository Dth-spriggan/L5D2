const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Job = sequelize.define('Job', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    salaryRange: { type: DataTypes.STRING, defaultValue: 'Thỏa thuận' },
    status: { type: DataTypes.ENUM('OPEN', 'CLOSED'), defaultValue: 'OPEN' }
}, { tableName: 'jobs' });

module.exports = Job;