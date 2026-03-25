const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const SavedJob = sequelize.define('SavedJob', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'saved_jobs',
    timestamps: false
});

module.exports = SavedJob;