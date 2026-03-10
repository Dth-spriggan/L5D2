const { Sequelize } = require('sequelize');
require('dotenv').config(); // Gọi cái này để nó đọc được file .env

// Lấy thông số từ file .env
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT, // Cổng 26197 của Aiven
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            // ĐÂY LÀ CHÌA KHÓA: Aiven bắt buộc phải có SSL
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Đã kết nối Aiven Cloud MySQL thành công!');
    } catch (error) {
        console.error('❌ Lỗi kết nối MySQL:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };