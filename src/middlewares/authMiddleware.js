const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập!' });
    }
    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
        next(); 
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

exports.isEmployer = (req, res, next) => {
    if (req.user && req.user.role === 'Employer') next(); 
    else return res.status(403).json({ success: false, message: 'Chỉ dành cho Nhà Tuyển Dụng!' });
};

exports.isCandidate = (req, res, next) => {
    if (req.user && req.user.role === 'Candidate') next(); 
    else return res.status(403).json({ success: false, message: 'Chỉ dành cho Ứng viên!' });
};