const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // 1. Tìm thẻ bài (Token) ứng viên gửi lên
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập (Không thấy Token)!' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Dịch thẻ bài (Dùng đúng cái chìa khóa sếp tạo ở authController)
        const decoded = jwt.verify(token, 'super_secret_key'); 
        
        // 3. Dịch thành công -> Gắn thông tin ứng viên vào req.user để Controller xài
        req.user = decoded; 
        next(); // Mở cổng cho đi tiếp vào Controller
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};