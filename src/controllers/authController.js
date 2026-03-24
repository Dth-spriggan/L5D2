const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Company = require('../models/company');

exports.registerCandidate = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ fullName, email, password: hashedPassword });
        res.status(201).json({ success: true, message: "Đăng ký Ứng viên thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi đăng ký", error: error.message });
    }
};

exports.registerEmployer = async (req, res) => {
    try {
        const { company_name, tax_code, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await Company.create({ company_name, tax_code, email, password: hashedPassword });
        res.status(201).json({ success: true, message: "Đăng ký Nhà tuyển dụng thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi đăng ký", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let account = await User.findOne({ where: { email } });
        let role = 'Candidate';

        if (!account) {
            account = await Company.findOne({ where: { email } });
            role = 'Employer';
        }

        if (!account || !(await bcrypt.compare(password, account.password))) {
            return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
        }

        const token = jwt.sign({ id: account.id, role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token, role, name: account.fullName || account.company_name });
    } catch (error) {
        res.status(500).json({ message: "Lỗi login", error: error.message });
    }
};