// =================================================================
// 1. XỬ LÝ GIAO DIỆN NAVBAR (ĐĂNG NHẬP / ĐĂNG XUẤT)
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    const guestMenu = document.getElementById('guest-menu');
    const userMenu = document.getElementById('user-menu');
    const userGreeting = document.getElementById('user-greeting');
    const avatarBtn = document.getElementById('avatar-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');

    // Lấy các phần tử nút Nhà tuyển dụng
    const empBtnDesktop = document.getElementById('employer-btn-desktop');
    const empDivider = document.getElementById('employer-divider');
    const empBtnMobile = document.getElementById('employer-btn-mobile');

    if (guestMenu && userMenu) {
        const currentUserInfo = localStorage.getItem('currentUser'); 

        if (currentUserInfo) {
            const user = JSON.parse(currentUserInfo);
            guestMenu.classList.add('hidden');
            userMenu.classList.remove('hidden');
            userMenu.classList.add('flex'); 
            userGreeting.innerText = 'Xin chào, ' + (user.fullName || user.username || 'Bạn');

            // NẾU TÀI KHOẢN LÀ ỨNG VIÊN (personal): Ẩn hoàn toàn nút Nhà Tuyển Dụng đi
            if (user.type === 'personal') {
                if (empBtnDesktop) empBtnDesktop.style.display = 'none';
                if (empDivider) empDivider.style.display = 'none';
                if (empBtnMobile) empBtnMobile.style.display = 'none';
            }

        } else {
            guestMenu.classList.remove('hidden');
            userMenu.classList.add('hidden');
            userMenu.classList.remove('flex');
            
            // Đảm bảo hiện lại nếu chưa đăng nhập (đề phòng)
            if (empBtnDesktop) empBtnDesktop.style.display = '';
            if (empDivider) empDivider.style.display = '';
            if (empBtnMobile) empBtnMobile.style.display = '';
        }

        if (avatarBtn && dropdownMenu) {
            avatarBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                dropdownMenu.classList.toggle('hidden');
            });

            document.addEventListener('click', (e) => {
                if (!userMenu.contains(e.target)) {
                    dropdownMenu.classList.add('hidden');
                }
            });
        }
    }

    // Khởi tạo Captcha nếu đang ở trang Đăng ký
    if (document.getElementById("captchaBox")) {
        window.generateCaptcha();
    }
});

// Hàm Đăng xuất
window.logout = function() {
    localStorage.removeItem('currentUser'); 
    alert('Đã đăng xuất thành công!');
    window.location.href = 'index.html'; 
};

// =================================================================
// 2. XỬ LÝ MENU TRƯỢT TRÊN ĐIỆN THOẠI (Hamburger Menu)
// =================================================================
window.toggleMobileMenu = function() {
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-menu-overlay');

    if (!sidebar || !overlay) return;

    const isClosed = sidebar.classList.contains('-translate-x-full');

    if (isClosed) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
};

// =================================================================
// 3. XỬ LÝ TAB Ở TRANG NHÀ TUYỂN DỤNG (tuyendung.html)
// =================================================================
window.switchTab = function(tab) {
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (!loginForm || !registerForm) return; 

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.className = "flex-1 pb-3 text-center font-bold text-blue-600 border-b-2 border-blue-600";
        tabRegister.className = "flex-1 pb-3 text-center font-medium text-slate-500 hover:text-slate-800 transition";
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabRegister.className = "flex-1 pb-3 text-center font-bold text-blue-600 border-b-2 border-blue-600";
        tabLogin.className = "flex-1 pb-3 text-center font-medium text-slate-500 hover:text-slate-800 transition";
    }
};

window.mockAuth = function(action) {
    alert("Đã ghi nhận yêu cầu " + action + "!\n\n(Chờ Backend cung cấp API)");
};

// =================================================================
// 4. XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ ỨNG VIÊN (login.html & register.html)
// =================================================================
window.login = function() {
    const inputUser = document.getElementById("username").value.trim();
    const inputPass = document.getElementById("password").value;
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const validUser = users.find(u => u.username === inputUser && u.password === inputPass && u.type === "personal");

    if (validUser) {
        alert("Đăng nhập thành công! Chào mừng " + validUser.fullName);
        localStorage.setItem("currentUser", JSON.stringify(validUser));
        window.location.href = "index.html";
    } else {
        alert("Sai tài khoản hoặc mật khẩu! (Lưu ý: Chỉ dành cho tài khoản Ứng viên)");
    }
};

let captchaResult = 0;
window.generateCaptcha = function() {
    captchaResult = Math.floor(1000 + Math.random() * 9000);
    document.getElementById("captchaBox").innerText = captchaResult;
    document.getElementById("captchaInput").value = "";
};

window.register = function() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    
    const username = document.getElementById("username").value.trim();
    const name = document.getElementById("fullName").value.trim();
    const dob = document.getElementById("dob").value;
    const phone = document.getElementById("phone").value.trim();
    const pass = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;
    const captchaInput = document.getElementById("captchaInput").value;

    if (!username || !name || !dob || !phone || !pass || !confirm || !captchaInput) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    if (users.find(u => u.username === username)) {
        alert("Tên đăng nhập này đã tồn tại!");
        return;
    }

    if (pass !== confirm) {
        alert("Mật khẩu không khớp!");
        return;
    }

    if (parseInt(captchaInput) !== captchaResult) {
        alert("Mã Captcha không đúng!");
        window.generateCaptcha();
        return;
    }

    let newUser = { 
        username: username, 
        password: pass, 
        type: "personal",
        fullName: name,
        dob: dob,
        phone: phone
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...");
    window.location.href = "login.html";
};
// =================================================================
// 5. XỬ LÝ MENU CON TRÊN MOBILE (ACCORDION)
// =================================================================
window.toggleSubmenu = function(id) {
    const menu = document.getElementById(id);
    if (menu) {
        menu.classList.toggle('hidden');
        menu.classList.toggle('flex'); // Dùng flex để các nút con xếp dọc đều nhau
    }
};

// =================================================================
// 6. BẢO VỆ ROUTE DÀNH RIÊNG CHO USER (AUTH GATEKEEPER)
// =================================================================
window.requireAuth = function(event, targetPage) {
    event.preventDefault(); // Ngăn trình duyệt nhảy trang tự do
    
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert("Vui lòng đăng nhập với tư cách Ứng viên để sử dụng chức năng này!");
        window.location.href = "login.html"; // Đá ra trang đăng nhập
    } else {
        alert("Bạn đã đăng nhập. Sẵn sàng chuyển tới trang: " + targetPage + " (Chờ thiết kế UI)");
        // Khi nào có trang thật, bạn bỏ comment dòng dưới đây:
        // window.location.href = targetPage;
    }
};