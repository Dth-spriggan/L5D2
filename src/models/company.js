const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Company = sequelize.define('Company', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    company_name: { type: DataTypes.STRING, allowNull: false },
    tax_code: { type: DataTypes.STRING, allowNull: false },
    logo_url: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    website_url: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT }
}, { tableName: 'companies' });

module.exports = Company;