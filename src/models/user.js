const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true 
    },
    role: {
        type: String,
        enum: ['Candidate', 'Employer', 'Admin'],
        required: true
    },
    // --- Thông tin chung ---
    fullName: { type: String },
    phone: { type: String },
    avatar: { type: String }, // URL ảnh đại diện

    // --- Thông tin dành riêng cho Candidate (Ứng viên) ---
    title: { type: String }, // Vị trí mong muốn (VD: Backend Developer)
    skills: [{ type: String }], // Kỹ năng

    // --- Thông tin dành riêng cho Employer (Nhà tuyển dụng) ---
    companyName: { type: String },
    companyAddress: { type: String },
    companyWebsite: { type: String },
    
    // --- Xác thực Doanh nghiệp (KYB) ---
    kybDocument: { type: String }, // URL trỏ tới ảnh/PDF Giấy phép kinh doanh
    kybStatus: {
        type: String,
        enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'],
        default: 'UNVERIFIED'
    }
}, { 
    timestamps: true // Tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('User', userSchema);