const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const CandidateProfile = sequelize.define('CandidateProfile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    phone: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    education: { type: DataTypes.TEXT },
    skills: { type: DataTypes.TEXT },
    facebook_url: { type: DataTypes.STRING },
    linkedin_url: { type: DataTypes.STRING }
}, { tableName: 'candidate_profiles', timestamps: false });

module.exports = CandidateProfile;