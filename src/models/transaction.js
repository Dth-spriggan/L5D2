const { DataTypes } = require('sequelize');
const { sequelize } = require('../db'); // Thêm ngoặc nhọn ở đây

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    escrowContractId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('DEPOSIT', 'RELEASE', 'REFUND'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
        defaultValue: 'PENDING'
    },
    paymentGateway: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transactionRef: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'transactions',
    timestamps: true
});

module.exports = Transaction;