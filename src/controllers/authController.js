const User = require('../models/user');
const CandidateProfile = require('../models/candidateProfile');
const Company = require('../models/company');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerCandidate = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;
        if (await User.findOne({ where: { email } })) 
            return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ fullName, email, password: hashedPassword, role: 'Candidate' });
        await CandidateProfile.create({ user_id: newUser.id, phone });

        res.status(201).json({ success: true, message: 'Đăng ký Ứng viên thành công!' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.registerEmployer = async (req, res) => {
    try {
        const { fullName, email, password, company_name, tax_code } = req.body;
        if (await User.findOne({ where: { email } })) 
            return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ fullName, email, password: hashedPassword, role: 'Employer' });
        await Company.create({ employer_id: newUser.id, company_name, tax_code });

        res.status(201).json({ success: true, message: 'Đăng ký Doanh nghiệp thành công!' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (!user || !(await bcrypt.compare(password, user.password))) 
            return res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu!' });

        const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'super_secret_key', { expiresIn: '1d' });
        res.status(200).json({ success: true, accessToken, user: { id: user.id, fullName: user.fullName, role: user.role } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};