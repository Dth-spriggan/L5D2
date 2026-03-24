const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// 1. Cấu hình chìa khóa (Dùng chung cho cả CV và Logo)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ==========================================
// 📦 TRẠM BƠM 1: DÀNH CHO CV (CỦA TEAM SẾP)
// ==========================================
const storageCV = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = file.originalname.split('.')[0];
        return {
            folder: 'topcv_cvs',
            resource_type: 'auto',
            format: fileExtension,
            public_id: `${fileName}_${Date.now()}`
        };
    },
});
const uploadCV = multer({ 
    storage: storageCV,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// ==========================================
// 🖼️ TRẠM BƠM 2: DÀNH CHO LOGO CÔNG TY (CỦA SẾP)
// ==========================================
const storageLogo = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'TopCV_Logos',
        allowed_formats: ['jpg', 'jpeg', 'png'] // Cấm up file lạ
    },
});
const uploadLogo = multer({ storage: storageLogo });

// ==========================================
// ĐÓNG GÓI XUẤT KHẨU CẢ 2 TRẠM BƠM
// ==========================================
module.exports = {
    uploadCV,
    uploadLogo
};