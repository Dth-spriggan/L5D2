const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Vui lòng nhập tiêu đề công việc'] 
    },
    // Liên kết với tài khoản Nhà tuyển dụng
    employer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    description: { 
        type: String, 
        required: [true, 'Vui lòng nhập mô tả công việc'] 
    },
    requirements: { 
        type: String, 
        required: [true, 'Vui lòng nhập yêu cầu ứng viên'] 
    },
    salaryRange: { 
        type: String, // Ví dụ: "15 - 20 Triệu", "Thỏa thuận"
        default: 'Thỏa thuận'
    },
    location: { 
        type: String, 
        required: [true, 'Vui lòng nhập địa điểm làm việc'] 
    },
    jobType: { 
        type: String, 
        enum: ['Full-time', 'Part-time', 'Remote', 'Internship', 'Freelance'], 
        default: 'Full-time' 
    },
    status: { 
        type: String, 
        enum: ['OPEN', 'CLOSED', 'DRAFT'], 
        default: 'OPEN' // OPEN là đang hiển thị cho ứng viên thấy
    },
    deadline: { 
        type: Date, 
        required: [true, 'Vui lòng chọn hạn nộp hồ sơ'] 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Job', jobSchema);