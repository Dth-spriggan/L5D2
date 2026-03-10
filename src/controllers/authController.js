const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); 

exports.register = async (req, res) => {
    try {
        const { email, password, role, fullName, phone } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email đã tồn tại!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword, role, fullName, phone });
        
        res.status(201).json({ message: "Đăng ký thành công!", userId: newUser.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Sai email hoặc mật khẩu!" });
        }

        const accessToken = jwt.sign({ id: user.id, role: user.role }, 'super_secret_key', { expiresIn: '1d' });
        res.status(200).json({ message: "Đăng nhập thành công!", accessToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};