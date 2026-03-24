const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: "Không tìm thấy token!" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Trong này có { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token không hợp lệ!" });
    }
};

exports.isCandidate = (req, res, next) => {
    if (req.user.role !== 'Candidate') return res.status(403).json({ message: "Chỉ dành cho Ứng viên!" });
    next();
};

exports.isEmployer = (req, res, next) => {
    if (req.user.role !== 'Employer') return res.status(403).json({ message: "Chỉ dành cho Nhà tuyển dụng!" });
    next();
};