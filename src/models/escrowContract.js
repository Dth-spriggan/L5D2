const { DataTypes } = require('sequelize');
// CHÚ Ý: Phải có ngoặc nhọn { sequelize } thì mới gọi được hàm define
const { sequelize } = require('../db'); 

const EscrowContract = sequelize.define('EscrowContract', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    employerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    freelancerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    status: {
        type: DataTypes.ENUM('PENDING_DEPOSIT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'PENDING_DEPOSIT'
    },
    transactionRef: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'escrow_contracts',
    timestamps: true
});

module.exports = EscrowContract;