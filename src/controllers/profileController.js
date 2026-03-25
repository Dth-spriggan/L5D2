const User = require('../models/user');
const Company = require('../models/company');

// 1. Phải có hàm này để dòng 8 bên Route không bị lỗi
exports.updateCandidateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, phone, education, skills, facebook_url, linkedin_url } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "Không tìm thấy ứng viên" });

        await user.update({ fullName, phone, education, skills, facebook_url, linkedin_url });

        res.json({ success: true, message: "Cập nhật CV thành công!", data: user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

// 2. Hàm cho Nhà tuyển dụng (Sếp đang mở ở dòng 29 trong ảnh)
exports.updateEmployerProfile = async (req, res) => {
    try {
        const employerId = req.user.id; // Lấy ID từ Token
        
        // 🌟 Bóc tách đúng các trường đang có trong DBeaver (Trừ website_url nếu sếp bỏ)
        const { company_name, tax_code, address, description } = req.body;

        const company = await Company.findByPk(employerId);
        if (!company) return res.status(404).json({ message: "Không tìm thấy Công ty!" });

        // Ghi đè dữ liệu mới
        await company.update({ 
            company_name, 
            tax_code, 
            address, 
            description 
            // website_url: website_url // Bỏ dòng này nếu sếp xóa cột
        });

        res.json({ 
            success: true, 
            message: "Cập nhật hồ sơ Công ty thành công!", 
            data: company 
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

// PHẢI CÓ CHỮ exports. Ở ĐẦU THÌ BÊN ROUTE MỚI THẤY ĐƯỢC
exports.getCandidateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] } // Giấu mật khẩu đi cho bảo mật
        });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

exports.getEmployerProfile = async (req, res) => {
    try {
        const company = await Company.findByPk(req.user.id);
        if (!company) return res.status(404).json({ message: "Không tìm thấy Công ty!" });

        res.json({ success: true, data: company });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};