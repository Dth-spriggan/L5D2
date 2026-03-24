const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Company = sequelize.define('Company', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employer_id: { type: DataTypes.INTEGER, allowNull: false },
    company_name: { type: DataTypes.STRING, allowNull: false },
    tax_code: { type: DataTypes.STRING },
    logo_url: { type: DataTypes.STRING } // Lưu link ảnh Cloudinary
}, { tableName: 'companies', timestamps: false });

module.exports = Company;