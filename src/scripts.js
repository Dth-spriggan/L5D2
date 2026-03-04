// Đợi HTML tải xong rồi mới chạy logic giao diện
document.addEventListener('DOMContentLoaded', () => {
    
    // ===== 1. XỬ LÝ GIAO DIỆN NAVBAR (ĐĂNG NHẬP / ĐĂNG XUẤT) =====
    const guestMenu = document.getElementById('guest-menu');
    const userMenu = document.getElementById('user-menu');
    const userGreeting = document.getElementById('user-greeting');
    const avatarBtn = document.getElementById('avatar-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');

    // Lệnh if này giúp tránh lỗi khi script chạy ở các trang không có Navbar
    if (guestMenu && userMenu) {
        
        // Lấy thông tin phiên đăng nhập
        const currentUserInfo = localStorage.getItem('currentUser'); 

        if (currentUserInfo) {
            // ---> NẾU ĐÃ ĐĂNG NHẬP <---
            const user = JSON.parse(currentUserInfo);
            
            guestMenu.classList.add('hidden'); // Ẩn nút Đăng nhập/Đăng ký
            
            userMenu.classList.remove('hidden'); // Hiện khối Avatar
            userMenu.classList.add('flex'); 
            
            // Hiển thị tên
            userGreeting.innerText = 'Xin chào, ' + (user.fullName || user.username || 'Bạn');
        } else {
            // ---> NẾU CHƯA ĐĂNG NHẬP <---
            guestMenu.classList.remove('hidden');
            userMenu.classList.add('hidden');
            userMenu.classList.remove('flex');
        }

        // Xử lý bật/tắt Dropdown Menu khi bấm vào Avatar
        if (avatarBtn && dropdownMenu) {
            avatarBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                dropdownMenu.classList.toggle('hidden');
            });

            // Bấm ra ngoài thì tự đóng Menu
            document.addEventListener('click', (e) => {
                if (!userMenu.contains(e.target)) {
                    dropdownMenu.classList.add('hidden');
                }
            });
        }
    }
});

// ===== 2. HÀM ĐĂNG XUẤT TÀI KHOẢN (Viết dạng global để gọi từ HTML) =====
window.logout = function() {
    // Xóa trắng dữ liệu phiên đăng nhập
    localStorage.removeItem('currentUser'); 
    
    // Bật thông báo và đẩy người dùng về trang chủ
    alert('Đã đăng xuất thành công!');
    window.location.href = 'index.html'; 
};