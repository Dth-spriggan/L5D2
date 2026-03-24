const Job = require('../models/job');
const User = require('../models/user');

exports.createJob = async (req, res) => {
    try {
        // 1. Lôi đích danh các trường ra để kiểm soát, tránh frontend gửi data bậy bạ (ví dụ cố tình gửi status='OPEN')
        const { 
            title, description, job_type, location, 
            salary_min, salary_max, requirements, benefits, level, quantity, skills 
        } = req.body;

        // 2. Xử lý vụ kỹ năng: Nếu frontend gửi lên mảng ['ReactJS', 'Tailwind']
        // thì đệ gộp lại thành chuỗi 'ReactJS, Tailwind' để lưu vào DB cho mượt.
        const processedSkills = Array.isArray(skills) ? skills.join(', ') : skills;

        // 3. Tạo job mới với các trường đã chuẩn hóa
        const newJob = await Job.create({
            title,
            description,
            job_type,
            location,
            salary_min,
            salary_max,
            requirements,
            benefits,
            level,
            quantity,
            skills: processedSkills,
            employerId: req.user.id // Gắn ID công ty/người đăng từ token
            // status tự động là 'PENDING_REVIEW' theo model
        });

        res.status(201).json({ message: "Đăng tin thành công!", job: newJob });
    } catch (error) {
        console.error("Lỗi tạo job:", error);
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({
            // Tạm thời đệ comment cái điều kiện OPEN lại để đại ca test tạo xong thấy ngay nhé. 
            // Lúc nào làm tính năng duyệt bài thì mở lại sau.
            // where: { status: 'OPEN' }, 
            
            include: [{ 
                model: User, 
                as: 'employer', 
                attributes: ['fullName', 'email'] 
            }]
        });
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Lỗi lấy danh sách job:", error);
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
};