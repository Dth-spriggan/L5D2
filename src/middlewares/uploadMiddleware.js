const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config(); // Lấy 3 cái mã bí mật từ file .env

// 1. Cấu hình chìa khóa vào nhà kho Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Thiết lập quy tắc xếp kho (Phiên bản Pro)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  // Dùng function để bắt được thông tin file sếp vừa gửi lên
  params: async (req, file) => {
    // Tách lấy cái đuôi file (pdf, doc, docx)
    const fileExtension = file.originalname.split('.').pop(); 
    // Tách lấy cái tên gốc (bỏ đuôi)
    const fileName = file.originalname.split('.')[0]; 

    return {
      folder: 'topcv_cvs',
      resource_type: 'auto', // Vẫn là tài liệu
      format: fileExtension, // 💡 ÉP CLOUDINARY PHẢI GẮN ĐUÔI .PDF VÀO LINK
      public_id: `${fileName}_${Date.now()}` // 💡 Lấy tên gốc ghép với thời gian để link đẹp và không bị trùng
    };
  },
});

// 3. Giao cho bảo vệ Multer cầm còi (Giới hạn file tối đa 5MB)
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;