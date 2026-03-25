// =================================================================
// 0.0 HÀNG RÀO BẢO VỆ (CHẠY NGAY LẬP TỨC TRƯỚC KHI RENDER HTML)
// =================================================================
(function routeGuard() {
    const currentPath = window.location.pathname.toLowerCase();
    const userStr = localStorage.getItem('currentUser');
    
    let role = 'guest'; // Mặc định là khách chưa đăng nhập

    if (userStr) {
        const currentUser = JSON.parse(userStr);
        
        // 🛑 CHỐT CHẶN TỐI THƯỢNG: KIỂM TRA ÁN PHẠT THỜI GIAN THỰC
        const allUsers = JSON.parse(localStorage.getItem('users')) || [];
        const userInDB = allUsers.find(u => u.username === currentUser.username);
        
        if (userInDB && userInDB.isBanned) {
            // Tước quyền đăng nhập ngay lập tức
            localStorage.removeItem('currentUser');
            alert("⛔ TÀI KHOẢN CỦA BẠN ĐÃ BỊ KHÓA!\n\nLý do: " + (userInDB.banReason || "Vi phạm quy định của hệ thống.") + "\n\nVui lòng liên hệ CSKH qua số (024) 37663311 hoặc email admin@midcv.vn để được hỗ trợ.");
            
            // Đá văng ra trang chủ (hoặc load lại nếu đang ở trang chủ)
            if (!currentPath.includes('index.html') && currentPath !== '/' && !currentPath.endsWith('/')) {
                window.location.replace('index.html');
            } else {
                window.location.reload();
            }
            return; // Dừng toàn bộ script bên dưới
        }

        // Nhận diện thân phận nếu tài khoản trong sạch
        if (currentUser.username === 'admin') role = 'admin';
        else if (currentUser.type === 'employer') role = 'employer';
        else role = 'candidate';
    }

    // 1. LUẬT CỦA DOANH NGHIỆP: "Nội bất xuất"
    if (role === 'employer') {
        if (!currentPath.includes('doanhnghiep.html')) window.location.replace('doanhnghiep.html');
    }
    
    // 2. LUẬT CỦA ADMIN: Không mò vào trang Doanh nghiệp
    else if (role === 'admin') {
        if (currentPath.includes('doanhnghiep.html')) window.location.replace('index.html');
    }

    // 3. LUẬT CỦA ỨNG VIÊN: Cấm vào Admin / Doanh nghiệp
    else if (role === 'candidate') {
        if (currentPath.includes('admin.html') || currentPath.includes('doanhnghiep.html')) window.location.replace('index.html');
    }

    // 4. LUẬT CỦA KHÁCH VÃNG LAI
    else if (role === 'guest') {
        if (currentPath.includes('admin.html') || currentPath.includes('doanhnghiep.html')) window.location.replace('index.html');
    }

    // 5. LUẬT CỦA NGƯỜI ĐÃ ĐĂNG NHẬP: Chặn quay lại Form Login/Register
    if (role !== 'guest') {
        if (currentPath.includes('login.html') || currentPath.includes('register.html') || currentPath.includes('tuyendung.html')) {
            if (role === 'employer') window.location.replace('doanhnghiep.html');
            else window.location.replace('index.html');
        }
    }
})();
// =================================================================
// 0. KHỞI TẠO DỮ LIỆU GỐC (SEED DATA)
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lấy két sắt chứa danh sách người dùng ra kiểm tra
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // 2. Tìm xem đã có ai tên là 'admin' chưa
    const adminExists = users.find(u => u.username === 'admin');
    
    // 3. Nếu chưa có thì tự động "đẻ" ra một tài khoản Admin xịn xò
    if (!adminExists) {
        const adminAccount = { 
            username: "admin", 
            password: "admin", 
            fullName: "Anh Bộ PC", 
            email: "admin@midcv.vn",
            avatar: "./assets/logouser.png" // Cấp luôn cái ảnh đại diện mặc định
        };
        users.push(adminAccount);
        localStorage.setItem('users', JSON.stringify(users));
        console.log("⚙️ Hệ thống đã tự động khởi tạo tài khoản Admin!");
    }
    if (window.location.pathname.includes('doanhnghiep.html')) {
        setTimeout(loadCompanySettings, 200);
    }
});

// =================================================================
// 0.1 MÀNG LỌC TOÀN CỤC (ĐỒNG BỘ CHUẨN XÁC VỚI ADMIN)
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. LẤY DỮ LIỆU TỰ TẠO (DOANH NGHIỆP ĐĂNG)
    const customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const customComps = JSON.parse(localStorage.getItem('custom_companies')) || [];

    // 2. GỘP VÀO KHO CHUNG (MOCK DATA)
    if (typeof window.mockJobs !== 'undefined') {
        const existingIds = window.mockJobs.map(j => j.id);
        const newJobs = customJobs.filter(j => !existingIds.includes(j.id));
        window.mockJobs = [...window.mockJobs, ...newJobs];
    }
    if (typeof window.mockCompaniesDB !== 'undefined') {
        const existingCIds = window.mockCompaniesDB.map(c => c.id);
        const newComps = customComps.filter(c => !existingCIds.includes(c.id));
        window.mockCompaniesDB = [...window.mockCompaniesDB, ...newComps];
    }

    // 3. NẾU LÀ TRANG ADMIN -> DỪNG Ở ĐÂY (Admin cần thấy hết để duyệt/xóa)
    if (window.location.pathname.includes('admin.html')) return;

    // 4. MÀNG LỌC HIỂN THỊ PUBLIC CHUẨN XÁC (KHÔNG HÀN CHẾT SỐ)
    const deletedJobs = JSON.parse(localStorage.getItem('admin_deleted_jobs')) || [];
    const approvedJobs = JSON.parse(localStorage.getItem('admin_approved_jobs')) || [];
    const deletedComps = JSON.parse(localStorage.getItem('admin_deleted_comps')) || [];
    const approvedComps = JSON.parse(localStorage.getItem('admin_approved_comps')) || [];

    if (typeof window.mockJobs !== 'undefined') {
        window.mockJobs = window.mockJobs.filter(j => {
            if (deletedJobs.includes(j.id)) return false; // Admin đã cấm -> Xóa sổ
            if (approvedJobs.includes(j.id)) return true; // Admin đã duyệt -> Hiện
            
            // Nếu là data gốc ban đầu (không do user tự tạo) -> Mặc định Hiện
            const isUserCreated = customJobs.some(cj => cj.id === j.id);
            if (!isUserCreated) return true;

            return false; // Còn lại (tin mới đăng chưa duyệt) -> Ẩn
        });
    }

    if (typeof window.mockCompaniesDB !== 'undefined') {
        window.mockCompaniesDB = window.mockCompaniesDB.filter(c => {
            if (deletedComps.includes(c.id)) return false; 
            if (approvedComps.includes(c.id)) return true; 
            
            // Nếu là công ty gốc (không do user tự tạo) -> Mặc định Hiện
            const isUserCreated = customComps.some(cc => cc.id === c.id);
            if (!isUserCreated) return true;

            return false; 
        });
    }
});

// =================================================================
// 1. XỬ LÝ GIAO DIỆN NAVBAR (ĐĂNG NHẬP / ĐĂNG XUẤT)
// =================================================================
document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------------------------------------
    // 1. ẨN NÚT TRỞ VỀ NẾU ĐANG Ở TRANG CHỦ (INDEX.HTML)
    // ---------------------------------------------------------
    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) {
        const path = window.location.pathname.toLowerCase();
        if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
            backBtn.style.display = 'none';
        }
    }

    // ---------------------------------------------------------
    // 2. HIỂN THỊ MENU ĐĂNG NHẬP / AVATAR & QUẢN LÝ NÚT DOANH NGHIỆP
    // ---------------------------------------------------------
    const guestMenu = document.getElementById('guest-menu');
    const userMenu = document.getElementById('user-menu');
    const employerBtnDesktop = document.getElementById('employer-btn-desktop');
    const employerDivider = document.getElementById('employer-divider');
    const employerBtnMobile = document.getElementById('employer-btn-mobile');

    const userStr = localStorage.getItem('currentUser');

    if (userStr) {
        // --- KHI ĐÃ ĐĂNG NHẬP ---
        try {
            const user = JSON.parse(userStr);

            // 2.1 Bơm dữ liệu vào Avatar và Menu (Đã khôi phục)
            const headerAvatar = document.getElementById('header-avatar');
            const dropdownAvatar = document.getElementById('dropdown-avatar');
            const dropdownName = document.getElementById('dropdown-name');
            const dropdownEmail = document.getElementById('dropdown-email');

            if (headerAvatar) headerAvatar.src = user.avatar || './assets/logouser.png';
            if (dropdownAvatar) dropdownAvatar.src = user.avatar || './assets/logouser.png';
            if (dropdownName) dropdownName.textContent = user.fullName || user.username;
            if (dropdownEmail) dropdownEmail.textContent = user.email || user.username;

        } catch (error) {
            console.error("Lỗi đọc dữ liệu User:", error);
        }

        // 2.2 Ép buộc Ẩn/Hiện bằng style.display (Đè bẹp class md:flex của Tailwind)
        if (guestMenu) guestMenu.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            userMenu.classList.remove('hidden');
        }

        // 2.3 Giấu nút Doanh nghiệp
        if (employerBtnDesktop) employerBtnDesktop.style.display = 'none';
        if (employerDivider) employerDivider.style.display = 'none';
        if (employerBtnMobile) employerBtnMobile.style.display = 'none';

    } else {
        // --- KHI CHƯA ĐĂNG NHẬP ---
        if (guestMenu) {
            guestMenu.style.display = ''; // Trả về mặc định cho CSS tự lo
            guestMenu.classList.remove('hidden');
        }
        if (userMenu) userMenu.style.display = 'none';

        if (employerBtnDesktop) employerBtnDesktop.style.display = '';
        if (employerDivider) employerDivider.style.display = '';
        if (employerBtnMobile) employerBtnMobile.style.display = '';
    }

    // ---------------------------------------------------------
    // 3. BẢO VỆ TRANG USER UI & RENDER CAPTCHA
    // ---------------------------------------------------------
    if (document.getElementById('avatarPreview') && !userStr) {
        window.location.replace('index.html');
    }

    if (document.getElementById("captchaBox")) {
        if (typeof window.generateCaptcha === 'function') window.generateCaptcha();
    }
    
    // ---------------------------------------------------------
    // 4. HIGHLIGHT MENU HEADER (ACTIVE STATE)
    // ---------------------------------------------------------
    const currentPath = window.location.pathname.toLowerCase();
    const navVieclam = document.getElementById('nav-vieclam');
    const navCongty = document.getElementById('nav-congty');

    const setActiveMenu = (menuItem) => {
        if (menuItem) {
            menuItem.classList.remove('text-gray-700', 'border-transparent');
            menuItem.classList.add('text-blue-600', 'border-blue-600');
        }
    };

    if (currentPath.includes('vieclam.html')) {
        setActiveMenu(navVieclam);
    } else if (currentPath.includes('congty.html')) {
        setActiveMenu(navCongty);
    }

    // ---------------------------------------------------------
    // 5. BẬT/TẮT CHUÔNG THÔNG BÁO CHO USER
    // ---------------------------------------------------------
    window.toggleUserNotifications = function() {
        const dropdown = document.getElementById('user-noti-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
            dropdown.classList.toggle('opacity-0');
            dropdown.classList.toggle('invisible');
        }
    };
});

// ---------------------------------------------------------
// HÀM CHẶN SỰ KIỆN CLICK VÀO NÚT "ĐĂNG TUYỂN NGAY" (Dự phòng)
// ---------------------------------------------------------
window.handleEmployerAction = function(event) {
    event.preventDefault(); 
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        alert('CẢNH BÁO: Bạn đang đăng nhập với tư cách Ứng viên!\nVui lòng Đăng xuất tài khoản cá nhân trước khi sử dụng chức năng Nhà Tuyển Dụng.');
    } else {
        window.location.href = 'tuyendung.html';
    }
};

// Hàm Đăng xuất
window.logout = function() {
    localStorage.removeItem('currentUser'); 
    alert('Đã đăng xuất thành công!');
    window.location.href = 'index.html'; 
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

    // =========================================================
    // LỐI ĐI VIP DÀNH RIÊNG CHO ADMIN (Bỏ qua mọi kiểm tra)
    // =========================================================
    if (inputUser === "admin") {
        const adminUser = users.find(u => u.username === "admin" && u.password === inputPass);
        
        if (adminUser) {
            alert("Đăng nhập thành công! Chào mừng Quản trị viên hệ thống.");
            localStorage.setItem("currentUser", JSON.stringify(adminUser));
            window.location.href = "admin.html"; // Đá thẳng vào đại bản doanh
            return; // Dừng toàn bộ hàm tại đây, không chạy xuống dưới nữa
        } else {
            alert("Sai mật khẩu Admin!");
            return;
        }
    }

    // =========================================================
    // LUỒNG KIỂM TRA DÀNH CHO ỨNG VIÊN (USER THƯỜNG)
    // =========================================================
    
    // 1. Kiểm tra định dạng Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputUser)) {
        alert("Email không đúng định dạng! Vui lòng nhập đúng dạng example@email.com");
        return;
    }

    // 2. Kiểm tra thông tin trong Database
    const validUser = users.find(u => u.username === inputUser && u.password === inputPass && u.type === "personal");

    if (validUser) {
        alert("Đăng nhập thành công! Chào mừng " + validUser.fullName);
        localStorage.setItem("currentUser", JSON.stringify(validUser));
        window.location.href = "index.html"; // Ứng viên thì về trang chủ
    } else {
        alert("Sai email hoặc mật khẩu! (Lưu ý: Chỉ dành cho tài khoản Ứng viên)");
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        alert("Email không đúng định dạng! Vui lòng nhập đúng dạng example@email.com");
        return;
    }

    if (users.find(u => u.username === username)) {
        alert("Email này đã được đăng ký!");
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
    event.preventDefault();
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert("Vui lòng đăng nhập với tư cách Ứng viên để sử dụng chức năng này!");
        window.location.href = "login.html";
    } else {
        window.location.href = targetPage;
    }
};
// =================================================================
// 7. XỬ LÝ SIDEBAR CỦA TRANG DASHBOARD DOANH NGHIỆP
// =================================================================
window.toggleAdminSidebar = function() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-overlay');

    if (!sidebar || !overlay) return; // Nếu không ở trang Admin thì bỏ qua

    const isClosed = sidebar.classList.contains('-translate-x-full');

    if (isClosed) {
        // Mở sidebar: Kéo từ trái sang phải, làm mờ nền màn hình
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        // Đóng sidebar: Trả về trạng thái giấu ngoài màn hình
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
};
// =================================================================
// 8. XỬ LÝ CHUYỂN TAB TRONG DASHBOARD DOANH NGHIỆP (Single Page App)
// =================================================================
window.switchAdminView = function(viewId) {
    // 1. Ẩn tất cả các khối nội dung (Views)
    const allViews = document.querySelectorAll('.admin-view');
    allViews.forEach(view => {
        view.classList.remove('block');
        view.classList.add('hidden');
    });

    // 2. Hiện khối nội dung được chọn
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('block');
    }

    // 3. Xử lý đổi màu Menu Sidebar (Active state)
    // Lấy tất cả các nút menu
    const navBtns = document.querySelectorAll('.admin-nav-btn');
    navBtns.forEach(btn => {
        // Reset về màu xám mặc định
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-900/20');
        btn.classList.add('text-slate-300', 'hover:bg-slate-800', 'hover:text-white');
    });

    // Đổi màu xanh cho nút đang được bấm
    const activeBtn = document.getElementById('nav-' + viewId);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-300', 'hover:bg-slate-800', 'hover:text-white');
        activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-900/20');
    }

    // 4. Đổi tiêu đề Header tương ứng
    const titleObj = {
        'overview': 'Bảng điều khiển',
        'post-job': 'Quản lý Đăng tin',
        'candidates': 'Hồ sơ ứng viên',
        'settings': 'Cài đặt công ty'
    };
    const headerTitle = document.getElementById('dashboard-title');
    if (headerTitle && titleObj[viewId]) {
        headerTitle.innerText = titleObj[viewId];
    }

    // 5. [MOBILE-FRIENDLY] Tự động đóng Sidebar nếu đang dùng điện thoại
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-overlay');
    if (window.innerWidth < 1024) { // 1024px là mốc breakpoint 'lg' của Tailwind
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
};
// =================================================================
// 9. XỬ LÝ LƯU & CẬP NHẬT THÔNG TIN CÔNG TY
// =================================================================

// 9.1. Tự động load dữ liệu từ LocalStorage khi mở trang
document.addEventListener('DOMContentLoaded', () => {
    // Chỉ chạy nếu đang ở trang doanh nghiệp
    if (document.getElementById('form-company-settings')) {
        loadCompanyProfile();
    }
});

window.loadCompanyProfile = function() {
    const savedProfile = localStorage.getItem('companyProfile');
    if (savedProfile) {
        const data = JSON.parse(savedProfile);
        
        // Đổ dữ liệu vào Form
        if(document.getElementById('setting-company-name')) document.getElementById('setting-company-name').value = data.name || '';
        if(document.getElementById('setting-company-tax')) document.getElementById('setting-company-tax').value = data.tax || '';
        if(document.getElementById('setting-company-email')) document.getElementById('setting-company-email').value = data.email || '';
        if(document.getElementById('setting-company-phone')) document.getElementById('setting-company-phone').value = data.phone || '';
        if(document.getElementById('setting-company-address')) document.getElementById('setting-company-address').value = data.address || '';
        if(document.getElementById('setting-company-desc')) document.getElementById('setting-company-desc').value = data.desc || '';

        // Đổ tên công ty lên thanh Header
        const headerName = document.getElementById('header-company-name');
        if (headerName && data.name) {
            headerName.innerText = data.name;
        }
    }
};

// 9.2. Hàm lưu dữ liệu khi bấm nút "Lưu thay đổi"
window.updateCompanyProfile = async function(event) {
    event.preventDefault(); // Ngăn trình duyệt reload lại trang

    // Thu thập dữ liệu từ Form
    const data = {
        name: document.getElementById('setting-company-name').value.trim(),
        tax: document.getElementById('setting-company-tax').value.trim(),
        email: document.getElementById('setting-company-email').value.trim(),
        phone: document.getElementById('setting-company-phone').value.trim(),
        address: document.getElementById('setting-company-address').value.trim(),
        desc: document.getElementById('setting-company-desc').value.trim()
    };

    // ----------------------------------------------------
    // PHẦN 1: CẬP NHẬT LOCALSTORAGE (Chạy siêu tốc cho UI)
    // ----------------------------------------------------
    localStorage.setItem('companyProfile', JSON.stringify(data));
    
    // Cập nhật Header ngay lập tức
    const headerName = document.getElementById('header-company-name');
    if (headerName) headerName.innerText = data.name;

    alert('Đã lưu thông tin thành công!');

    // ----------------------------------------------------
    // PHẦN 2: CHUẨN BỊ FETCH API (Chờ Backend nối ống nước)
    // ----------------------------------------------------
    /*
    try {
        const response = await fetch("http://localhost:8080/api/company/update", {
            method: "PUT", // HTTP Method để cập nhật dữ liệu
            headers: {
                "Content-Type": "application/json",
                // "Authorization": "Bearer " + localStorage.getItem("token") // Bật lên khi có hệ thống Token
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log("Database Backend đã được cập nhật:", result);
        } else {
            console.error("Lỗi từ server Backend:", result.message);
        }
    } catch (error) {
        console.error("Lỗi kết nối đến Backend:", error);
    }
    */
};
// =================================================================
// 10. DỮ LIỆU GIẢ (MOCK DATA) & TÌM KIẾM TRANG CHỦ (INDEX.HTML)
// =================================================================

// Mảng 10 công việc (Đã thêm trường salarySort để sắp xếp và lọc bằng số)
window.mockJobs = [
    { 
        id: 1, 
        title: "Lập trình viên Frontend (ReactJS)", 
        company: "Công ty Cổ phần Công nghệ UTC", 
        salary: "15 - 25 Triệu", 
        salarySort: 15, 
        location: "Hà Nội", 
        logo: "https://via.placeholder.com/60", 
        tags: ["ReactJS", "Tailwind"],
        description: "<ul class='list-disc pl-5 space-y-1'><li>Tham gia phát triển các tính năng UI/UX cho nền tảng web nội bộ của UTC.</li><li>Phối hợp cùng team Backend để tích hợp RESTful API.</li><li>Tối ưu hóa hiệu năng, đảm bảo trang web chạy mượt mà trên mọi thiết bị.</li></ul>",
        requirements: "<ul class='list-disc pl-5 space-y-1'><li>Có ít nhất 1 năm kinh nghiệm thực chiến với ReactJS và TailwindCSS.</li><li>Nắm vững kiến thức nền tảng HTML, CSS, JavaScript (ES6+).</li><li>Ưu tiên sinh viên tốt nghiệp hoặc đang theo học tại UTC.</li></ul>",
        benefits: "<ul class='list-disc pl-5 space-y-1'><li>Mức lương cạnh tranh 15 - 25 triệu tùy năng lực.</li><li>Môi trường làm việc trẻ trung, năng động, sếp tâm lý.</li><li>Được cấp Macbook Pro M2 để làm việc.</li></ul>"
    },
    { 
        id: 2, 
        title: "Chuyên viên Phân tích Dữ liệu", 
        company: "Tập đoàn Tài chính Á Châu", 
        salary: "Lên đến $1000", 
        salarySort: 25, 
        location: "Hà Nội", 
        logo: "https://via.placeholder.com/60", 
        tags: ["SQL", "Python"],
        description: "<ul class='list-disc pl-5 space-y-1'><li>Thu thập, xử lý và phân tích dữ liệu giao dịch tài chính của khách hàng.</li><li>Xây dựng các báo cáo (Dashboard) trực quan bằng PowerBI hoặc Tableau.</li><li>Đề xuất các chiến lược kinh doanh dựa trên Insight số liệu.</li></ul>",
        requirements: "<ul class='list-disc pl-5 space-y-1'><li>Thành thạo truy vấn SQL và ngôn ngữ Python (Pandas, NumPy).</li><li>Tư duy logic tốt, nhạy bén với những con số.</li><li>Có kinh nghiệm trong lĩnh vực Tài chính - Ngân hàng là một lợi thế lớn.</li></ul>",
        benefits: "<ul class='list-disc pl-5 space-y-1'><li>Thu nhập lên đến $1000 + Thưởng hiệu suất (KPI) hàng tháng.</li><li>Gói bảo hiểm sức khỏe cao cấp cho bản thân và gia đình.</li><li>Lộ trình thăng tiến rõ ràng lên vị trí Data Scientist.</li></ul>"
    },
    { 
        id: 3, 
        title: "Nhân viên Thiết kế Đồ họa", 
        company: "Creative Agency VN", 
        salary: "Thỏa thuận", 
        salarySort: 10, 
        location: "Từ xa (Remote)", 
        logo: "https://via.placeholder.com/60", 
        tags: ["Figma", "Photoshop"],
        description: "<ul class='list-disc pl-5 space-y-1'><li>Thiết kế ấn phẩm truyền thông (Banner, Poster, Standee) cho các chiến dịch.</li><li>Lên ý tưởng và thiết kế bộ nhận diện thương hiệu cho đối tác.</li><li>Tham gia thiết kế giao diện UI cơ bản cho website/app khi cần.</li></ul>",
        requirements: "<ul class='list-disc pl-5 space-y-1'><li>Sử dụng thành thạo bộ công cụ Adobe (Photoshop, Illustrator) và Figma.</li><li>Có tư duy thẩm mỹ hiện đại, bắt trend tốt.</li><li>Có khả năng quản lý thời gian tốt vì làm việc 100% Remote.</li></ul>",
        benefits: "<ul class='list-disc pl-5 space-y-1'><li>Thời gian làm việc tự do, chỉ cần đảm bảo đúng Deadline.</li><li>Thưởng thêm theo từng dự án hoàn thành xuất sắc.</li><li>Được làm việc với các brand lớn, nâng cấp Portfolio cá nhân.</li></ul>"
    },
    { 
        id: 4, 
        title: "Nhân viên Đè tem", 
        company: "Công ty Cổ phần Mixifood", 
        salary: "Lên đến 2 hộp khô gà", 
        salarySort: 0, 
        location: "120 Yên Lãng", 
        logo: "./assets/mixifood.png", 
        tags: ["Khô gà", "Bã mía"],
        description: "<ul class='list-disc pl-5 space-y-1'><li>Ngồi dán tem, đè tem chính hãng lên các hộp khô gà, bò khô của công ty.</li><li>Đóng gói hàng hóa cẩn thận để gửi cho anh em Bộ tộc trên toàn quốc.</li><li>Hỗ trợ dọn dẹp kho bãi và xả bã mía đúng nơi quy định.</li></ul>",
        requirements: "<ul class='list-disc pl-5 space-y-1'><li>Tay to, thao tác nhanh nhẹn, mắt thâm quần (do thức đêm nịnh trên stream).</li><li>Tuyệt đối không được ăn vụng khô gà trong giờ làm việc.</li><li>Biết bợ là một lợi thế cực lớn khi phỏng vấn.</li></ul>",
        benefits: "<ul class='list-disc pl-5 space-y-1'><li>Lương thưởng quy đổi thành 2 hộp khô gà/tháng.</li><li>Được bao nuôi 3 bữa tại công ty, thỉnh thoảng được sếp cho ăn bã mía.</li><li>Môi trường tấu hài 24/7, xả stress cực mạnh.</li></ul>"
    },
    { 
        id: 5, 
        title: "Lập trình viên Backend (Java)", 
        company: "Techcombank", 
        salary: "20 - 30 Triệu", 
        salarySort: 20, 
        location: "TP.HCM", 
        logo: "https://via.placeholder.com/60", 
        tags: ["Java", "Spring Boot"],
        description: "<ul class='list-disc pl-5 space-y-1'><li>Xây dựng và phát triển hệ thống Core Banking và các dịch vụ thanh toán.</li><li>Thiết kế, tối ưu hóa database và hiệu năng của các RESTful API.</li><li>Đảm bảo tính bảo mật và toàn vẹn dữ liệu cho hàng triệu giao dịch mỗi ngày.</li></ul>",
        requirements: "<ul class='list-disc pl-5 space-y-1'><li>2+ năm kinh nghiệm làm việc với Java, Spring Boot, Hibernate.</li><li>Am hiểu kiến trúc Microservices và các hệ thống Message Queue (Kafka/RabbitMQ).</li><li>Hiểu biết sâu sắc về bảo mật ứng dụng web (OWASP).</li></ul>",
        benefits: "<ul class='list-disc pl-5 space-y-1'><li>Lương tháng 13, 14 và thưởng hiệu quả kinh doanh cuối năm.</li><li>Gói vay vốn mua nhà, mua xe với lãi suất cực kỳ ưu đãi cho nhân viên.</li><li>Chương trình đào tạo chuyên môn chuẩn quốc tế.</li></ul>"
    },
    { 
        id: 6, 
        title: "Chuyên viên Digital Marketing", 
        company: "MidCV Media", 
        salary: "12 - 18 Triệu", 
        salarySort: 12, 
        location: "Hà Nội", 
        logo: "https://via.placeholder.com/60", 
        tags: ["SEO", "Facebook Ads"],
        description: "<ul class='list-disc pl-5 space-y-1'><li>Lên kế hoạch và thực thi các chiến dịch quảng cáo trên Facebook, Google.</li><li>Tối ưu hóa SEO Onpage/Offpage cho nền tảng tuyển dụng MidCV.</li><li>Theo dõi, đo lường và báo cáo tỷ lệ chuyển đổi (Conversion Rate).</li></ul>",
        requirements: "<ul class='list-disc pl-5 space-y-1'><li>Có kinh nghiệm chạy quảng cáo ngân sách khá trở lên.</li><li>Am hiểu thuật toán của các công cụ tìm kiếm và mạng xã hội.</li><li>Kỹ năng viết content thu hút, tư duy hình ảnh tốt.</li></ul>",
        benefits: "<ul class='list-disc pl-5 space-y-1'><li>Ngân sách Marketing lớn, tha hồ A/B Testing các ý tưởng điên rồ nhất.</li><li>Du lịch công ty 2 lần/năm (Trong nước và Quốc tế).</li><li>Cơ chế thưởng nóng nếu chiến dịch vượt KPI.</li></ul>"
    },
    { 
        id: 7, 
        title: "Nhân viên Kiểm thử phần mềm (QA/QC)", 
        company: "FPT Software", 
        salary: "10 - 15 Triệu", 
        salarySort: 10, 
        location: "Đà Nẵng", 
        logo: "https://via.placeholder.com/60", 
        tags: ["Testing", "Automation"],
        description: "<ul class='list-disc pl-5 space-y-1'><li>Đọc hiểu tài liệu BA, lên kịch bản kiểm thử (Test Case) cho các dự án Outsource.</li><li>Thực hiện Manual Test và báo cáo bug qua hệ thống Jira.</li><li>Tham gia xây dựng các kịch bản Automation Test cơ bản.</li></ul>",
        requirements: "<ul class='list-disc pl-5 space-y-1'><li>Nắm vững quy trình phát triển phần mềm và các kỹ thuật testing.</li><li>Tính cách cẩn thận, tỉ mỉ, có tư duy 'phá bĩnh' để tìm ra lỗi ẩn.</li><li>Tiếng Anh đọc hiểu tài liệu tốt.</li></ul>",
        benefits: "<ul class='list-disc pl-5 space-y-1'><li>Cơ hội đi Onsite làm việc trực tiếp với khách hàng tại Nhật Bản/Mỹ.</li><li>Phụ cấp ngoại ngữ (Tiếng Anh/Tiếng Nhật) hàng tháng.</li><li>Campus làm việc siêu đẹp, có khu thể thao, gym, bể bơi riêng.</li></ul>"
    },
    { 
        id: 8, 
        title: "Kỹ sư DevOps System", 
        company: "VNG Corporation", 
        salary: "30 - 50 Triệu", 
        salarySort: 30, 
        location: "TP.HCM", 
        logo: "https://via.placeholder.com/60", 
        tags: ["AWS", "Docker", "CI/CD"],
        description: "<ul class='list-disc pl-5 space-y-1'><li>Thiết kế và vận hành hạ tầng Cloud (AWS/GCP) đáp ứng hàng triệu CCU.</li><li>Xây dựng và duy trì các luồng CI/CD tự động hóa việc deploy code.</li><li>Giám sát hệ thống (Monitoring), đảm bảo uptime 99.99%.</li></ul>",
        requirements: "<ul class='list-disc pl-5 space-y-1'><li>Kinh nghiệm sâu sắc với Linux, Docker, Kubernetes (K8s).</li><li>Thành thạo việc thiết lập CI/CD bằng Jenkins hoặc GitLab CI.</li><li>Khả năng xử lý sự cố (Troubleshooting) nhanh chóng dưới áp lực cao.</li></ul>",
        benefits: "<ul class='list-disc pl-5 space-y-1'><li>Gói thu nhập khủng, xứng đáng với năng lực chuyên gia.</li><li>Được cấp Stock Option (Cổ phiếu công ty) cho nhân sự cốt cán.</li><li>Chế độ chăm sóc sức khỏe toàn diện VNG Care.</li></ul>"
    },
    { 
        id: 9, 
        title: "Nhân viên IT Helpdesk", 
        company: "Bệnh viện Đa khoa", 
        salary: "7 - 10 Triệu", 
        salarySort: 7, 
        location: "Hà Nội", 
        logo: "https://via.placeholder.com/60", 
        tags: ["Phần cứng", "Mạng LAN"],
        description: "<ul class='list-disc pl-5 space-y-1'><li>Hỗ trợ bác sĩ, y tá cài đặt và khắc phục lỗi phần mềm quản lý bệnh viện.</li><li>Xử lý sự cố máy tính, máy in, mạng LAN tại các phòng ban.</li><li>Lắp đặt thiết bị IT mới và quản lý tài sản công nghệ của bệnh viện.</li></ul>",
        requirements: "<ul class='list-disc pl-5 space-y-1'><li>Am hiểu về phần cứng máy tính và hệ điều hành Windows.</li><li>Có kiến thức cơ bản về thiết lập mạng nội bộ (LAN/WAN).</li><li>Thái độ hòa nhã, kiên nhẫn khi hỗ trợ người dùng không chuyên IT.</li></ul>",
        benefits: "<ul class='list-disc pl-5 space-y-1'><li>Công việc ổn định, ít áp lực chạy deadline.</li><li>Chế độ khám chữa bệnh miễn phí/giảm giá cho bản thân và gia đình.</li><li>Tham gia đầy đủ bảo hiểm y tế, BHXH theo quy định nhà nước.</li></ul>"
    },
    { 
        id: 10, 
        title: "Giám đốc Sản phẩm (Product Manager)", 
        company: "VinAI", 
        salary: "40 - 60 Triệu", 
        salarySort: 40, 
        location: "Hà Nội", 
        logo: "https://via.placeholder.com/60", 
        tags: ["Agile", "Scrum", "Product"],
        description: "<ul class='list-disc pl-5 space-y-1'><li>Hoạch định chiến lược và roadmap phát triển các sản phẩm ứng dụng AI.</li><li>Quản lý Product Backlog, phối hợp chặt chẽ với team R&D và Engineering.</li><li>Nghiên cứu thị trường, thấu hiểu insight người dùng để định hướng sản phẩm.</li></ul>",
        requirements: "<ul class='list-disc pl-5 space-y-1'><li>Ít nhất 5 năm kinh nghiệm làm PO/PM cho các sản phẩm công nghệ.</li><li>Hiểu biết sâu sắc về quy trình Agile/Scrum.</li><li>Có kiến thức nền tảng về Trí tuệ nhân tạo (AI) / Machine Learning là một lợi thế cực lớn.</li></ul>",
        benefits: "<ul class='list-disc pl-5 space-y-1'><li>Mức lương cực kỳ hấp dẫn, tương xứng với vị trí lãnh đạo cấp trung.</li><li>Được làm việc trực tiếp với những chuyên gia AI hàng đầu thế giới.</li><li>Đặc quyền mua xe VinFast và sử dụng các dịch vụ hệ sinh thái Vingroup với giá nội bộ.</li></ul>"
    }
];

// Biến toàn cục cho Phân trang
let currentJobPage = 1;
const jobsPerPage = 20;

// Tự động in danh sách khi load xong trang chủ
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlKeyword = urlParams.get('keyword');
    const urlLocation = urlParams.get('location');

    const keywordInput = document.getElementById('search-keyword');
    const locationInput = document.getElementById('search-location');

    if (keywordInput && urlKeyword) keywordInput.value = urlKeyword;
    if (locationInput && urlLocation) locationInput.value = urlLocation;

    if (document.getElementById('job-list-container')) {
        if (keywordInput) {
            keywordInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
                        goToSearchPage(); 
                    } else {
                        searchJobs(1); 
                    }
                }
            });
            keywordInput.addEventListener('input', function() {
                if (keywordInput.value.trim() === '' && !window.location.pathname.includes('index.html')) {
                    searchJobs(1); 
                }
            });
        }
        if (locationInput) {
            locationInput.addEventListener('change', function() {
                if (!window.location.pathname.includes('index.html')) {
                    searchJobs(1); 
                }
            });
        }

        if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
            renderJobs(mockJobs.slice(0, 6), mockJobs.length); 
        } else {
            searchJobs(1); 
        }
    }
});

window.goToSearchPage = function() {
    const keywordInput = document.getElementById('search-keyword');
    const locationInput = document.getElementById('search-location');
    const keyword = keywordInput ? keywordInput.value.trim() : '';
    const location = locationInput ? locationInput.value : '';
    window.location.href = `listvieclam.html?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`;
};

// =================================================================
// 11. GATEKEEPER BẢO MẬT (KIỂM TRA ĐĂNG NHẬP TRƯỚC KHI XEM CHI TIẾT)
// =================================================================
window.viewJobDetail = function(jobId) {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        // Chưa đăng nhập -> Đá ra trang login
        alert('Bạn cần đăng nhập với tư cách Ứng viên để xem chi tiết và ứng tuyển công việc này!');
        window.location.href = 'login.html';
    } else {
        // Đã đăng nhập -> Cho vào xem chi tiết (Truyền ID công việc qua URL)
        window.location.href = `vieclam.html?id=${jobId}`;
    }
};

// =================================================================
// CẬP NHẬT HÀM RENDER ĐỂ GẮN GATEKEEPER VÀO SỰ KIỆN ONCLICK
// =================================================================
window.renderJobs = function(jobsToRender, totalMatches) {
    const container = document.getElementById('job-list-container');
    const resultCount = document.getElementById('result-count');
    if (!container) return;

    container.innerHTML = ''; 
    if (resultCount) resultCount.innerText = `${totalMatches} việc làm phù hợp`;

    if (jobsToRender.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500 font-medium">Không tìm thấy công việc nào phù hợp với tiêu chí của bạn.</div>';
        return;
    }

    jobsToRender.forEach(job => {
        const tagsHTML = job.tags.map(tag => `<span class="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded border border-blue-100">${tag}</span>`).join('');
        const jobCard = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-300 transition p-5 flex flex-col h-full">
                <div class="flex gap-4 mb-4">
                    <img src="${job.logo}" alt="Company Logo" class="w-16 h-16 rounded object-cover border bg-white p-1 shrink-0">
                    <div>
                        <h3 onclick="viewJobDetail(${job.id})" class="font-bold text-lg text-gray-900 hover:text-blue-600 cursor-pointer">${job.title}</h3>
                        <p class="text-sm text-gray-500">${job.company}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 mb-4">
                    <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">💰 ${job.salary}</span>
                    <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">📍 ${job.location}</span>
                </div>
                <div class="mt-auto flex gap-2 flex-wrap">
                    ${tagsHTML}
                </div>
            </div>
        `;
        container.innerHTML += jobCard;
    });
};

// Hàm Vẽ Nút Phân trang
window.renderPagination = function(totalJobs) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalJobs / jobsPerPage);
    
    if (totalPages <= 1) return; // Không cần phân trang nếu chỉ có 1 trang

    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentJobPage 
            ? "bg-blue-600 text-white font-bold border-blue-600 shadow-md" 
            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50";
            
        const btn = `<button onclick="searchJobs(${i})" class="w-10 h-10 flex items-center justify-center rounded-lg border transition ${activeClass}">${i}</button>`;
        paginationContainer.innerHTML += btn;
    }
};

// HÀM TÌM KIẾM, LỌC, SẮP XẾP VÀ PHÂN TRANG TỔNG HỢP
window.searchJobs = function(pageNumber = 1) {
    currentJobPage = pageNumber; // Cập nhật trang hiện tại

    const keywordInput = document.getElementById('search-keyword');
    const locationInput = document.getElementById('search-location');
    const sortInput = document.getElementById('sort-salary');
    
    if (!keywordInput || !locationInput) return;
    
    const keyword = keywordInput.value.toLowerCase().trim();
    const location = locationInput.value; 
    
    // 1. Lọc theo Từ khóa & Địa điểm
    let filteredJobs = mockJobs.filter(job => {
        const matchKeyword = job.title.toLowerCase().includes(keyword) || 
                             job.company.toLowerCase().includes(keyword) ||
                             job.tags.some(tag => tag.toLowerCase().includes(keyword));
        const matchLocation = location === "" || job.location.toLowerCase().includes(location.toLowerCase());
        return matchKeyword && matchLocation;
    });

    // 2. Lọc theo Mức lương (Cột bên trái)
    const filterUnder10 = document.getElementById('filter-salary-1')?.checked;
    const filter10to20 = document.getElementById('filter-salary-2')?.checked;
    const filterOver20 = document.getElementById('filter-salary-3')?.checked;

    if (filterUnder10 || filter10to20 || filterOver20) {
        filteredJobs = filteredJobs.filter(job => {
            // Mixifood lương 0 (Khô gà) -> Sẽ lọt vào "Dưới 10 triệu"
            if (filterUnder10 && job.salarySort < 10) return true;
            if (filter10to20 && job.salarySort >= 10 && job.salarySort <= 20) return true;
            if (filterOver20 && job.salarySort > 20) return true;
            return false;
        });
    }

    // 3. Sắp xếp (Sort)
    if (sortInput) {
        const sortMode = sortInput.value;
        if (sortMode === 'asc') {
            filteredJobs.sort((a, b) => a.salarySort - b.salarySort); // Tăng dần (Khô gà lên đỉnh)
        } else if (sortMode === 'desc') {
            filteredJobs.sort((a, b) => b.salarySort - a.salarySort); // Giảm dần (PM 60 củ lên đỉnh)
        }
    }

    // 4. Cắt mảng (Slice) để lấy đúng 20 việc cho trang hiện tại
    const totalMatches = filteredJobs.length;
    const startIndex = (currentJobPage - 1) * jobsPerPage;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);
    
    // 5. Render Giao diện
    renderJobs(paginatedJobs, totalMatches);
    renderPagination(totalMatches);
    
    // Cuộn lên đầu danh sách sau khi chuyển trang
    if (pageNumber > 1) {
        window.scrollTo({ top: document.getElementById('job-list-container').offsetTop - 100, behavior: 'smooth' });
    }
};
// Hàm đóng/mở Bộ lọc trên giao diện Điện thoại
window.toggleMobileFilter = function() {
    const filterSidebar = document.getElementById('filter-sidebar');
    if (filterSidebar) {
        // Lệnh toggle: Nếu đang ẩn thì hiện, đang hiện thì ẩn
        filterSidebar.classList.toggle('hidden');
    }
};
// =================================================================
// 12. XỬ LÝ TRANG CHI TIẾT VIỆC LÀM (VIECLAM.HTML)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Đã fix lỗi vòng lặp: Chỉ chạy khi tìm thấy ID 'detail-title' (Chỉ có ở trang Chi tiết)
    if (document.getElementById('detail-title')) {
        loadJobDetail();
    }
});

// Hàm lấy ID từ URL và đổ dữ liệu ra trang
window.loadJobDetail = function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // FIX TẠI ĐÂY 1: Bỏ hàm parseInt() để giữ nguyên dữ liệu Gốc
    const jobId = urlParams.get('id'); 

    if (!jobId) {
        window.location.href = 'index.html';
        return;
    }

    // FIX TẠI ĐÂY 2: Ép cả 2 bên về kiểu Chữ (String) để so sánh tuyệt đối chuẩn
    const job = window.mockJobs.find(j => String(j.id) === String(jobId));

    if (!job) {
        alert('Không tìm thấy công việc này!');
        window.location.href = 'listvieclam.html';
        return;
    }

    document.getElementById('detail-title').innerText = job.title;
    document.getElementById('detail-company').innerText = job.company;
    document.getElementById('detail-salary').innerText = job.salary;
    document.getElementById('detail-location').innerText = job.location;
    
    if(document.getElementById('detail-logo')) {
        document.getElementById('detail-logo').src = job.logo;
    }

    const tagsContainer = document.getElementById('detail-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = job.tags.map(tag => `<span class="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-lg border border-blue-100 font-medium">${tag}</span>`).join('');
    }
    
    document.getElementById('detail-description').innerHTML = job.description || 'Chưa có mô tả công việc.';
    document.getElementById('detail-requirements').innerHTML = job.requirements || 'Chưa có yêu cầu.';
    document.getElementById('detail-benefits').innerHTML = job.benefits || 'Chưa có thông tin phúc lợi.';

    // --- FIX LỖI TẠI ĐÂY: Dùng đúng chìa khóa (username/email) để kiểm tra trạng thái Nút Lưu ---
    let isSaved = false;
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        const user = JSON.parse(userStr);
        const storageKey = `savedJobs_${user.username || user.email || 'default'}`;
        const savedJobs = JSON.parse(localStorage.getItem(storageKey)) || [];
        isSaved = savedJobs.map(id => Number(id)).includes(Number(jobId));
    }
    
    // Vẽ nút đúng trạng thái ngay khi load trang
    updateSaveButtonUI(isSaved);
};

// Hàm xử lý nút Ứng tuyển & Lưu tin
window.handleJobAction = function(actionType) {
    const userStr = localStorage.getItem('currentUser');

    if (actionType === 'apply') {
        if (!userStr) {
            alert("Vui lòng đăng nhập để ứng tuyển!");
            window.location.href = 'login.html';
            return;
        }
        const modal = document.getElementById('apply-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    } else if (actionType === 'save') {
        // --- FIX LỖI TẠI ĐÂY: Đồng bộ logic lưu chuẩn chỉ ---
        if (!userStr) {
            alert("Vui lòng đăng nhập để lưu việc làm!");
            window.location.href = 'login.html';
            return;
        }

        const user = JSON.parse(userStr);
        const storageKey = `savedJobs_${user.username || user.email || 'default'}`; 
        
        const urlParams = new URLSearchParams(window.location.search);
        const currentJobId = Number(urlParams.get('id'));

        if (!currentJobId) return;

        let savedJobs = JSON.parse(localStorage.getItem(storageKey)) || [];
        savedJobs = savedJobs.map(id => Number(id)); // Ép kiểu số

        if (!savedJobs.includes(currentJobId)) {
            // Chưa lưu -> Tiến hành Lưu và Cập nhật Nút
            savedJobs.push(currentJobId);
            localStorage.setItem(storageKey, JSON.stringify(savedJobs));
            updateSaveButtonUI(true);
            alert("🎉 Đã lưu việc làm thành công! Hãy vào Hồ sơ để kiểm tra.");
        } else {
            // Đã lưu -> Bấm cái nữa là Xóa (Bỏ lưu) và Cập nhật Nút
            savedJobs = savedJobs.filter(id => id !== currentJobId);
            localStorage.setItem(storageKey, JSON.stringify(savedJobs));
            updateSaveButtonUI(false);
        }
    }
};

// Hàm đóng Popup
window.closeApplyModal = function() {
    const modal = document.getElementById('apply-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

// Hàm Giả lập Submit CV & Lưu vào Database (Bản hợp nhất)
window.submitApplication = function(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault(); 
    }
    
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        alert("Vui lòng đăng nhập để ứng tuyển!");
        return;
    }
    const user = JSON.parse(userStr);

    // 1. KIỂM TRA ĐÃ CHỌN HOẶC TẢI CV LÊN CHƯA (Logic chuyển từ vieclam.html sang)
    const cvSelect = document.getElementById("cv-select");
    const fileInput = document.getElementById("cv-upload");
    const selectedCV = cvSelect ? cvSelect.value : null;
    const uploadedFile = fileInput && fileInput.files ? fileInput.files[0] : null;

    if (!selectedCV && !uploadedFile) {
        alert("⚠️ Vui lòng chọn CV đã lưu hoặc tải lên CV mới để ứng tuyển!");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    let jobId = Number(urlParams.get('id'));
    if (!jobId) jobId = 1; // Mặc định ID nếu mở file trực tiếp không có tham số

    // Hiệu ứng nút bấm đang xoay
    const btn = document.querySelector('button[onclick="submitApplication()"]');
    let originalText = 'Nộp CV Ứng Tuyển';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Đang gửi CV...`;
        btn.disabled = true;
        btn.classList.add('opacity-70', 'cursor-not-allowed');
    }

    setTimeout(() => {
        // --- LOGIC LƯU ĐƠN ỨNG TUYỂN VÀO HỆ THỐNG ---
        let applications = JSON.parse(localStorage.getItem('user_applications')) || [];
        
        // Kiểm tra xem ứng viên đã nộp job này chưa (chống spam nộp nhiều lần)
        const existingApp = applications.find(a => a.userId === user.username && a.jobId === jobId);

        if (!existingApp) {
            applications.push({
                id: Date.now(),
                userId: user.username,
                jobId: jobId,
                status: 'pending', // Mặc định là đang chờ Nhà tuyển dụng duyệt
                date: new Date().toLocaleDateString('vi-VN')
            });
            localStorage.setItem('user_applications', JSON.stringify(applications));
            
            // Nếu người dùng tải file mới, hỏi xem có muốn lưu vào kho CV không
            if (uploadedFile) {
                if (confirm("🎉 CV của bạn đã nộp thành công!\n\nBạn có muốn lưu CV này vào Hồ sơ để dùng cho các lần sau không?")) {
                    if (typeof window.saveCV === 'function') window.saveCV(uploadedFile);
                }
            } else {
                alert('🎉 Chúc mừng! CV của bạn đã được gửi tới Nhà tuyển dụng thành công!');
            }
        } else {
            alert('⚠️ Bạn đã nộp CV cho công việc này rồi! Vui lòng chờ Nhà tuyển dụng phản hồi.');
        }

        if (typeof window.closeApplyModal === 'function') window.closeApplyModal();
        
        // Trả lại nút bấm
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    }, 1500);
};
// =================================================================
// 13. XỬ LÝ MODAL BÁO CÁO TIN GIẢ MẠO
// =================================================================

window.openReportModal = function() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Bạn cần đăng nhập để sử dụng tính năng Báo cáo!');
        window.location.href = 'login.html';
        return;
    }
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeReportModal = function() {
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.submitReport = function(event) {
    event.preventDefault();
    
    // --- 1. LẤY THÔNG TIN NGƯỜI GỬI ---
    const userStr = localStorage.getItem('currentUser');
    let senderName = "Người dùng ẩn danh";
    if (userStr) {
        const user = JSON.parse(userStr);
        senderName = user.fullName || user.username;
    }

    // --- 2. LẤY LÝ DO BÁO CÁO (ĐÃ FIX LỖI "ON") ---
    let reportReason = "Có hành vi vi phạm quy định"; 
    const radios = document.querySelectorAll('input[name="report_reason"]:checked');
    
    if (radios.length > 0) {
        let val = radios[0].value;
        // Nếu value trả về 'on' (do HTML thiếu thuộc tính value), ta móc text từ thẻ span bên cạnh
        if (val === 'on' || !val) {
            val = radios[0].nextElementSibling ? radios[0].nextElementSibling.textContent.trim() : "Vi phạm quy định";
        }
        reportReason = val;
    }

    // Bổ sung lấy nội dung từ ô nhập chi tiết (Textarea)
    const textarea = document.querySelector('#report-modal textarea'); 
    if (textarea && textarea.value.trim()) {
        if (reportReason === "Lý do khác") {
            reportReason = textarea.value.trim(); // Nếu chọn Lý do khác thì lấy luôn text
        } else {
            reportReason += " - Chi tiết: " + textarea.value.trim(); // Nối thêm chi tiết
        }
    }

    // --- 3. ĐÓNG GÓI & LƯU BÁO CÁO ---
    const newReport = {
        id: Date.now(),
        sender: senderName,
        reason: reportReason,
        date: new Date().toLocaleString('vi-VN'),
        isChecked: false // Mặc định báo cáo mới là chưa xử lý (Chờ xử lý)
    };

    let reports = JSON.parse(localStorage.getItem('user_reports')) || [];
    reports.unshift(newReport); 
    localStorage.setItem('user_reports', JSON.stringify(reports));

    // --- 4. XỬ LÝ GIAO DIỆN NÚT BẤM ---
    const btn = document.getElementById('submit-report-btn');
    let originalText = "Gửi báo cáo";
    
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = `<svg class="animate-spin h-4 w-4 mr-2 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Đang gửi...`;
        btn.disabled = true;
        btn.classList.add('opacity-70', 'cursor-not-allowed');
    }

    setTimeout(() => {
        alert('Cảm ơn bạn! Báo cáo đã được gửi đến Ban Quản Trị MidCV để xem xét xử lý.');
        if (typeof closeReportModal === 'function') closeReportModal();
        
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
        
        if (typeof loadAdminReports === 'function') loadAdminReports();
    }, 1000);
};
// Hàm vẽ lại UI cho nút Lưu tin
window.updateSaveButtonUI = function(isSaved) {
    const btn = document.getElementById('save-job-btn');
    if (!btn) return;

    if (isSaved) {
        // Trạng thái: Đã lưu (Trái tim đậm, chữ Đã lưu, nền xanh nhạt)
        btn.innerHTML = `
            <svg class="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            <span>Đã lưu</span>
        `;
        btn.classList.add('bg-blue-50');
        btn.classList.remove('bg-white');
    } else {
        // Trạng thái: Chưa lưu (Trái tim rỗng, chữ Lưu tin, nền trắng)
        btn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            <span>Lưu tin</span>
        `;
        btn.classList.add('bg-white');
        btn.classList.remove('bg-blue-50');
    }
};
// =================================================================
// 14. ĐỒNG BỘ AVATAR VÀ TÊN USER LÊN HEADER TOÀN CỤC
// =================================================================

window.syncUserHeader = function() {
    try {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) return; // Nếu chưa đăng nhập thì bỏ qua

        const user = JSON.parse(userStr);
        const headerAvatar = document.getElementById('header-avatar');
        
        // Các thẻ nằm trong Dropdown mới
        const dropdownAvatar = document.getElementById('dropdown-avatar');
        const dropdownName = document.getElementById('dropdown-name');
        const dropdownEmail = document.getElementById('dropdown-email');

        const displayName = user.fullName || user.username || 'Người dùng';

        // 1. Cập nhật Tên và Email trong Dropdown
        if (dropdownName) dropdownName.textContent = displayName;
        if (dropdownEmail) {
            dropdownEmail.textContent = user.email || user.username;
            dropdownEmail.style.display = 'block'; // Reset trạng thái hiển thị
        }

        // 2. Cập nhật Avatar
        if (user.avatar && user.avatar.startsWith('data:image')) {
            if (headerAvatar) headerAvatar.src = user.avatar;
            if (dropdownAvatar) dropdownAvatar.src = user.avatar;
        }

        // 3. LOGIC BIẾN HÌNH MENU DROPDOWN DÀNH RIÊNG CHO ADMIN
        if (user.username === 'admin' && dropdownName) {
            // Đổi danh xưng cực ngầu
            dropdownName.textContent = "ADMIN";
            
            // Ẩn hoàn toàn dòng Email cho gọn gàng
            if (dropdownEmail) dropdownEmail.style.display = 'none';

            // Tìm khu vực chứa các đường link menu
            const linksContainer = dropdownName.closest('#dropdown-menu').querySelector('.p-2:not(.border-t)');
            if (linksContainer) {
                // Ẩn nút "Việc làm đã lưu" đi
                const savedJobsLink = linksContainer.querySelector('a[href*="tab=saved"]');
                if (savedJobsLink) savedJobsLink.style.display = 'none';

                // Kiểm tra xem đã chèn nút Admin chưa (để tránh bị nhân bản khi F5)
                if (!document.getElementById('admin-dashboard-btn')) {
                    const adminBtnHtml = `
                        <a id="admin-dashboard-btn" href="admin.html" class="flex items-center gap-3 px-3 py-2.5 mb-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition font-bold border border-blue-200 shadow-sm">
                            <i class="fas fa-shield-alt w-5 text-center text-lg"></i> Bảng điều khiển Admin
                        </a>
                    `;
                    // Dùng afterbegin để NHÉT NÚT NÀY LÊN ĐỈNH CỦA DANH SÁCH MENU
                    linksContainer.insertAdjacentHTML('afterbegin', adminBtnHtml);
                }
            }
        }
    } catch (e) {
        console.error("Lỗi đồng bộ Header:", e);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    syncUserHeader();
});
// =================================================================
// 15. TÍNH NĂNG SẮP XẾP CÔNG TY
// =================================================================
window.sortCompanies = function() {
    const select = document.getElementById('sort-company');
    const companyList = document.getElementById('company-list');
    
    if (!select || !companyList) return;

    const sortType = select.value;
    // Lấy tất cả các thẻ công ty biến thành 1 mảng (Array) để dễ sắp xếp
    const cards = Array.from(companyList.children);

    cards.sort((a, b) => {
        // Đọc dữ liệu từ data- attributes
        const jobsA = parseInt(a.dataset.jobs || 0);
        const jobsB = parseInt(b.dataset.jobs || 0);
        const folA = parseInt(a.dataset.followers || 0);
        const folB = parseInt(b.dataset.followers || 0);
        const featA = parseInt(a.dataset.featured || 0);
        const featB = parseInt(b.dataset.featured || 0);

        if (sortType === 'featured') {
            // 1. Ưu tiên công ty Nổi bật (1) lên trước (0)
            if (featA !== featB) return featB - featA;
            // 2. Nếu cùng nổi bật thì ai nhiều Follow hơn xếp trên
            return folB - folA;
        } 
        else if (sortType === 'jobs') {
            return jobsB - jobsA; // Nhiều job nhất lên đầu
        } 
        else if (sortType === 'followers') {
            return folB - folA; // Nhiều người theo dõi nhất lên đầu
        }
        return 0;
    });

    // Xóa danh sách cũ đi và nhét danh sách đã được sắp xếp lại vào
    companyList.innerHTML = '';
    cards.forEach(card => companyList.appendChild(card));
};

// Tự động chạy sắp xếp lần đầu khi vừa vào trang List Công ty
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('congty.html')) {
        setTimeout(sortCompanies, 50); // Đợi giao diện load xong rồi tự động sort
    }
});
// =================================================================
// 16. CHI TIẾT CÔNG TY (BƠM DỮ LIỆU ĐỘNG TỪ URL)
// =================================================================

// 1. Dữ liệu giả lập của 3 công ty (Giống DB Backend)
window.mockCompaniesDB = [
    {
        id: 1, name: "Công ty Cổ phần Mixifood", logo: "./assets/mixifood.png", cover: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", industry: "Thực phẩm / F&B", size: "50 - 100 nhân viên", website: "https://mixifood.com", address: "Tầng 5, Tòa nhà Mixi, P. Yên Hòa, Cầu Giấy, Hà Nội", about: "<p>Mixifood là thương hiệu đồ ăn vặt hàng đầu Việt Nam, được sáng lập bởi Tộc trưởng Độ Mixi. Chúng tôi chuyên cung cấp các sản phẩm chất lượng cao như khô gà lá chanh, khô bò, lạp xưởng...</p><p>Môi trường làm việc năng động, trẻ trung và thường xuyên có các hoạt động teambuilding.</p>"
    },
    {
        id: 2, name: "Đại học Giao thông Vận tải (UTC)", logo: "https://via.placeholder.com/150/2563eb/ffffff?text=UTC", cover: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", industry: "Giáo dục / IT", size: "1000+ nhân viên", website: "https://utc.edu.vn", address: "Số 3 phố Cầu Giấy, P.Láng Thượng, Q.Đống Đa, Hà Nội", about: "<p>Trường Đại học Giao thông Vận tải là trường đại học đa ngành về kỹ thuật, công nghệ và kinh tế. Đặc biệt, khoa Công nghệ Thông tin đang đóng vai trò mũi nhọn trong việc cung ứng nhân sự chất lượng cao.</p>"
    },
    {
        id: 3, name: "VNG Corporation", logo: "https://via.placeholder.com/150/f97316/ffffff?text=VNG", cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", industry: "Game / IT", size: "3000+ nhân viên", website: "https://vng.com.vn", address: "Z06 Đường số 13, P. Tân Thuận Đông, Quận 7, TP.HCM", about: "<p>Kỳ lân công nghệ đầu tiên của Việt Nam. Chúng tôi kiến tạo những sản phẩm công nghệ thay đổi cuộc sống của hàng triệu người dùng thông qua Game, ZaloPay, VNG Cloud...</p>"
    }
];

window.loadCompanyDetail = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = parseInt(urlParams.get('id'));

    if (!companyId) return;

    const companyData = mockCompaniesDB.find(c => c.id === companyId);
    
    if (companyData) {
        document.title = `${companyData.name} - MidCV`;
        if(document.getElementById('detail-company-name')) document.getElementById('detail-company-name').textContent = companyData.name;
        if(document.getElementById('detail-company-logo')) document.getElementById('detail-company-logo').src = companyData.logo;
        if(document.getElementById('detail-company-cover')) document.getElementById('detail-company-cover').src = companyData.cover;
        if(document.getElementById('detail-company-industry')) document.getElementById('detail-company-industry').textContent = companyData.industry;
        if(document.getElementById('detail-company-size')) document.getElementById('detail-company-size').textContent = companyData.size;
        
        const webLink = document.getElementById('detail-company-website');
        if(webLink) {
            webLink.href = companyData.website;
            webLink.textContent = companyData.website.replace('https://', '');
        }

        if(document.getElementById('detail-company-address')) document.getElementById('detail-company-address').textContent = companyData.address;
        if(document.getElementById('detail-company-about')) document.getElementById('detail-company-about').innerHTML = companyData.about;
        
        // Đã xóa hoàn toàn đoạn vẽ Việc làm bị lỗi ở đây!
    } else {
        if(document.getElementById('detail-company-name')) document.getElementById('detail-company-name').textContent = "Không tìm thấy Công ty";
    }
};

// =================================================================
// 17. LÔ-GIC DÀNH RIÊNG CHO TRANG HỒ SƠ ỨNG VIÊN (USERUI.HTML)
// =================================================================
// (Đoạn này tôi giữ nguyên trạng thái chuẩn chỉ của bạn)
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('userui.html')) return;

    const DEFAULT_AVATAR = './assets/logouser.png';

    function loadUser() { try { return JSON.parse(localStorage.getItem('currentUser')); } catch { return null; } }
    
    function saveUser(data) {
        try {
            const current = loadUser() || {};
            const updatedUser = { ...current, ...data };
            
            // Lưu thông tin mới nhất vào phiên đăng nhập hiện tại
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.username === current.username);
            if (userIndex !== -1) {
                users[userIndex] = updatedUser;
                localStorage.setItem('users', JSON.stringify(users));
            }
            if (typeof window.syncUserHeader === 'function') window.syncUserHeader();
        } catch {}
    }

    function initProfile() {
        const user = loadUser();
        if (!user) { window.location.href = 'login.html'; return; }
        const displayName = user.fullName || user.username || 'Người dùng';
        const safeSet = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
        
        safeSet('name', displayName); safeSet('phone', user.phone || ''); safeSet('email', user.email || '');
        safeSet('bio', user.bio || ''); safeSet('education', user.education || ''); safeSet('skills', user.skills || '');
        
        const dispName = document.getElementById('display-name'); 
        if(dispName) dispName.textContent = displayName;
        
        const avatarEl = document.getElementById('avatarPreview');
        if (avatarEl) avatarEl.src = (user.avatar && user.avatar.startsWith('data:image')) ? user.avatar : DEFAULT_AVATAR;

        // ==========================================
        // DỌN DẸP GIAO DIỆN HỒ SƠ NẾU LÀ ADMIN
        // ==========================================
        if (user.username === 'admin') {
            // 1. Đổi danh xưng
            if(dispName) dispName.textContent = displayName + ' (ADMIN)';
            const roleText = document.querySelector('.user-role');
            if(roleText) roleText.textContent = 'Quản trị viên Hệ thống';

            // 2. Ẩn các Tab Menu không dành cho Admin
            const hiddenTabs = ['nav-facebook', 'nav-linkedin', 'nav-saved', 'nav-followed'];
            hiddenTabs.forEach(tabId => {
                const el = document.getElementById(tabId);
                if (el) el.style.display = 'none';
            });

            // Ẩn bớt các đường kẻ ngang (hr) trên menu cho đỡ trống
            const dividers = document.querySelectorAll('.side-nav div[style*="border-top"]');
            if(dividers.length > 0) dividers[0].style.display = 'none';

            // 3. ẨN CÁC Ô NHẬP LIỆU THỪA THÃI CỦA ỨNG VIÊN
            const candidateFields = ['phone', 'education', 'skills'];
            candidateFields.forEach(id => {
                const inputEl = document.getElementById(id);
                if (inputEl) {
                    // Tìm thẻ cha bọc ngoài (div.form-group) và giấu nó đi
                    const formGroup = inputEl.closest('.form-group');
                    if (formGroup) formGroup.style.display = 'none';
                }
            });

            // 4. "Độ" lại ô Giới thiệu bản thân cho ngầu hơn
            const bioInput = document.getElementById('bio');
            if (bioInput) {
                const bioLabel = bioInput.closest('.form-group').querySelector('label');
                if (bioLabel) bioLabel.innerText = 'Thông điệp / Chữ ký Admin';
                bioInput.placeholder = 'Nhập thông điệp hiển thị khi bình luận...';
            }
        }
    }

    window.switchPanel = function(name) {
        ['info','facebook','linkedin', 'saved', 'settings'].forEach(p => {
            const panel = document.getElementById('panel-' + p); const nav = document.getElementById('nav-' + p);
            if(panel) panel.classList.add('hidden-btn'); if(nav) nav.classList.remove('active');
        });
        const activePanel = document.getElementById('panel-' + name); const activeNav = document.getElementById('nav-' + name);
        if(activePanel) activePanel.classList.remove('hidden-btn'); if(activeNav) activeNav.classList.add('active');
        window.history.replaceState(null, '', `?tab=${name}`);
        if(name === 'saved' && typeof window.loadSavedJobs === 'function') window.loadSavedJobs();
    };

    initProfile();
    const urlParams = new URLSearchParams(window.location.search);
    switchPanel(urlParams.get('tab') || 'info');

    const form = document.getElementById('profileForm');
    const editableFields = document.querySelectorAll('#name, #email, #phone, #bio, #education, #skills');
    const avatarPreview = document.getElementById('avatarPreview');
    let originalData = {}, originalAvatar = '';

    window.showToast = function(msg = "Thành công!") {
        const toast = document.getElementById('toast'); if(!toast) return;
        toast.innerHTML = `<i class="fas fa-check-circle" style="margin-right:7px;"></i>${msg}`;
        toast.style.display = 'block'; setTimeout(() => { toast.style.display = 'none'; }, 2500);
    };

    function setEditMode(isEditing) {
        editableFields.forEach(f => { if (isEditing) f.removeAttribute('readonly'); else f.setAttribute('readonly', true); });
        const avatarContainer = document.getElementById('avatarContainer');
        if(avatarContainer) avatarContainer.classList.toggle('editable', isEditing);
        ['editBtn', 'saveBtn', 'cancelBtn'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.toggle('hidden-btn', id === 'editBtn' ? isEditing : !isEditing);
        });
        const rmAvatar = document.getElementById('removeAvatarBtn');
        if(rmAvatar) rmAvatar.classList.toggle('hidden', !isEditing);
    }

    const editBtn = document.getElementById('editBtn');
    if(editBtn) editBtn.addEventListener('click', () => {
        editableFields.forEach(f => { originalData[f.id] = f.value; });
        if(avatarPreview) originalAvatar = avatarPreview.src;
        setEditMode(true); document.getElementById('name').focus();
    });

    const cancelBtn = document.getElementById('cancelBtn');
    if(cancelBtn) cancelBtn.addEventListener('click', () => {
        editableFields.forEach(f => { f.value = originalData[f.id]; });
        if(avatarPreview) avatarPreview.src = originalAvatar.startsWith('data:image') ? originalAvatar : DEFAULT_AVATAR;
        setEditMode(false);
    });

    const avatarInput = document.getElementById('avatarInput');
    if(avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader(); reader.onload = ev => { avatarPreview.src = ev.target.result; };
            reader.readAsDataURL(file);
        });
    }

    const rmAvatarBtn = document.getElementById('removeAvatarBtn');
    if(rmAvatarBtn && avatarPreview) {
        rmAvatarBtn.addEventListener('click', () => {
            avatarPreview.src = DEFAULT_AVATAR; saveUser({ avatar: '' }); window.showToast('Đã xóa ảnh đại diện');
        });
    }

    if(form) form.addEventListener('submit', (e) => {
        e.preventDefault();
        const updated = {
            fullName: document.getElementById('name').value, email: document.getElementById('email').value,
            phone: document.getElementById('phone').value, bio: document.getElementById('bio').value,
            education: document.getElementById('education').value, skills: document.getElementById('skills').value,
        };
        if (avatarPreview && avatarPreview.src.startsWith('data:image')) updated.avatar = avatarPreview.src;
        saveUser(updated);
        const dispName = document.getElementById('display-name'); if(dispName) dispName.textContent = updated.fullName || 'Người dùng';
        setEditMode(false); window.showToast('Đã cập nhật Hồ sơ!');
    });

    window.saveSettings = function() {
        const newPassEl = document.getElementById('new-password'); if(!newPassEl) return;
        if(newPassEl.value) { saveUser({ password: newPassEl.value }); newPassEl.value = ''; window.showToast('Đã cập nhật Mật khẩu!'); } 
        else window.showToast('Không có thay đổi nào được lưu.');
    };
});

// =================================================================
// 19. MOCK DATA & LOGIC "LƯU VIỆC LÀM" (CHUẨN CHỈ)
// =================================================================

window.saveJobToLocal = function(jobId) {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) { alert("Vui lòng Đăng nhập để lưu việc làm!"); window.location.href = 'login.html'; return; }
    const user = JSON.parse(userStr);
    const storageKey = `savedJobs_${user.username || user.email || 'default'}`;
    let savedIds = JSON.parse(localStorage.getItem(storageKey)) || [];
    savedIds = savedIds.map(id => Number(id)); const numJobId = Number(jobId);
    if (!savedIds.includes(numJobId)) {
        savedIds.push(numJobId); localStorage.setItem(storageKey, JSON.stringify(savedIds));
        if (window.location.pathname.includes('userui.html') && typeof window.loadSavedJobs === 'function') window.loadSavedJobs();
        else alert("🎉 Đã lưu việc làm thành công! Hãy vào Hồ sơ để kiểm tra.");
    } else alert("⚠️ Việc làm này đã được bạn lưu từ trước rồi!");
};

window.loadSavedJobs = function() {
    const userStr = localStorage.getItem('currentUser'); if (!userStr) return;
    const user = JSON.parse(userStr); const container = document.getElementById('saved-jobs-container'); if(!container) return;
    const storageKey = `savedJobs_${user.username || user.email || 'default'}`;
    let savedIds = JSON.parse(localStorage.getItem(storageKey)) || [];
    savedIds = savedIds.map(id => Number(id));
    if (savedIds.length === 0) { container.innerHTML = '<div class="text-center py-10 text-gray-500 bg-gray-50 border border-gray-100 rounded-lg">Bạn chưa lưu công việc nào.</div>'; return; }
    if (typeof window.mockJobs === 'undefined') return;
    const jobsToRender = window.mockJobs.filter(j => savedIds.includes(Number(j.id)));
    container.innerHTML = jobsToRender.map(job => `
        <div class="border border-gray-200 rounded-xl p-4 flex items-start gap-4 hover:border-blue-300 hover:shadow-md transition bg-white relative group">
            <img src="${job.logo}" class="w-14 h-14 object-contain border border-gray-100 rounded-lg bg-white p-1 shrink-0">
            <div class="flex-1">
                <a href="vieclam.html?id=${job.id}" class="font-bold text-gray-900 text-lg hover:text-blue-600 transition block mb-1 pr-20">${job.title}</a>
                <p class="text-sm text-gray-500 mb-2">${job.company}</p>
                <div class="flex gap-2 text-xs font-medium">
                    <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded">💰 ${job.salary}</span>
                    <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded">📍 ${job.location}</span>
                </div>
            </div>
            <button onclick="removeSavedJob(${job.id})" class="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition" title="Bỏ lưu"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
};

window.removeSavedJob = function(jobId) {
    const userStr = localStorage.getItem('currentUser'); if (!userStr) return;
    const user = JSON.parse(userStr); const storageKey = `savedJobs_${user.username || user.email || 'default'}`;
    let savedIds = JSON.parse(localStorage.getItem(storageKey)) || [];
    savedIds = savedIds.map(id => Number(id)); const numJobId = Number(jobId);
    savedIds = savedIds.filter(id => id !== numJobId); localStorage.setItem(storageKey, JSON.stringify(savedIds));
    if (typeof window.showToast === 'function') window.showToast('Đã xóa việc làm khỏi danh sách!');
    window.loadSavedJobs(); 
};

// =================================================================
// 20. XỬ LÝ TRANG CHI TIẾT CÔNG TY (CONGTY.HTML)
// =================================================================

window.loadCompanyJobs = function() {
    const container = document.getElementById('detail-company-jobs');
    if (!container) return;
    if (typeof window.mockJobs === 'undefined') return;

    // Dùng setTimeout để đợi loadCompanyDetail vẽ xong tên công ty lên giao diện
    setTimeout(() => {
        const companyNameEl = document.getElementById('detail-company-name');
        const companyName = companyNameEl ? companyNameEl.innerText.trim() : '';
        
        // Tìm kiếm các job có tên công ty khớp với nhau
        let companyJobs = window.mockJobs.filter(j => {
            const jName = j.company.toLowerCase();
            const cName = companyName.toLowerCase();
            // Lọc linh hoạt (Ví dụ: "UTC" khớp với "Công ty Cổ phần Công nghệ UTC")
            return jName.includes(cName) || cName.includes(jName) || 
                   (cName.includes("utc") && jName.includes("utc")) || 
                   (cName.includes("mixi") && jName.includes("mixi"));
        });
        
        if (companyJobs.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm italic py-4">Công ty này hiện chưa có vị trí tuyển dụng nào đang mở.</p>';
            return;
        }

        // Vẽ danh sách việc làm CHUẨN trực tiếp vào HTML (KHÔNG CẦN HÀM PHỤ)
        container.innerHTML = companyJobs.map(job => `
            <a href="vieclam.html?id=${job.id}" class="block border border-gray-100 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition bg-gray-50 hover:bg-white group">
                <h3 class="font-bold text-gray-900 group-hover:text-blue-600 transition">${job.title}</h3>
                <div class="flex items-center gap-4 mt-2 text-sm">
                    <span class="text-blue-600 font-bold">${job.salary}</span>
                    <span class="text-gray-500">• ${job.location}</span>
                </div>
            </a>
        `).join('');
    }, 100); // Trì hoãn 0.1 giây để đảm bảo DOM đã cập nhật
};

// Khởi chạy cả 2 hàm đồng thời khi vào trang Công ty
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('congty.html') && !window.location.pathname.includes('listcongty.html')) {
        loadCompanyDetail();
        loadCompanyJobs();
    }
});
// =================================================================
// 21. QUẢN LÝ CÔNG VIỆC ĐÃ ỨNG TUYỂN (USER)
// =================================================================
window.loadAppliedJobs = function() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const container = document.getElementById('applied-jobs-container');
    if(!container) return;

    // Lấy danh sách CV đã nộp của User này
    const applications = JSON.parse(localStorage.getItem('user_applications')) || [];
    const myApps = applications.filter(a => a.userId === user.username);

    if (myApps.length === 0) {
        container.innerHTML = '<div class="text-center py-10 text-gray-500 bg-gray-50 border border-gray-100 rounded-lg">Bạn chưa ứng tuyển công việc nào.</div>';
        return;
    }

    if (typeof window.mockJobs === 'undefined') return;

    // Sắp xếp đơn mới nhất lên đầu
    myApps.sort((a, b) => b.id - a.id);

    container.innerHTML = myApps.map(app => {
        const job = window.mockJobs.find(j => j.id === app.jobId);
        if (!job) return ''; 

        // THANH TRẠNG THÁI
        let statusHtml = '';
        let statusClass = '';
        let actionBtns = ''; // Biến chứa nút bấm

        if (app.status === 'approved') {
            statusHtml = '<i class="fas fa-check-circle mr-1"></i> CV Đã được duyệt';
            statusClass = 'bg-green-100 text-green-700 border-green-200';
        } else if (app.status === 'rejected') {
            statusHtml = '<i class="fas fa-times-circle mr-1"></i> Bị từ chối';
            statusClass = 'bg-red-100 text-red-700 border-red-200';
        } else {
            statusHtml = '<i class="fas fa-clock mr-1"></i> Đang chờ duyệt';
            statusClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
            
            // CHỈ KHI "CHỜ DUYỆT" MỚI HIỆN NÚT RÚT & SỬA CV
            actionBtns = `
                <div class="mt-3 flex gap-2 justify-start sm:justify-end">
                    <button onclick="updateApplication(${app.id}, ${job.id})" class="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold transition"><i class="fas fa-sync-alt mr-1"></i> Nộp lại CV</button>
                    <button onclick="withdrawApplication(${app.id})" class="text-xs px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg font-bold transition"><i class="fas fa-trash-alt mr-1"></i> Rút hồ sơ</button>
                </div>
            `;
        }

        return `
        <div class="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition bg-white flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <img src="${job.logo}" class="w-16 h-16 object-contain border border-gray-100 rounded-lg bg-white p-1 shrink-0">
            <div class="flex-1 w-full">
                <a href="vieclam.html?id=${job.id}" class="font-bold text-gray-900 text-lg hover:text-blue-600 transition block mb-1 truncate">${job.title}</a>
                <p class="text-sm text-gray-500 mb-3 truncate">${job.company}</p>
                <div class="flex flex-wrap gap-2 text-xs font-medium mb-3">
                    <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded">💰 ${job.salary}</span>
                    <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded">📍 ${job.location}</span>
                </div>
                <div class="text-xs text-gray-400"><i class="fas fa-calendar-alt mr-1"></i> Ứng tuyển ngày: ${app.date}</div>
            </div>
            <div class="w-full sm:w-auto text-left sm:text-right mt-2 sm:mt-0 shrink-0">
                <div class="inline-block px-3 py-1.5 rounded-lg border font-bold text-sm ${statusClass} w-full text-center sm:w-auto">
                    ${statusHtml}
                </div>
                ${actionBtns}
            </div>
        </div>`;
    }).join('');
};

// --- HÀM RÚT HỒ SƠ (XÓA BỎ) ---
window.withdrawApplication = function(appId) {
    if (!confirm('⚠️ Bạn có chắc chắn muốn rút lại CV? Nhà tuyển dụng sẽ không còn thấy hồ sơ của bạn cho vị trí này nữa.')) return;
    
    let applications = JSON.parse(localStorage.getItem('user_applications')) || [];
    // Lọc bỏ đơn ứng tuyển có ID tương ứng
    applications = applications.filter(a => a.id !== appId);
    localStorage.setItem('user_applications', JSON.stringify(applications));
    
    alert('✅ Đã rút hồ sơ thành công!');
    loadAppliedJobs(); // Load lại giao diện ngay lập tức
};

// --- HÀM NỘP LẠI CV (CHỈNH SỬA) ---
window.updateApplication = function(appId, jobId) {
    if (!confirm('💡 Để nộp lại CV mới, hệ thống sẽ hủy đơn ứng tuyển hiện tại và chuyển bạn đến trang Công việc để chọn lại file CV. Bạn có đồng ý không?')) return;
    
    // 1. Âm thầm xóa đơn cũ
    let applications = JSON.parse(localStorage.getItem('user_applications')) || [];
    applications = applications.filter(a => a.id !== appId);
    localStorage.setItem('user_applications', JSON.stringify(applications));
    
    // 2. Chở người dùng về lại trang Job để họ bấm nộp lại
    window.location.href = `vieclam.html?id=${jobId}`;
};

// =================================================================
// 22. LOGIC ĐÁNH GIÁ CÔNG TY (REVIEW - CÓ QUYỀN CHÍNH CHỦ)
// =================================================================

// Biến toàn cục để biết ta đang "Sửa" hay "Viết mới" (-1 nghĩa là viết mới)
window.editingReviewIndex = -1;

window.selectStar = function(rating) {
    const ratingInput = document.getElementById('input-rating-val');
    if(ratingInput) ratingInput.value = rating;

    const container = document.getElementById('star-rating-select');
    if(!container) return;
    const stars = container.children;

    for(let i = 0; i < 5; i++) {
        if (i < rating) {
            stars[i].classList.add('text-amber-400');
            stars[i].classList.remove('text-gray-300');
        } else {
            stars[i].classList.add('text-gray-300');
            stars[i].classList.remove('text-amber-400');
        }
    }
};

window.submitReview = function(event) {
    event.preventDefault(); 
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        alert("Bạn cần đăng nhập để viết đánh giá!");
        window.location.href = 'login.html';
        return;
    }
    const user = JSON.parse(userStr);
    const ratingInput = document.getElementById('input-rating-val');
    const contentInput = document.getElementById('input-review-content');
    if (!ratingInput || !contentInput) return;

    const rating = ratingInput.value;
    const content = contentInput.value;

    if (Number(rating) === 0) { alert("⭐ Vui lòng chọn số sao trước khi gửi!"); return; }
    if (!content.trim()) { alert("📝 Vui lòng nhập nội dung đánh giá!"); return; }

    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id');
    if (!companyId) return;

    const storageKey = `reviews_company_${companyId}`;
    let reviews = JSON.parse(localStorage.getItem(storageKey)) || [];

    // --- KIỂM TRA XEM ĐANG SỬA HAY VIẾT MỚI ---
    if (window.editingReviewIndex >= 0) {
        // CẬP NHẬT BÌNH LUẬN CŨ
        reviews[window.editingReviewIndex].rating = Number(rating);
        reviews[window.editingReviewIndex].content = content.trim();
        reviews[window.editingReviewIndex].date = new Date().toLocaleDateString('vi-VN') + " (Đã sửa)";
        
        alert("🎉 Đã cập nhật đánh giá thành công!");
        window.editingReviewIndex = -1; // Reset trạng thái về Viết mới
        const submitBtn = document.querySelector('#input-review-content').closest('form').querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.innerText = "Gửi đánh giá"; // Trả lại tên nút
    } else {
        // VIẾT BÌNH LUẬN MỚI
        const reviewObj = {
            username: user.username, // LƯU THÊM USERNAME ĐỂ LÀM CHÌA KHÓA CHÍNH CHỦ
            name: user.fullName || user.username || "Người dùng MidCV",
            avatar: (user.avatar && user.avatar.startsWith('data:image')) ? user.avatar : './assets/logouser.png',
            rating: Number(rating),
            content: content.trim(),
            date: new Date().toLocaleDateString('vi-VN')
        };
        reviews.unshift(reviewObj); 
        alert("🎉 Đánh giá của bạn đã được đăng công khai!");
    }

    localStorage.setItem(storageKey, JSON.stringify(reviews));

    contentInput.value = ''; 
    window.selectStar(0); 
    window.loadCompanyReviews();
};

window.loadCompanyReviews = function() {
    const container = document.getElementById('company-reviews-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id');
    const storageKey = `reviews_company_${companyId}`;
    let reviews = JSON.parse(localStorage.getItem(storageKey)) || [];

    // Lấy thông tin người đang xem trang để đối chiếu
    const userStr = localStorage.getItem('currentUser');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (reviews.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm italic">Chưa có đánh giá nào cho công ty này. Hãy là người đầu tiên!</p>';
        return;
    }

    container.innerHTML = reviews.map((r, index) => {
        const starsHtml = Array(5).fill(0).map((_, i) => `<i class="fas fa-star ${i < r.rating ? 'text-amber-400' : 'text-gray-300'}"></i>`).join('');
        
        // --- LOGIC PHÂN QUYỀN: CHỈ HIỆN NÚT SỬA/XÓA NẾU KHỚP USERNAME ---
        const isOwner = currentUser && r.username === currentUser.username;
        const actionButtons = isOwner ? `
            <div class="flex gap-4 mt-3 text-xs font-medium">
                <button onclick="editReview(${index})" class="text-blue-500 hover:text-blue-700 transition flex items-center gap-1"><i class="fas fa-edit"></i> Sửa</button>
                <button onclick="deleteReview(${index})" class="text-red-500 hover:text-red-700 transition flex items-center gap-1"><i class="fas fa-trash"></i> Xóa</button>
            </div>
        ` : '';

        return `
        <div class="border-b border-gray-100 pb-4 last:border-0 last:pb-0 animate-fade-in relative group">
            <div class="flex items-center gap-3 mb-2">
                <img src="${r.avatar}" class="w-10 h-10 rounded-full object-cover border border-gray-200">
                <div>
                    <h5 class="font-bold text-gray-800 text-sm">${r.name}</h5>
                    <div class="flex items-center gap-2">
                        <div class="text-xs">${starsHtml}</div>
                        <span class="text-[11px] text-gray-400">${r.date}</span>
                    </div>
                </div>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed">${r.content}</p>
            ${actionButtons}
        </div>`;
    }).join('');
};

// --- HÀM XÓA BÌNH LUẬN ---
window.deleteReview = function(index) {
    if(!confirm("⚠️ Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.")) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id');
    const storageKey = `reviews_company_${companyId}`;
    let reviews = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    reviews.splice(index, 1); // Cắt bỏ 1 phần tử tại vị trí index
    localStorage.setItem(storageKey, JSON.stringify(reviews));
    window.loadCompanyReviews(); // Render lại danh sách
};
function handleCreateCV(event) {
    event.preventDefault();

    const user = localStorage.getItem("currentUser"); // ✅ sửa ở đây

    if (!user) {
        window.location.href = "login.html";
    } else {
        window.location.href = "taoCV.html";
    }
}

// --- HÀM SỬA BÌNH LUẬN ---
window.editReview = function(index) {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id');
    const storageKey = `reviews_company_${companyId}`;
    let reviews = JSON.parse(localStorage.getItem(storageKey)) || [];
    const r = reviews[index];

    // Bật trạng thái Sửa
    window.editingReviewIndex = index;
    
    // Đổ dữ liệu cũ vào Form
    window.selectStar(r.rating);
    const contentInput = document.getElementById('input-review-content');
    contentInput.value = r.content;
    
    // Đổi chữ nút bấm
    const submitBtn = contentInput.closest('form').querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.innerText = "Cập nhật đánh giá";

    // Tự động cuộn màn hình xuống chỗ Form và Focus con trỏ chuột vào khung gõ
    contentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    contentInput.focus();
};

// BỔ SUNG GỌI HÀM VÀO SỰ KIỆN KHỞI TẠO CHUNG
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.switchPanel !== 'undefined') {
        const oldSwitch = window.switchPanel;
        window.switchPanel = function(name) {
            // FIX TẠI ĐÂY: Đổi 'followed' thành 'applied'
            ['info','facebook','linkedin', 'saved', 'settings', 'applied'].forEach(p => {
                const panel = document.getElementById('panel-' + p);
                const nav = document.getElementById('nav-' + p);
                if(panel) panel.classList.add('hidden-btn');
                if(nav) nav.classList.remove('active');
            });
            const activePanel = document.getElementById('panel-' + name);
            const activeNav = document.getElementById('nav-' + name);
            if(activePanel) activePanel.classList.remove('hidden-btn');
            if(activeNav) activeNav.classList.add('active');
            window.history.replaceState(null, '', `?tab=${name}`);
            
            if(name === 'saved' && typeof window.loadSavedJobs === 'function') window.loadSavedJobs();
            // FIX TẠI ĐÂY: Trỏ sang hàm mới
            if(name === 'applied' && typeof window.loadAppliedJobs === 'function') window.loadAppliedJobs();
        };
    }

    if (window.location.pathname.includes('congty.html') && !window.location.pathname.includes('listcongty.html')) {
        setTimeout(() => {
            checkFollowStatus();
            loadCompanyReviews();
        }, 200);
    }
});
// =================================================================
// 23. XỬ LÝ PHÂN TRANG VÀ RENDER DANH SÁCH CÔNG TY (LISTCONGTY.HTML)
// =================================================================

let currentCompPage = 1;
const compsPerPage = 6; // Một trang hiển thị tối đa 6 công ty

window.renderCompanyList = function(page = 1) {
    const container = document.getElementById('company-list-container');
    const paginationContainer = document.getElementById('company-pagination');
    
    // Nếu không có container hoặc chưa có data thì dừng lại
    if (!container || typeof window.mockCompaniesDB === 'undefined') return;

    currentCompPage = page;
    const totalCompanies = window.mockCompaniesDB.length;
    
    // 1. Tính toán vị trí cắt mảng dữ liệu
    const startIndex = (currentCompPage - 1) * compsPerPage;
    const endIndex = startIndex + compsPerPage;
    const compsToShow = window.mockCompaniesDB.slice(startIndex, endIndex);

    // Xử lý khi không có công ty nào (VD: Admin xóa hết)
    if (compsToShow.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500">Chưa có công ty nào trên hệ thống.</p>';
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    // 2. Vẽ danh sách Công ty
    container.innerHTML = compsToShow.map(comp => {
        const jobCount = comp.jobs ? comp.jobs.length : Math.floor(Math.random() * 10) + 1;
        const followers = (Math.random() * 50).toFixed(1) + "K";
        
        return `
        <a href="congty.html?id=${comp.id}" class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-300 transition overflow-hidden flex flex-col group relative cursor-pointer block">
            <div class="h-24 bg-gradient-to-r from-blue-700 to-blue-500 relative">
                <div class="absolute -bottom-8 left-6 w-16 h-16 bg-white rounded-lg p-1 shadow-md border border-gray-100 flex items-center justify-center">
                    <img src="${comp.logo}" alt="Logo" class="w-full h-full object-contain rounded">
                </div>
            </div>
            <div class="pt-10 px-6 pb-6 flex flex-col flex-grow">
                <h3 class="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition">${comp.name}</h3>
                <p class="text-sm text-gray-500 mb-4 line-clamp-2">${comp.about.replace(/<[^>]*>/g, '').substring(0, 100)}...</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">${comp.industry}</span>
                </div>
                <div class="mt-auto border-t border-gray-50 pt-5">
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex flex-col">
                            <span class="text-lg font-black text-blue-600 leading-none">${jobCount}</span>
                            <span class="text-xs text-gray-500 mt-1 font-medium">Việc làm</span>
                        </div>
                        <div class="w-px h-8 bg-gray-200"></div>
                        <div class="flex flex-col text-right">
                            <span class="text-lg font-black text-gray-700 leading-none">${followers}</span>
                            <span class="text-xs text-gray-500 mt-1 font-medium">Followers</span>
                        </div>
                    </div>
                    <div class="w-full text-sm font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition py-2.5 rounded-lg flex items-center justify-center gap-2 border border-transparent">
                        Xem chi tiết
                    </div>
                </div>
            </div>
        </a>`;
    }).join('');

    // 3. Vẽ bộ nút Phân trang
    if (paginationContainer) {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalCompanies / compsPerPage);
        
        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentCompPage;
            const btnClass = isActive 
                ? "bg-blue-600 text-white font-bold border-blue-600 shadow-md" 
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50";
                
            paginationContainer.innerHTML += `
                <button onclick="renderCompanyList(${i})" class="w-10 h-10 flex items-center justify-center rounded-lg border transition ${btnClass}">${i}</button>
            `;
        }
    }
};

// Kích hoạt khi load trang listcongty.html
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('listcongty.html')) {
        renderCompanyList(1);
    }
});

// =================================================================
// 24. LÔ-GIC DÀNH RIÊNG CHO TRANG ADMIN (ADMIN.HTML)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('admin.html')) return;

    const userStr = localStorage.getItem('currentUser');
    if (!userStr || JSON.parse(userStr).username !== 'admin') {
        alert("Truy cập bị từ chối! Tài khoản của bạn không có quyền Quản trị viên.");
        window.location.href = 'index.html';
        return;
    }

    window.switchAdminTab = function(tabName) {
        document.querySelectorAll('.admin-tab').forEach(t => {
            t.classList.remove('bg-blue-600', 'text-white');
            t.classList.add('text-gray-400', 'hover:bg-gray-800', 'hover:text-white');
        });
        const activeTab = document.getElementById('tab-' + tabName);
        if(activeTab) {
            activeTab.classList.remove('text-gray-400', 'hover:bg-gray-800', 'hover:text-white');
            activeTab.classList.add('bg-blue-600', 'text-white');
        }

        document.querySelectorAll('.admin-panel').forEach(p => p.classList.add('hidden'));
        document.getElementById('panel-' + tabName).classList.remove('hidden');

        const titles = { 
            'dashboard': 'Tổng quan hệ thống', 'users': 'Quản lý Người dùng', 
            'companies': 'Quản lý Công ty', 'jobs': 'Kiểm duyệt Việc làm',
            'reports': 'Quản lý Báo cáo' // Thêm title Báo cáo
        };
        document.getElementById('admin-page-title').innerText = titles[tabName];

        if (tabName === 'dashboard') loadAdminDashboard();
        if (tabName === 'users') loadAdminUsers();
        if (tabName === 'companies') loadAdminCompanies();
        if (tabName === 'jobs') loadAdminJobs();
        if (tabName === 'reports') loadAdminReports(); // Load báo cáo
    };

    // =========================================================
    // 4. MODULE BÁO CÁO (TÌM KIẾM THEO NGƯỜI GỬI & SẮP XẾP)
    // =========================================================
    window.sortAdminReports = function(col) {
        if (adminFilters.reports.sortCol === col) adminFilters.reports.sortDir = adminFilters.reports.sortDir === 'asc' ? 'desc' : 'asc';
        else { adminFilters.reports.sortCol = col; adminFilters.reports.sortDir = 'asc'; }
        loadAdminReports();
    };

    window.loadAdminReports = function() {
        let reports = JSON.parse(localStorage.getItem('user_reports')) || [];
        const tbody = document.getElementById('admin-reports-tbody');
        if(!tbody) return;

        // TÌM KIẾM (Chỉ tìm theo tên Người gửi)
        const keyword = (document.getElementById('search-admin-reports')?.value || '').toLowerCase().trim();
        if (keyword) {
            reports = reports.filter(r => (r.sender || '').toLowerCase().includes(keyword));
        }

        // SẮP XẾP
        const { sortCol, sortDir } = adminFilters.reports;
        if (sortCol) {
            reports.sort((a, b) => {
                let valA, valB;
                if (sortCol === 'sender') { valA = (a.sender || '').toLowerCase(); valB = (b.sender || '').toLowerCase(); }
                else if (sortCol === 'reason') { valA = (a.reason || '').toLowerCase(); valB = (b.reason || '').toLowerCase(); }
                else if (sortCol === 'status') { valA = a.isChecked ? 1 : 0; valB = b.isChecked ? 1 : 0; }
                // Đặc biệt: Sắp xếp theo Thời gian ta lấy luôn ID vì ID chính là Date.now() lúc gửi
                else if (sortCol === 'date') { valA = a.id; valB = b.id; }

                if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        updateSortUI('reports', sortCol, sortDir);

        if(reports.length === 0) return tbody.innerHTML = '<tr><td colspan="5" class="py-10 text-center text-gray-500 font-medium">Không tìm thấy báo cáo nào khớp với tên người gửi.</td></tr>';

        tbody.innerHTML = reports.map(r => {
            const statusHtml = r.isChecked 
                ? `<span class="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded"><i class="fas fa-check-circle"></i> Đã xử lý</span>`
                : `<span class="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded"><i class="fas fa-clock"></i> Chờ xử lý</span>`;
            
            const actionBtn = r.isChecked
                ? `<button onclick="toggleReportStatus(${r.id})" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-3 py-1 rounded transition" title="Đánh dấu chưa xử lý"><i class="fas fa-undo"></i></button>`
                : `<button onclick="toggleReportStatus(${r.id})" class="text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1 rounded transition" title="Đánh dấu đã xử lý"><i class="fas fa-check"></i></button>`;

            return `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                <td class="py-3 px-6 font-bold text-gray-800">${r.sender}</td>
                <td class="py-3 px-6 text-gray-600 truncate max-w-[200px]" title="${r.reason}">${r.reason}</td>
                <td class="py-3 px-6 text-sm text-gray-500">${r.date}</td>
                <td class="py-3 px-6 text-center">${statusHtml}</td>
                <td class="py-3 px-6 text-center">
                    <button onclick="previewReport(${r.id})" class="text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded transition mr-2" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
                    ${actionBtn}
                    <button onclick="deleteReport(${r.id})" class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition ml-2" title="Xóa báo cáo"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
            `;
        }).join('');
    };

    // --- HÀM ĐÁNH DẤU XỬ LÝ ---
    window.toggleReportStatus = function(id) {
        let reports = JSON.parse(localStorage.getItem('user_reports')) || [];
        const index = reports.findIndex(r => r.id === id);
        if (index !== -1) {
            reports[index].isChecked = !reports[index].isChecked; // Đảo ngược trạng thái
            localStorage.setItem('user_reports', JSON.stringify(reports));
            loadAdminReports(); // Load lại bảng
        }
    };

    // --- HÀM XÓA BÁO CÁO ---
    window.deleteReport = function(id) {
        if (!confirm("⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn báo cáo này khỏi hệ thống?")) return;
        let reports = JSON.parse(localStorage.getItem('user_reports')) || [];
        reports = reports.filter(r => r.id !== id);
        localStorage.setItem('user_reports', JSON.stringify(reports));
        loadAdminReports();
    };

    // --- HÀM XEM TRƯỚC BÁO CÁO (Dùng chung Modal) ---
    window.previewReport = function(id) {
        const reports = JSON.parse(localStorage.getItem('user_reports')) || [];
        const r = reports.find(x => x.id === id);
        if (!r) return alert("Không tìm thấy dữ liệu báo cáo!");

        // Hack nhẹ đổi tiêu đề của cái Popup cho hợp cảnh
        const modalTitle = document.querySelector('#admin-preview-modal h3');
        if(modalTitle) modalTitle.innerHTML = '<i class="fas fa-flag text-red-500 mr-2"></i> Chi tiết Báo cáo / Khiếu nại';

        const contentDiv = document.getElementById('admin-preview-content');
        
        const statusHtml = r.isChecked 
            ? `<span class="text-sm bg-green-100 text-green-700 font-bold px-4 py-2 rounded-lg border border-green-200"><i class="fas fa-check-circle"></i> Đã xử lý</span>`
            : `<span class="text-sm bg-yellow-100 text-yellow-700 font-bold px-4 py-2 rounded-lg border border-yellow-200"><i class="fas fa-clock"></i> Chờ xử lý</span>`;

        contentDiv.innerHTML = `
            <div class="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <p class="text-xs text-gray-500 font-bold uppercase mb-1">Mã hệ thống</p>
                    <p class="font-black text-gray-800 text-lg">#REP-${r.id}</p>
                </div>
                ${statusHtml}
            </div>
            
            <div class="space-y-4 text-sm text-gray-800">
                <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 flex justify-between items-center">
                    <div>
                        <p class="text-xs text-gray-500 font-bold uppercase mb-1">Người gửi báo cáo</p>
                        <p class="font-black text-lg text-blue-700"><i class="fas fa-user-shield mr-1"></i> ${r.sender}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500 font-bold uppercase mb-1">Thời gian ghi nhận</p>
                        <p class="font-medium text-gray-700">${r.date}</p>
                    </div>
                </div>
                
                <div class="bg-red-50 p-6 rounded-xl border border-red-200">
                    <p class="text-sm text-red-500 font-black uppercase mb-3 flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> Nội dung / Lý do vi phạm</p>
                    <p class="leading-relaxed whitespace-pre-line text-red-900 font-medium text-base">${r.reason}</p>
                </div>
            </div>
        `;

        document.getElementById('admin-preview-modal').classList.remove('hidden');
    };

    window.deleteUser = function(index) {
        if (!confirm("⚠️ Chắc chắn muốn xóa tài khoản này?")) return;
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        loadAdminUsers(); loadAdminDashboard();
    };

// --- HÀM PHỤ TRỢ ADMIN (ĐÃ FIX LỖI ĐỒNG BỘ) ---
    function getActiveCompanies() { return window.mockCompaniesDB || []; }
    function getActiveJobs() { return window.mockJobs || []; }

    function loadAdminDashboard() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const comps = getActiveCompanies();
        const jobs = getActiveJobs();
        if(document.getElementById('stat-users')) document.getElementById('stat-users').innerText = users.length;
        if(document.getElementById('stat-companies')) document.getElementById('stat-companies').innerText = comps.length;
        if(document.getElementById('stat-jobs')) document.getElementById('stat-jobs').innerText = jobs.length;

        // KÍCH HOẠT VẼ BIỂU ĐỒ
        renderAdminCharts(jobs);
    }

    // Biến lưu trữ đồ thị để chống lỗi ghi đè (Memory Leak)
    window.userChartInstance = null;

    function renderAdminCharts(jobs) {
        const ctxUser = document.getElementById('userGrowthChart');
        if (!ctxUser) return;

        // =========================================================
        // 1. BIỂU ĐỒ ĐƯỜNG: HOẠT ĐỘNG 7 NGÀY QUA (DỮ LIỆU THẬT)
        // =========================================================
        const last7Days = [];
        const jobsCount = [0, 0, 0, 0, 0, 0, 0];
        const compsCount = [0, 0, 0, 0, 0, 0, 0];
        
        // Tạo mảng 7 ngày gần nhất (Định dạng: Ngày/Tháng)
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push(`${d.getDate()}/${d.getMonth() + 1}`);
        }

        // Đếm số Việc làm tạo trong 7 ngày
        const customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
        customJobs.forEach(j => {
            if (j.id) {
                const jd = new Date(j.id);
                const dateStr = `${jd.getDate()}/${jd.getMonth() + 1}`;
                const idx = last7Days.indexOf(dateStr);
                if (idx !== -1) jobsCount[idx]++;
            }
        });

        // Đếm số Công ty tạo trong 7 ngày
        const customComps = JSON.parse(localStorage.getItem('custom_companies')) || [];
        customComps.forEach(c => {
            if (c.id) {
                const cd = new Date(c.id);
                const dateStr = `${cd.getDate()}/${cd.getMonth() + 1}`;
                const idx = last7Days.indexOf(dateStr);
                if (idx !== -1) compsCount[idx]++;
            }
        });

        if (window.userChartInstance) window.userChartInstance.destroy();
        window.userChartInstance = new Chart(ctxUser, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [
                    {
                        label: 'Tin tuyển dụng mới',
                        data: jobsCount,
                        borderColor: '#2563eb', // Blue-600
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        tension: 0.4, fill: true
                    },
                    {
                        label: 'Hồ sơ Công ty mới',
                        data: compsCount,
                        borderColor: '#10b981', // Green-500
                        backgroundColor: 'transparent',
                        borderDash: [5, 5], tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
        
        // Đã gỡ bỏ toàn bộ logic Biểu đồ tròn và quét Tag ở đây!
    }

    // --- LÕI TÌM KIẾM & SẮP XẾP TOÀN CỤC CHO ADMIN ---
    window.adminFilters = {
        users: { sortCol: '', sortDir: 'asc' },
        comps: { sortCol: '', sortDir: 'asc' },
        jobs: { sortCol: '', sortDir: 'asc' },
        reports: { sortCol: '', sortDir: 'asc' }
    };

    window.updateSortUI = function(panelId, sortCol, sortDir) {
        const ths = document.querySelectorAll(`#panel-${panelId} th[data-sort]`);
        ths.forEach(th => {
            const icon = th.querySelector('i');
            if(icon) {
                if (th.getAttribute('data-sort') === sortCol) {
                    icon.className = sortDir === 'asc' ? 'fas fa-sort-up ml-1 text-blue-600' : 'fas fa-sort-down ml-1 text-blue-600';
                } else {
                    icon.className = 'fas fa-sort ml-1 text-gray-400 group-hover:text-gray-600 transition';
                }
            }
        });
    };

    // =========================================================
    // 1. MODULE NGƯỜI DÙNG (CÓ TÍNH NĂNG KHÓA TÀI KHOẢN)
    // =========================================================
    window.sortAdminUsers = function(col) {
        if (adminFilters.users.sortCol === col) adminFilters.users.sortDir = adminFilters.users.sortDir === 'asc' ? 'desc' : 'asc';
        else { adminFilters.users.sortCol = col; adminFilters.users.sortDir = 'asc'; }
        loadAdminUsers();
    };

    window.loadAdminUsers = function() {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const tbody = document.getElementById('admin-users-tbody');
        if(!tbody) return;

        // TÌM KIẾM
        const keyword = (document.getElementById('search-admin-users')?.value || '').toLowerCase().trim();
        if (keyword) {
            users = users.filter(u => 
                (u.fullName || '').toLowerCase().includes(keyword) || 
                (u.email || '').toLowerCase().includes(keyword) ||
                (u.username || '').toLowerCase().includes(keyword)
            );
        }

        // SẮP XẾP
        const { sortCol, sortDir } = adminFilters.users;
        if (sortCol) {
            users.sort((a, b) => {
                let valA = '', valB = '';
                if (sortCol === 'name') { valA = (a.fullName || '').toLowerCase(); valB = (b.fullName || '').toLowerCase(); }
                else if (sortCol === 'email') { valA = (a.email || a.username || '').toLowerCase(); valB = (b.email || b.username || '').toLowerCase(); }
                else if (sortCol === 'type') { valA = a.type || 'candidate'; valB = b.type || 'candidate'; }
                if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        updateSortUI('users', sortCol, sortDir);

        if(users.length === 0) return tbody.innerHTML = '<tr><td colspan="4" class="text-center py-10 text-gray-500 font-medium">Không tìm thấy tài khoản nào.</td></tr>';
        
        tbody.innerHTML = users.map(u => {
            // Vẽ Badge Phân quyền
            let roleBadge = u.username === 'admin' ? '<span class="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-200"><i class="fas fa-shield-alt mr-1"></i> Quản trị viên</span>' : 
                            (u.type === 'employer' ? '<span class="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-200"><i class="fas fa-building mr-1"></i> Doanh nghiệp</span>' : 
                            '<span class="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200"><i class="fas fa-user mr-1"></i> Ứng viên</span>');
            
            // Nếu bị khóa, gắn thêm thẻ Đỏ cạch mặt
            if (u.isBanned) {
                roleBadge += `<br><span class="inline-block mt-2 bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold border border-red-200 uppercase tracking-wider"><i class="fas fa-lock mr-1"></i> Bị khóa</span>`;
            }

            let displayEmail = u.email || (u.username !== 'admin' ? u.username : '');
            
            // LOGIC NÚT BẤM (KHÓA / MỞ KHÓA)
            let actionBtns = '';
            if (u.username === 'admin') {
                actionBtns = `<button disabled class="text-gray-300 cursor-not-allowed px-3 py-1 rounded"><i class="fas fa-ban"></i></button>`;
            } else if (u.isBanned) {
                actionBtns = `<button onclick="unbanUser('${u.username}')" class="text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-2 rounded-lg transition font-bold text-xs border border-green-200" title="Mở khóa tài khoản"><i class="fas fa-unlock mr-1"></i> Khôi phục</button>`;
            } else {
                actionBtns = `<button onclick="banUser('${u.username}')" class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition font-bold text-xs border border-red-200" title="Khóa tài khoản"><i class="fas fa-ban mr-1"></i> Khóa</button>`;
            }

            return `<tr class="border-b border-gray-100 hover:bg-gray-50 transition"><td class="py-4 px-6 leading-relaxed">${roleBadge}</td><td class="py-4 px-6 font-bold text-gray-800">${u.fullName || 'Chưa cập nhật'}</td><td class="py-4 px-6 text-gray-600">${displayEmail}</td><td class="py-4 px-6 text-center">${actionBtns}</td></tr>`;
        }).join('');
    };

    // --- HÀM KHÓA TÀI KHOẢN (BAN) ---
    window.banUser = function(username) {
        // Dùng luôn prompt mặc định của trình duyệt cho tốc độ bàn thờ, đỡ phải vẽ Modal HTML
        const reason = prompt(`⚠️ Nhập lý do khóa tài khoản [${username}] (Người dùng sẽ nhìn thấy khi cố đăng nhập):`);
        if (!reason) return; // Nếu ấn Hủy hoặc để trống thì không khóa

        let allUsers = JSON.parse(localStorage.getItem('users')) || [];
        const idx = allUsers.findIndex(u => u.username === username);
        if (idx !== -1) {
            allUsers[idx].isBanned = true;
            allUsers[idx].banReason = reason;
            localStorage.setItem('users', JSON.stringify(allUsers));
            loadAdminUsers();
            alert(`✅ Đã khóa tài khoản ${username} thành công!`);
        }
    };

    // --- HÀM KHÔI PHỤC TÀI KHOẢN (UNBAN) ---
    window.unbanUser = function(username) {
        if (!confirm(`✅ Bạn có chắc chắn muốn mở khóa cho tài khoản [${username}]?`)) return;

        let allUsers = JSON.parse(localStorage.getItem('users')) || [];
        const idx = allUsers.findIndex(u => u.username === username);
        if (idx !== -1) {
            allUsers[idx].isBanned = false;
            delete allUsers[idx].banReason; // Xóa sổ lý do vi phạm
            localStorage.setItem('users', JSON.stringify(allUsers));
            loadAdminUsers();
        }
    };

    // =========================================================
    // 2. MODULE CÔNG TY (TÌM KIẾM & SẮP XẾP THEO TRẠNG THÁI)
    // =========================================================
    window.sortAdminComps = function(col) {
        if (adminFilters.comps.sortCol === col) adminFilters.comps.sortDir = adminFilters.comps.sortDir === 'asc' ? 'desc' : 'asc';
        else { adminFilters.comps.sortCol = col; adminFilters.comps.sortDir = 'asc'; }
        loadAdminCompanies();
    };

    window.loadAdminCompanies = function() {
        let comps = getActiveCompanies();
        const tbody = document.getElementById('admin-companies-tbody');
        if(!tbody) return;

        const approvedComps = JSON.parse(localStorage.getItem('admin_approved_comps')) || [];
        const deletedComps = JSON.parse(localStorage.getItem('admin_deleted_comps')) || [];
        const customComps = JSON.parse(localStorage.getItem('custom_companies')) || [];

        // Tiền xử lý dữ liệu để lấy Trạng thái & Owner Email
        comps = comps.map(c => {
            const isUserCreated = customComps.some(cc => cc.id === c.id);
            const isApproved = approvedComps.includes(c.id) || !isUserCreated;
            const isRejected = deletedComps.includes(c.id);
            const compCustomData = customComps.find(cc => cc.id === c.id);
            const hasPendingUpdate = compCustomData && compCustomData.pendingUpdate;

            let sortStatus = isRejected ? 4 : (hasPendingUpdate ? 2 : (isApproved ? 1 : 3));
            return { ...c, isUserCreated, isApproved, isRejected, hasPendingUpdate, sortStatus, ownerEmail: compCustomData ? compCustomData.ownerEmail : '' };
        });

        // TÌM KIẾM (Tên cty, Ngành nghề, Gmail Đăng)
        const keyword = (document.getElementById('search-admin-comps')?.value || '').toLowerCase().trim();
        if (keyword) {
            comps = comps.filter(c => 
                (c.name || '').toLowerCase().includes(keyword) || 
                (c.ownerEmail || '').toLowerCase().includes(keyword) ||
                (c.industry || '').toLowerCase().includes(keyword)
            );
        }

        // SẮP XẾP
        const { sortCol, sortDir } = adminFilters.comps;
        if (sortCol) {
            comps.sort((a, b) => {
                let valA, valB;
                if (sortCol === 'name') { valA = (a.name || '').toLowerCase(); valB = (b.name || '').toLowerCase(); }
                else if (sortCol === 'industry') { valA = (a.industry || '').toLowerCase(); valB = (b.industry || '').toLowerCase(); }
                else if (sortCol === 'status') { valA = a.sortStatus; valB = b.sortStatus; } // Sort theo độ ưu tiên Trạng thái

                if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        updateSortUI('companies', sortCol, sortDir);

        if (comps.length === 0) return tbody.innerHTML = '<tr><td colspan="4" class="py-10 text-center text-gray-500 font-medium">Không tìm thấy công ty nào khớp với từ khóa.</td></tr>';

        tbody.innerHTML = comps.map(c => {
            let statusHtml = '', approveBtn = '';
            if (c.isRejected) {
                statusHtml = `<span class="text-xs bg-red-100 text-red-700 font-bold px-2 py-1 rounded"><i class="fas fa-ban"></i> Bị từ chối</span>`;
                approveBtn = `<button onclick="approveCompany(${c.id})" class="text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1 rounded transition mr-2" title="Duyệt lại"><i class="fas fa-check"></i> Duyệt</button>`;
            } else if (c.hasPendingUpdate) {
                statusHtml = `<span class="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded"><i class="fas fa-pen-nib"></i> Chờ duyệt sửa</span>`;
                approveBtn = `<button onclick="approveCompany(${c.id})" class="text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-1 rounded transition mr-2" title="Duyệt sửa"><i class="fas fa-check-double"></i> Duyệt sửa</button>`;
            } else if (c.isApproved) {
                statusHtml = `<span class="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded"><i class="fas fa-check-circle"></i> Đã duyệt</span>`;
            } else {
                statusHtml = `<span class="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded"><i class="fas fa-clock"></i> Chờ duyệt</span>`;
                approveBtn = `<button onclick="approveCompany(${c.id})" class="text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1 rounded transition mr-2" title="Duyệt"><i class="fas fa-check"></i> Duyệt</button>`;
            }

            return `<tr class="border-b border-gray-100 hover:bg-gray-50 transition"><td class="py-3 px-6"><div class="flex items-center gap-3"><img src="${c.logo}" class="w-8 h-8 object-contain rounded border"><button onclick="previewCompany(${c.id})" class="font-bold text-blue-600 hover:text-blue-800 hover:underline text-left text-wrap text-sm transition flex items-center gap-1">${c.name} <i class="fas fa-eye text-[10px] text-gray-400"></i></button></div></td><td class="py-3 px-6 text-gray-600">${c.industry}</td><td class="py-3 px-6">${statusHtml}</td><td class="py-3 px-6 text-center">${approveBtn}<button onclick="openRejectModal(${c.id})" class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition"><i class="fas fa-trash"></i></button></td></tr>`;
        }).join('');
    }

    // =========================================================
    // 3. MODULE VIỆC LÀM (TÌM KIẾM & SẮP XẾP)
    // =========================================================
    window.sortAdminJobs = function(col) {
        if (adminFilters.jobs.sortCol === col) adminFilters.jobs.sortDir = adminFilters.jobs.sortDir === 'asc' ? 'desc' : 'asc';
        else { adminFilters.jobs.sortCol = col; adminFilters.jobs.sortDir = 'asc'; }
        loadAdminJobs();
    };

    window.loadAdminJobs = function() {
        let jobs = getActiveJobs();
        const tbody = document.getElementById('admin-jobs-tbody');
        if(!tbody) return;

        const approvedIds = JSON.parse(localStorage.getItem('admin_approved_jobs')) || [];
        const deletedIds = JSON.parse(localStorage.getItem('admin_deleted_jobs')) || [];
        const customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];

        jobs = jobs.map(j => {
            const jobCustomData = customJobs.find(cj => cj.id === j.id);
            const isUserCreated = customJobs.some(cj => cj.id === j.id);
            const isApproved = approvedIds.includes(j.id) || !isUserCreated;
            const isRejected = deletedIds.includes(j.id);
            const hasPendingUpdate = jobCustomData && jobCustomData.pendingUpdate;

            let sortStatus = isRejected ? 4 : (hasPendingUpdate ? 2 : (isApproved ? 1 : 3));
            return { ...j, isUserCreated, isApproved, isRejected, hasPendingUpdate, sortStatus, ownerEmail: jobCustomData ? jobCustomData.ownerEmail : '' };
        });

        // TÌM KIẾM (Tiêu đề, Tên công ty, Gmail Đăng)
        const keyword = (document.getElementById('search-admin-jobs')?.value || '').toLowerCase().trim();
        if (keyword) {
            jobs = jobs.filter(j => 
                (j.title || '').toLowerCase().includes(keyword) || 
                (j.company || '').toLowerCase().includes(keyword) ||
                (j.ownerEmail || '').toLowerCase().includes(keyword)
            );
        }

        // SẮP XẾP
        const { sortCol, sortDir } = adminFilters.jobs;
        if (sortCol) {
            jobs.sort((a, b) => {
                let valA, valB;
                if (sortCol === 'title') { valA = (a.title || '').toLowerCase(); valB = (b.title || '').toLowerCase(); }
                else if (sortCol === 'company') { valA = (a.company || '').toLowerCase(); valB = (b.company || '').toLowerCase(); }
                else if (sortCol === 'status') { valA = a.sortStatus; valB = b.sortStatus; }

                if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        updateSortUI('jobs', sortCol, sortDir);

        if (jobs.length === 0) return tbody.innerHTML = '<tr><td colspan="4" class="py-10 text-center text-gray-500 font-medium">Không tìm thấy việc làm nào khớp với từ khóa.</td></tr>';

        tbody.innerHTML = jobs.map(j => {
            let statusHtml = '', approveBtn = '';
            if (j.isRejected) {
                statusHtml = `<span class="text-xs bg-red-100 text-red-700 font-bold px-2 py-1 rounded"><i class="fas fa-ban"></i> Đã ẩn</span>`;
                approveBtn = `<button onclick="approveJob(${j.id})" class="text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1 rounded transition mr-2" title="Khôi phục"><i class="fas fa-check"></i> Duyệt</button>`;
            } else if (j.hasPendingUpdate) {
                statusHtml = `<span class="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded"><i class="fas fa-pen-nib"></i> Chờ duyệt sửa</span>`;
                approveBtn = `<button onclick="approveJob(${j.id})" class="text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-1 rounded transition mr-2" title="Duyệt bản sửa"><i class="fas fa-check-double"></i> Duyệt sửa</button>`;
            } else if (j.isApproved) {
                statusHtml = `<span class="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded"><i class="fas fa-check-circle"></i> Đang hiển thị</span>`;
            } else {
                statusHtml = `<span class="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded"><i class="fas fa-clock"></i> Chờ duyệt</span>`;
                approveBtn = `<button onclick="approveJob(${j.id})" class="text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1 rounded transition mr-2" title="Duyệt bài"><i class="fas fa-check"></i> Duyệt</button>`;
            }

            return `<tr class="border-b border-gray-100 hover:bg-gray-50 transition"><td class="py-3 px-6 truncate max-w-[200px]" title="${j.title}"><button onclick="previewJob(${j.id})" class="font-bold text-blue-600 hover:text-blue-800 hover:underline text-left text-wrap text-sm transition">${j.title} <i class="fas fa-eye text-[10px] ml-1 text-gray-400"></i></button></td><td class="py-3 px-6 text-gray-600 truncate max-w-[150px]">${j.company}</td><td class="py-3 px-6">${statusHtml}</td><td class="py-3 px-6 text-center">${approveBtn}<button onclick="openRejectJobModal(${j.id})" class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition" title="Xóa/Ẩn bài"><i class="fas fa-trash"></i></button></td></tr>`;
        }).join('');
    }

    window.approveCompany = function(id) {
        if (!confirm("✅ Xác nhận duyệt Công ty này để hiển thị công khai trên nền tảng?")) return;

        // GHI ĐÈ BẢN SỬA LÊN BẢN GỐC (NẾU CÓ BẢN NHÁP)
        let customComps = JSON.parse(localStorage.getItem('custom_companies')) || [];
        const compIdx = customComps.findIndex(c => c.id === id);
        if (compIdx !== -1 && customComps[compIdx].pendingUpdate) {
            Object.assign(customComps[compIdx], customComps[compIdx].pendingUpdate);
            delete customComps[compIdx].pendingUpdate; // Xóa nháp đi
            localStorage.setItem('custom_companies', JSON.stringify(customComps));
            
            // Ép đồng bộ kho tổng để thay đổi hiển thị ra ngay Public
            if (typeof window.mockCompaniesDB !== 'undefined') {
                const mjIdx = window.mockCompaniesDB.findIndex(m => m.id === id);
                if(mjIdx !== -1) window.mockCompaniesDB[mjIdx] = customComps[compIdx];
            }
        }

        const approvedIds = JSON.parse(localStorage.getItem('admin_approved_comps')) || [];
        if (!approvedIds.includes(id)) approvedIds.push(id);
        localStorage.setItem('admin_approved_comps', JSON.stringify(approvedIds));
        
        let deletedIds = JSON.parse(localStorage.getItem('admin_deleted_comps')) || [];
        deletedIds = deletedIds.filter(dId => dId !== id);
        localStorage.setItem('admin_deleted_comps', JSON.stringify(deletedIds));

        loadAdminCompanies(); loadAdminDashboard();
    };

    // Mở Popup chọn lý do
    window.companyToReject = null;
    window.openRejectModal = function(id) {
        window.companyToReject = id;
        document.getElementById('admin-reject-modal').classList.remove('hidden');
        document.getElementById('admin-reject-modal').classList.add('flex');
    };
    
    // Đóng Popup
    window.closeRejectModal = function() {
        window.companyToReject = null;
        document.getElementById('admin-reject-modal').classList.add('hidden');
        document.getElementById('admin-reject-modal').classList.remove('flex');
    };

    // Xác nhận từ chối và Ghi lý do
    window.confirmRejectCompany = function() {
        if(!window.companyToReject) return;
        const id = window.companyToReject;
        
        // Lấy lý do
        const radios = document.getElementsByName('reject-reason');
        let reason = "";
        for(let r of radios) { if(r.checked) reason = r.value; }
        if(reason === "other") reason = document.getElementById('reject-other-reason').value;
        if(!reason.trim()) return alert("Vui lòng chọn hoặc nhập lý do từ chối!");

        // 1. Thêm vào Sổ Đen
        let deletedIds = JSON.parse(localStorage.getItem('admin_deleted_comps')) || [];
        if (!deletedIds.includes(id)) deletedIds.push(id);
        localStorage.setItem('admin_deleted_comps', JSON.stringify(deletedIds));

        // 2. FIX LỖI: Bắt buộc phải XÓA khỏi Sổ Đỏ (Danh sách đã duyệt)
        let approvedIds = JSON.parse(localStorage.getItem('admin_approved_comps')) || [];
        approvedIds = approvedIds.filter(aId => aId !== id);
        localStorage.setItem('admin_approved_comps', JSON.stringify(approvedIds));

        // 3. Lưu lý do vào LocalStorage để báo về cho Doanh nghiệp
        let reasonsLog = JSON.parse(localStorage.getItem('admin_rejected_reasons')) || {};
        reasonsLog[id] = reason;
        localStorage.setItem('admin_rejected_reasons', JSON.stringify(reasonsLog));

        closeRejectModal();
        loadAdminCompanies(); loadAdminDashboard();
        alert("Đã ẩn công ty và gửi lý do vi phạm!");
    };

    // --- LOGIC TỪ CHỐI VIỆC LÀM ---
    window.jobToReject = null;
    window.openRejectJobModal = function(id) {
        window.jobToReject = id;
        document.getElementById('admin-reject-job-modal').classList.remove('hidden');
        document.getElementById('admin-reject-job-modal').classList.add('flex');
    };
    window.closeRejectJobModal = function() {
        window.jobToReject = null;
        document.getElementById('admin-reject-job-modal').classList.add('hidden');
        document.getElementById('admin-reject-job-modal').classList.remove('flex');
    };
    window.confirmRejectJob = function() {
        if(!window.jobToReject) return;
        const id = window.jobToReject;
        const radios = document.getElementsByName('reject-job-reason');
        let reason = "";
        for(let r of radios) { if(r.checked) reason = r.value; }
        if(reason === "other") reason = document.getElementById('reject-job-other-reason').value;
        if(!reason.trim()) return alert("Vui lòng chọn hoặc nhập lý do từ chối!");

        let deletedIds = JSON.parse(localStorage.getItem('admin_deleted_jobs')) || [];
        if (!deletedIds.includes(id)) deletedIds.push(id);
        localStorage.setItem('admin_deleted_jobs', JSON.stringify(deletedIds));

        let approvedIds = JSON.parse(localStorage.getItem('admin_approved_jobs')) || [];
        approvedIds = approvedIds.filter(aId => aId !== id);
        localStorage.setItem('admin_approved_jobs', JSON.stringify(approvedIds));

        // Lưu lý do để báo chuông cho Doanh nghiệp
        let reasonsLog = JSON.parse(localStorage.getItem('admin_rejected_jobs_reasons')) || {};
        reasonsLog[id] = reason;
        localStorage.setItem('admin_rejected_jobs_reasons', JSON.stringify(reasonsLog));

        closeRejectJobModal(); loadAdminJobs(); loadAdminDashboard();
        alert("Đã ẩn Việc làm và gửi lý do thông báo cho Doanh nghiệp!");
    };

    window.approveJob = function(id) {
        if (!confirm("✅ Xác nhận duyệt tin tuyển dụng này để hiển thị công khai?")) return;
        
        // 1. GHI ĐÈ BẢN SỬA LÊN BẢN GỐC (NẾU CÓ)
        let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
        const jobIndex = customJobs.findIndex(cj => cj.id === id);
        if (jobIndex !== -1 && customJobs[jobIndex].pendingUpdate) {
            Object.assign(customJobs[jobIndex], customJobs[jobIndex].pendingUpdate); // Chép đè data mới
            delete customJobs[jobIndex].pendingUpdate; // Xóa nháp
            localStorage.setItem('custom_jobs', JSON.stringify(customJobs));
            
            // Ép F5 ngầm kho tổng để Admin thấy ngay lập tức
            if (typeof window.mockJobs !== 'undefined') {
                const mjIdx = window.mockJobs.findIndex(m => m.id === id);
                if(mjIdx !== -1) window.mockJobs[mjIdx] = customJobs[jobIndex];
            }
        }

        // 2. Thêm vào sổ đỏ
        const approvedIds = JSON.parse(localStorage.getItem('admin_approved_jobs')) || [];
        if (!approvedIds.includes(id)) approvedIds.push(id);
        localStorage.setItem('admin_approved_jobs', JSON.stringify(approvedIds));
        
        // 3. Rút tên khỏi sổ đen
        let deletedIds = JSON.parse(localStorage.getItem('admin_deleted_jobs')) || [];
        deletedIds = deletedIds.filter(dId => dId !== id);
        localStorage.setItem('admin_deleted_jobs', JSON.stringify(deletedIds));

        loadAdminJobs();
    };

    window.deleteJob = function(id) {
        if (!confirm("⚠️ Chắc chắn muốn ẩn/xóa tin tuyển dụng này?")) return;
        
        // Thêm vào sổ đen
        const deletedIds = JSON.parse(localStorage.getItem('admin_deleted_jobs')) || [];
        if (!deletedIds.includes(id)) deletedIds.push(id);
        localStorage.setItem('admin_deleted_jobs', JSON.stringify(deletedIds));
        
        // ĐÃ FIX: Gỡ khỏi danh sách duyệt 
        let approvedIds = JSON.parse(localStorage.getItem('admin_approved_jobs')) || [];
        approvedIds = approvedIds.filter(aId => aId !== id);
        localStorage.setItem('admin_approved_jobs', JSON.stringify(approvedIds));

        loadAdminJobs(); loadAdminDashboard();
    };

    window.adminLogout = function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html'; // Sửa lại thành index.html thay vì login.html vì bạn không có file đó
    };

    loadAdminDashboard();
});
// --- HÀM XEM TRƯỚC VIỆC LÀM NGAY TRÊN ADMIN ---
    window.previewJob = function(id) {
        const job = (typeof window.mockJobs !== 'undefined') ? window.mockJobs.find(j => j.id === id) : null;
        const customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
        const customData = customJobs.find(cj => cj.id === id);
        // Trộn bản nháp vào biến tạm để Admin đọc thử
        if (customData && customData.pendingUpdate) Object.assign(job, customData.pendingUpdate);
        if (!job) return alert("Dữ liệu việc làm này không tồn tại hoặc đã bị lỗi!");

        const contentDiv = document.getElementById('admin-preview-content');
        
        // Vẽ thẻ Kỹ năng
        const tagsHTML = (job.tags || []).map(t => `<span class="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-lg border border-blue-100 font-medium">${t}</span>`).join('');

        contentDiv.innerHTML = `
            <div class="flex items-start gap-6 mb-8 pb-6 border-b border-gray-100">
                <img src="${job.logo}" class="w-20 h-20 object-contain border border-gray-200 rounded-lg p-2 bg-white shrink-0">
                <div>
                    <h2 class="text-2xl font-black text-gray-900 mb-2 leading-tight">${job.title}</h2>
                    <p class="text-lg text-gray-600 font-bold mb-3">${job.company}</p>
                    <div class="flex flex-wrap gap-3 text-sm font-medium">
                        <span class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md"><i class="fas fa-money-bill-wave mr-1 text-gray-400"></i> ${job.salary}</span>
                        <span class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md"><i class="fas fa-map-marker-alt mr-1 text-gray-400"></i> ${job.location}</span>
                    </div>
                </div>
            </div>
            
            <div class="mb-6">
                <h4 class="font-bold text-base mb-3 text-gray-900 flex items-center gap-2"><i class="fas fa-tags text-blue-500"></i> Kỹ năng yêu cầu</h4>
                <div class="flex flex-wrap gap-2">${tagsHTML}</div>
            </div>

            <div class="text-sm text-gray-800 space-y-6">
                <div>
                    <h4 class="font-bold text-lg mb-2 text-gray-900 flex items-center gap-2"><i class="fas fa-align-left text-blue-500"></i> Mô tả công việc</h4>
                    <p class="leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-100">${job.description || 'Chưa cập nhật mô tả.'}</p>
                </div>
                <div>
                    <h4 class="font-bold text-lg mb-2 text-gray-900 flex items-center gap-2"><i class="fas fa-clipboard-check text-blue-500"></i> Yêu cầu ứng viên</h4>
                    <p class="leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-100">${job.requirements || 'Chưa cập nhật yêu cầu.'}</p>
                </div>
                <div>
                    <h4 class="font-bold text-lg mb-2 text-gray-900 flex items-center gap-2"><i class="fas fa-gift text-blue-500"></i> Quyền lợi</h4>
                    <p class="leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-100">${job.benefits || 'Chưa cập nhật quyền lợi.'}</p>
                </div>
            </div>
        `;

        document.getElementById('admin-preview-modal').classList.remove('hidden');
    };

    // Hàm đóng Modal
    window.closePreviewModal = function() {
        document.getElementById('admin-preview-modal').classList.add('hidden');
    };
// --- HÀM XEM TRƯỚC CÔNG TY NGAY TRÊN ADMIN (ĐÃ FIX LỖI KẾT NỐI DATA) ---
    window.previewCompany = function(id) {
        let comp = (typeof window.mockCompaniesDB !== 'undefined') ? window.mockCompaniesDB.find(c => c.id === id) : null;
        if (!comp) return alert("Dữ liệu công ty này không tồn tại hoặc đã bị lỗi!");

        // TRỘN BẢN NHÁP VÀO ĐỂ ADMIN DUYỆT THỬ
        const customComps = JSON.parse(localStorage.getItem('custom_companies')) || [];
        const customData = customComps.find(cc => cc.id === id);
        if (customData && customData.pendingUpdate) {
            comp = { ...comp, ...customData.pendingUpdate };
        }

        const contentDiv = document.getElementById('admin-preview-content');
        
        contentDiv.innerHTML = `
            <div class="relative h-40 bg-gray-200 rounded-lg mb-12">
                <img src="${comp.cover || 'https://placehold.co/800x200/f8fafc/94a3b8?text=Cover'}" class="w-full h-full object-cover rounded-lg border border-gray-100">
                <div class="absolute -bottom-6 left-6 w-24 h-24 bg-white rounded-xl p-1.5 shadow-md border border-gray-100 flex items-center justify-center">
                    <img src="${comp.logo}" alt="Logo" class="max-w-full max-h-full object-contain rounded">
                </div>
            </div>
            
            <div class="px-2 text-sm text-gray-800">
                <h2 class="text-2xl font-black text-gray-900 mb-2 leading-tight">${comp.name}</h2>
                <div class="flex flex-wrap gap-3 text-sm font-medium mb-6">
                    <span class="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md flex items-center gap-1"><i class="fas fa-building"></i> ${comp.industry || 'Chưa cập nhật'}</span>
                    <span class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md flex items-center gap-1"><i class="fas fa-users"></i> ${comp.size || 'Chưa cập nhật'}</span>
                    <span class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md flex items-center gap-1"><i class="fas fa-map-marker-alt"></i> ${comp.address || 'Chưa cập nhật'}</span>
                    ${comp.website ? `<a href="${comp.website}" target="_blank" class="bg-gray-100 text-blue-600 hover:underline px-3 py-1.5 rounded-md flex items-center gap-1"><i class="fas fa-globe"></i> Website</a>` : ''}
                </div>
                
                <div>
                    <h4 class="font-bold text-lg mb-2 text-gray-900 flex items-center gap-2"><i class="fas fa-info-circle text-blue-500"></i> Giới thiệu công ty</h4>
                    <div class="leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700">${comp.about || 'Chưa cập nhật thông tin giới thiệu.'}</div>
                </div>
            </div>
        `;

        document.getElementById('admin-preview-modal').classList.remove('hidden');
    };
// =================================================================
// 25. XỬ LÝ AUTH DOANH NGHIỆP & ĐĂNG TIN TÌM VIỆC
// =================================================================

window.employerRegister = function(event) {
    event.preventDefault();
    const compName = document.getElementById('emp-reg-name').value.trim();
    const email = document.getElementById('emp-reg-email').value.trim();
    const pass = document.getElementById('emp-reg-pass').value;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(u => u.username === email)) {
        alert("Email này đã được đăng ký!"); return;
    }

    // 1. Tạo User cấp Doanh nghiệp
    let newUser = { username: email, password: pass, type: "employer", fullName: compName, email: email };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // 2. Tạo Hồ sơ Công ty (Trạng thái: Chờ duyệt)
    let customComps = JSON.parse(localStorage.getItem('custom_companies')) || [];
    let newComp = {
        id: Date.now(), 
        name: compName,
        logo: "https://via.placeholder.com/150/2563eb/ffffff?text=" + compName.substring(0,3).toUpperCase(),
        cover: "https://images.unsplash.com/photo-1497366216548-37526070297c",
        industry: "Chưa cập nhật", size: "Chưa cập nhật", website: "",
        address: "Chưa cập nhật", about: "Công ty chưa cập nhật thông tin giới thiệu.", 
        ownerEmail: email // Đánh dấu chủ sở hữu
    };
    customComps.push(newComp);
    localStorage.setItem('custom_companies', JSON.stringify(customComps));

    alert("Đăng ký thành công! Tài khoản và Công ty của bạn đang chờ Admin xét duyệt.\nBạn có thể đăng nhập ngay để thiết lập trang Công ty.");
    window.switchTab('login');
};

window.employerLogin = function(event) {
    event.preventDefault();
    const email = document.getElementById('emp-login-email').value.trim();
    const pass = document.getElementById('emp-login-pass').value;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const validUser = users.find(u => u.username === email && u.password === pass && u.type === "employer");

    if (validUser) {
        alert("Đăng nhập Doanh nghiệp thành công!");
        localStorage.setItem("currentUser", JSON.stringify(validUser));
        window.location.href = "doanhnghiep.html";
    } else {
        alert("Sai thông tin hoặc tài khoản này không phải Doanh nghiệp!");
    }
};

window.postNewJob = function(event) {
    event.preventDefault();
    const userStr = localStorage.getItem('currentUser');
    if(!userStr) return;
    const user = JSON.parse(userStr);

    const title = document.getElementById('job-title').value;
    const industryInput = document.getElementById('job-industry').value;
    const salary = document.getElementById('job-salary').value || 'Thỏa thuận';
    const location = document.getElementById('job-location').value || 'Chưa cập nhật';
    
    const desc = document.getElementById('job-desc').value;
    const req = document.getElementById('job-req').value;
    const benefit = document.getElementById('job-benefit').value;

    // THUẬT TOÁN TÁCH THẺ: Cắt bằng dấu ;, xóa khoảng trắng dư thừa, lọc bỏ các thẻ rỗng
    const tagsArray = industryInput.split(';').map(t => t.trim()).filter(t => t !== '');

    let customComps = JSON.parse(localStorage.getItem('custom_companies')) || [];
    let myComp = customComps.find(c => c.ownerEmail === user.username) || { name: user.fullName, logo: "https://placehold.co/60" };

    const newJob = {
        id: Date.now(), 
        title: title, 
        company: myComp.name, 
        salary: salary, 
        salarySort: 10, 
        location: location, 
        logo: myComp.logo, 
        tags: tagsArray.length > 0 ? tagsArray : ['Chưa phân loại'], 
        description: desc.replace(/\n/g, '<br>'), 
        requirements: req.replace(/\n/g, '<br>'), 
        benefits: benefit.replace(/\n/g, '<br>'),
        ownerEmail: user.username
    };

    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    customJobs.unshift(newJob);
    localStorage.setItem('custom_jobs', JSON.stringify(customJobs));

    alert("🎉 Đăng tin thành công! Tin của bạn đang chờ Admin kiểm duyệt.");
    document.getElementById('form-post-job').reset();
    switchAdminView('overview');
};

// =================================================================
// 26. HỆ THỐNG THÔNG BÁO & XIN DUYỆT DOANH NGHIỆP (DOANHNGHIEP.HTML)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('doanhnghiep.html')) {
        setTimeout(updateEmployerNotifications, 100);
    }
});

// Hàm bật/tắt cái hộp thông báo thả xuống
window.toggleNotifications = function() {
    const dropdown = document.getElementById('noti-dropdown');
    const dot = document.getElementById('noti-dot');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
        // Nếu mở ra xem thì tắt cái chấm đỏ đi
        if (!dropdown.classList.contains('hidden') && dot) {
            dot.classList.add('hidden');
        }
    }
};

// Hàm soi trạng thái công ty & Lấy lý do từ chối
function getCompanyStatus() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return 'none';
    const user = JSON.parse(userStr);
    
    let customComps = JSON.parse(localStorage.getItem('custom_companies')) || [];
    let myComp = customComps.find(c => c.ownerEmail === user.username);
    if (!myComp) return 'none';

    const approvedComps = JSON.parse(localStorage.getItem('admin_approved_comps')) || [];
    const deletedComps = JSON.parse(localStorage.getItem('admin_deleted_comps')) || [];
    const rejectedReasons = JSON.parse(localStorage.getItem('admin_rejected_reasons')) || {};

    if (deletedComps.includes(myComp.id)) {
        return { status: 'rejected', id: myComp.id, reason: rejectedReasons[myComp.id] || "Không đạt tiêu chuẩn. Vui lòng kiểm tra lại." };
    }
    
    // BỔ SUNG TRẠNG THÁI: Cứ có bản nháp là báo Đang chờ duyệt sửa
    if (myComp.pendingUpdate) {
        return { status: 'pending_update', id: myComp.id };
    }

    if (approvedComps.includes(myComp.id) || myComp.id <= 10) return { status: 'approved', id: myComp.id };
    
    return { status: 'pending', id: myComp.id };
}

window.updateEmployerNotifications = function() {
    const compInfo = getCompanyStatus();
    const contentDiv = document.getElementById('noti-content');
    const dot = document.getElementById('noti-dot');
    if (!contentDiv) return;
    
    let html = '';
    let hasAlert = false;

    // --- CẢNH BÁO HỒ SƠ CÔNG TY ---
    if (compInfo !== 'none') {
        const postJobBtn = document.querySelector('#view-post-job button[type="submit"]');
        if (compInfo.status === 'pending') {
            html += `<div class="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded flex gap-3 mb-2"><i class="fas fa-clock text-yellow-500 mt-1"></i><div><p class="text-xs font-bold text-yellow-800">Hồ sơ chờ duyệt</p><p class="text-[10px] text-yellow-700">Admin đang xem xét thông tin công ty.</p></div></div>`;
            if(postJobBtn) lockPostJob(postJobBtn, false); 
        } else if (compInfo.status === 'pending_update') {
            html += `<div class="p-3 bg-purple-50 border-l-4 border-purple-500 rounded flex gap-3 mb-2"><i class="fas fa-pen-nib text-purple-500 mt-1"></i><div><p class="text-xs font-bold text-purple-800">Chờ duyệt bản sửa</p><p class="text-[10px] text-purple-700">Thông tin công ty đang chờ Admin duyệt.</p></div></div>`;
            if(postJobBtn) lockPostJob(postJobBtn, false); 
        } else if (compInfo.status === 'rejected') {
            html += `<div class="p-3 bg-red-50 border-l-4 border-red-500 rounded flex gap-3 mb-2"><i class="fas fa-ban text-red-500 mt-1"></i><div><p class="text-xs font-bold text-red-800">Công ty bị từ chối duyệt</p><p class="text-[10px] text-red-700 mt-0.5"><b>Lý do:</b> ${compInfo.reason}</p></div></div>`;
            if(postJobBtn) lockPostJob(postJobBtn, true);
            hasAlert = true;
        }
    }

    // --- CẢNH BÁO VIỆC LÀM BỊ TỪ CHỐI ---
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        const user = JSON.parse(userStr);
        const customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
        const deletedIds = JSON.parse(localStorage.getItem('admin_deleted_jobs')) || [];
        const rejectedReasons = JSON.parse(localStorage.getItem('admin_rejected_jobs_reasons')) || {};
        
        const myRejectedJobs = customJobs.filter(j => j.ownerEmail === user.username && deletedIds.includes(j.id));
        
        myRejectedJobs.forEach(job => {
            hasAlert = true;
            html += `<div class="p-3 bg-red-50 border-l-4 border-red-500 rounded flex gap-3 mb-2"><i class="fas fa-exclamation-triangle text-red-500 mt-1"></i><div><p class="text-xs font-bold text-red-800">Việc làm bị ẩn/từ chối</p><p class="text-[10px] text-red-700 font-bold mt-0.5">${job.title}</p><p class="text-[10px] text-red-700 mt-0.5"><b>Lý do:</b> ${rejectedReasons[job.id] || "Vi phạm quy định"}</p></div></div>`;
        });
    }

    if (html === '') {
        html = `<div class="p-4 text-center text-xs text-gray-500">Bạn không có thông báo nào.</div>`;
    }
    
    contentDiv.innerHTML = html;
    if (hasAlert && dot) dot.classList.remove('hidden');
};

// Hàm phụ Khóa nút
function lockPostJob(btn, isLocked) {
    if (isLocked) {
        btn.disabled = true;
        btn.className = 'px-6 py-2.5 bg-gray-400 text-white font-bold rounded-lg cursor-not-allowed';
        btn.innerHTML = '<i class="fas fa-lock mr-2"></i> Bị khóa đăng tin';
    } else {
        btn.disabled = false;
        btn.className = 'px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md';
        btn.innerHTML = 'Đăng tin ngay';
    }
}

// Nút Gửi yêu cầu duyệt thủ công
window.requestAdminApproval = function() {
    let comps = JSON.parse(localStorage.getItem('custom_companies')) || [];
    const user = JSON.parse(localStorage.getItem('currentUser'));
    let idx = comps.findIndex(c => c.ownerEmail === user.username);
    
    if (idx !== -1 && comps[idx].draft) {
        if (!confirm("Gửi bản nháp này cho Admin phê duyệt?")) return;
        
        // CHUYỂN DRAFT THÀNH PENDING UPDATE CHO ADMIN THẤY
        comps[idx].pendingUpdate = { ...comps[idx].draft };
        delete comps[idx].draft; // Xóa nháp cũ đi
        
        localStorage.setItem('custom_companies', JSON.stringify(comps));
        
        // Gỡ bỏ án phạt (Sổ đen) nếu có để Admin thấy đơn mới
        let deletedComps = JSON.parse(localStorage.getItem('admin_deleted_comps')) || [];
        deletedComps = deletedComps.filter(id => id !== comps[idx].id);
        localStorage.setItem('admin_deleted_comps', JSON.stringify(deletedComps));

        alert("✅ Đã gửi yêu cầu thành công! Hãy theo dõi mục Thông báo.");
        checkCompanySubmitStatus(comps[idx]);
        updateEmployerNotifications();
    }
};
function checkCompanySubmitStatus(compObj) {
    const btn = document.getElementById('btn-submit-comp-approval');
    if (!btn) return;
    // Nếu không có Draft (chưa sửa gì thêm), hoặc Draft y hệt Pending -> Làm mờ nút
    if (!compObj.draft || JSON.stringify(compObj.draft) === JSON.stringify(compObj.pendingUpdate)) {
        btn.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

/* =================================================================
   PHẦN 27: QUẢN LÝ HỒ SƠ DOANH NGHIỆP (LOGO, COVER, INFO)
   ================================================================= */

// 1. Hàm xem trước ảnh ngay khi chọn file (Dùng chung cho cả Logo và Cover)
window.previewImg = function(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => { 
            document.getElementById(previewId).src = e.target.result; 
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// 2. Hàm đổ dữ liệu từ "két sắt" vào các ô nhập liệu khi mở tab Cài đặt
window.loadCompanySettings = function() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const comps = JSON.parse(localStorage.getItem('custom_companies')) || [];
    const myComp = comps.find(c => c.ownerEmail === JSON.parse(userStr).username);

    if (myComp) {
        // Ưu tiên hiển thị Nháp (draft) > Chờ duyệt (pending) > Gốc
        const data = myComp.draft ? { ...myComp, ...myComp.draft } : (myComp.pendingUpdate ? { ...myComp, ...myComp.pendingUpdate } : myComp);

        if (document.getElementById('set-comp-name')) document.getElementById('set-comp-name').value = data.name || "";
        if (document.getElementById('set-comp-industry')) document.getElementById('set-comp-industry').value = data.industry || "";
        if (document.getElementById('set-comp-web')) document.getElementById('set-comp-web').value = data.website || "";
        if (document.getElementById('set-comp-addr')) document.getElementById('set-comp-addr').value = data.address || "";
        if (document.getElementById('set-comp-about')) document.getElementById('set-comp-about').value = data.about || "";
        if (data.logo && document.getElementById('setting-logo-preview')) document.getElementById('setting-logo-preview').src = data.logo;
        if (data.cover && document.getElementById('setting-cover-preview')) document.getElementById('setting-cover-preview').src = data.cover;
        
        checkCompanySubmitStatus(myComp); // Kiểm tra xem có cần làm mờ nút Gửi duyệt không
    }
};

window.saveCompanyProfile = function(event) {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    let comps = JSON.parse(localStorage.getItem('custom_companies')) || [];
    let idx = comps.findIndex(c => c.ownerEmail === user.username);
    if (idx === -1) { comps.push({ id: Date.now(), ownerEmail: user.username }); idx = comps.length - 1; }

    // CHỈ LƯU VÀO NHÁP (DRAFT) - KHÔNG ĐẨY SANG ADMIN
    comps[idx].draft = {
        name: document.getElementById('set-comp-name').value,
        industry: document.getElementById('set-comp-industry').value,
        website: document.getElementById('set-comp-web').value,
        address: document.getElementById('set-comp-addr').value,
        about: document.getElementById('set-comp-about').value,
        logo: document.getElementById('setting-logo-preview').src,
        cover: document.getElementById('setting-cover-preview').src
    };

    localStorage.setItem('custom_companies', JSON.stringify(comps));
    user.fullName = comps[idx].draft.name; localStorage.setItem('currentUser', JSON.stringify(user));
    alert("✅ Đã lưu nháp cục bộ thành công! Bạn nhớ bấm 'Gửi yêu cầu duyệt lại' để Admin xem xét nhé.");
    
    checkCompanySubmitStatus(comps[idx]); // Mở khóa nút Gửi duyệt
    if (typeof syncEmployerHeader === 'function') syncEmployerHeader();
};
// --- 1. SỬA LỖI: HIỂN THỊ CẢ TIN CHỜ DUYỆT VÀ ĐÃ DUYỆT ---
window.loadEmployerJobs = function() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    // Mở rộng bộ tìm kiếm để chắc chắn 100% bắt trúng bảng dữ liệu của bạn
    const tbody = document.getElementById('employer-jobs-tbody') || document.querySelector('#view-manage tbody') || document.querySelector('tbody');
    if(!tbody) return;

    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const approvedIds = JSON.parse(localStorage.getItem('admin_approved_jobs')) || [];
    
    // VŨ KHÍ BÍ MẬT: Ép kiểu toàn bộ kho ID Admin về Chuỗi (String) để so sánh tuyệt đối an toàn
    const safeApprovedIds = approvedIds.map(id => String(id));

    // Lọc lấy TẤT CẢ việc làm của Doanh nghiệp này (Để hiện cả tin Chờ duyệt)
    let myJobs = customJobs.filter(j => j.employerEmail === user.username || j.author === user.username);

    if (myJobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-500 font-medium">Bạn chưa đăng tin tuyển dụng nào.</td></tr>';
        return;
    }

    tbody.innerHTML = myJobs.map(j => {
        // Kiểm tra xem tin đã được Admin duyệt chưa (Ép j.id về Chuỗi)
        const isApproved = safeApprovedIds.includes(String(j.id));
        
        let statusHtml = '';
        let actionHtml = '';

        if (isApproved) {
            statusHtml = '<span class="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200"><i class="fas fa-check-circle mr-1"></i> Đang hiển thị</span>';
            actionHtml = `
                <button onclick="editJob(${j.id})" class="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition mr-1" title="Sửa tin"><i class="fas fa-edit"></i></button>
                <button onclick="deleteJob(${j.id})" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="Xóa tin"><i class="fas fa-trash"></i></button>
            `;
        } else {
            statusHtml = '<span class="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200 animate-pulse"><i class="fas fa-clock mr-1"></i> Chờ Admin duyệt</span>';
            actionHtml = `
                <button disabled class="text-gray-300 bg-gray-50 p-2 rounded-lg cursor-not-allowed mr-1" title="Tin đang chờ duyệt, chưa thể sửa"><i class="fas fa-edit"></i></button>
                <button onclick="deleteJob(${j.id})" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="Rút lại tin này"><i class="fas fa-trash"></i></button>
            `;
        }

        return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
            <td class="py-4 px-6 font-bold text-slate-800">${j.title}</td>
            <td class="py-4 px-6 text-slate-600">${j.salary || 'Thỏa thuận'}</td>
            <td class="py-4 px-6">${statusHtml}</td>
            <td class="py-4 px-6 text-slate-500"><i class="fas fa-eye mr-1"></i> ${isApproved ? Math.floor((j.id % 50) + 10) : 0}</td>
            <td class="py-4 px-6 text-right whitespace-nowrap">${actionHtml}</td>
        </tr>`;
    }).join('');
};

window.openEditJobModal = function(id) {
    const customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const job = customJobs.find(j => j.id === id);
    if(!job) return;

    // Ưu tiên: Draft > Pending > Gốc
    const data = job.draft ? { ...job, ...job.draft } : (job.pendingUpdate ? { ...job, ...job.pendingUpdate } : job);

    document.getElementById('edit-job-id').value = job.id;
    document.getElementById('edit-job-title').value = data.title || '';
    document.getElementById('edit-job-industry').value = (data.tags || []).join('; ');
    document.getElementById('edit-job-salary').value = data.salary || '';
    document.getElementById('edit-job-location').value = data.location || '';
    document.getElementById('edit-job-desc').value = (data.description || '').replace(/<br>/g, '\n');
    document.getElementById('edit-job-req').value = (data.requirements || '').replace(/<br>/g, '\n');
    document.getElementById('edit-job-benefit').value = (data.benefits || '').replace(/<br>/g, '\n');

    checkJobSubmitStatus(job);
    document.getElementById('employer-edit-modal').classList.remove('hidden');
};

window.closeEditJobModal = function() { document.getElementById('employer-edit-modal').classList.add('hidden'); };

window.submitEditJob = function(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('edit-job-id').value);
    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const jobIndex = customJobs.findIndex(j => j.id === id);
    if(jobIndex === -1) return;

    const tagsArray = document.getElementById('edit-job-industry').value.split(';').map(t => t.trim()).filter(t => t !== '');

    // CHỈ LƯU VÀO NHÁP
    customJobs[jobIndex].draft = {
        title: document.getElementById('edit-job-title').value,
        tags: tagsArray.length > 0 ? tagsArray : ['Chưa phân loại'],
        salary: document.getElementById('edit-job-salary').value,
        location: document.getElementById('edit-job-location').value,
        description: document.getElementById('edit-job-desc').value.replace(/\n/g, '<br>'),
        requirements: document.getElementById('edit-job-req').value.replace(/\n/g, '<br>'),
        benefits: document.getElementById('edit-job-benefit').value.replace(/\n/g, '<br>')
    };

    localStorage.setItem('custom_jobs', JSON.stringify(customJobs));
    alert("✅ Đã lưu nháp cục bộ! Nhớ bấm 'Gửi duyệt lại' để đẩy cho Admin nhé.");
    checkJobSubmitStatus(customJobs[jobIndex]);
};

window.requestJobApproval = function() {
    const id = parseInt(document.getElementById('edit-job-id').value);
    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const jobIndex = customJobs.findIndex(j => j.id === id);
    
    if (jobIndex !== -1 && customJobs[jobIndex].draft) {
        if (!confirm("Gửi bản nháp này cho Admin phê duyệt?")) return;
        
        // Đẩy lên Admin
        customJobs[jobIndex].pendingUpdate = { ...customJobs[jobIndex].draft };
        delete customJobs[jobIndex].draft;
        localStorage.setItem('custom_jobs', JSON.stringify(customJobs));
        
        // Gỡ án phạt (nếu có)
        let deletedIds = JSON.parse(localStorage.getItem('admin_deleted_jobs')) || [];
        deletedIds = deletedIds.filter(dId => dId !== id);
        localStorage.setItem('admin_deleted_jobs', JSON.stringify(deletedIds));

        alert("✅ Đã gửi đơn duyệt cho việc làm này!");
        closeEditJobModal(); loadEmployerJobs(); updateEmployerNotifications();
    }
};

function checkJobSubmitStatus(jobObj) {
    const btn = document.getElementById('btn-submit-job-approval');
    if (!btn) return;
    if (!jobObj.draft || JSON.stringify(jobObj.draft) === JSON.stringify(jobObj.pendingUpdate)) {
        btn.disabled = true;
    } else {
        btn.disabled = false;
    }
}

// Khởi chạy load danh sách khi vào web
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('doanhnghiep.html')) setTimeout(loadEmployerJobs, 250);
});

// =================================================================
// 28. ĐỒNG BỘ TÊN VÀ LOGO CÔNG TY TRÊN HEADER DOANH NGHIỆP
// =================================================================
window.syncEmployerHeader = function() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    const headerName = document.getElementById('header-company-name');
    const headerLogo = document.getElementById('employer-header-logo');
    
    let customComps = JSON.parse(localStorage.getItem('custom_companies')) || [];
    let myComp = customComps.find(c => c.ownerEmail === user.username);

    if (myComp) {
        // Trộn bản nháp vào để Doanh nghiệp TỰ NHÌN THẤY Avatar và Tên mới của mình
        // (Public ở ngoài thì vẫn không thấy do bị Admin chặn)
        const displayData = myComp.pendingUpdate ? { ...myComp, ...myComp.pendingUpdate } : myComp;
        
        if (headerName) headerName.textContent = displayData.name;
        if (headerLogo && displayData.logo) headerLogo.src = displayData.logo;
    } else {
        if (headerName) headerName.textContent = user.fullName || user.username;
    }
};

// Tự động chạy khi vào trang Doanh nghiệp
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('doanhnghiep.html')) {
        setTimeout(syncEmployerHeader, 100);
    }
});
// =================================================================
// KHÔI PHỤC HÀM XỬ LÝ ĐĂNG NHẬP (BẢN CHỐNG LỖI 2.0)
// =================================================================
window.processUserLogin = function(event) {
    // FIX LỖI: Tự động kiểm tra xem có event được truyền vào không thì mới chặn
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault(); 
    }
    
    // Tìm ô nhập tài khoản và mật khẩu (Hỗ trợ các ID phổ biến)
    const usernameInput = document.getElementById('username') || document.getElementById('login-username');
    const passwordInput = document.getElementById('password') || document.getElementById('login-password');
    
    if (!usernameInput || !passwordInput) {
        console.error("Lỗi UI: Không tìm thấy ô nhập tài khoản/mật khẩu!");
        return;
    }

    const userVal = usernameInput.value.trim();
    const passVal = passwordInput.value;

    if (!userVal || !passVal) {
        return alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Tìm tài khoản (Hỗ trợ đăng nhập bằng cả username hoặc email)
    const user = users.find(u => (u.username === userVal || u.email === userVal) && u.password === passVal);

    if (user) {
        // 🛑 CHỐT CHẶN: Kiểm tra xem tài khoản có đang bị khóa không
        if (user.isBanned) {
            alert("⛔ TÀI KHOẢN CỦA BẠN ĐÃ BỊ KHÓA!\n\nLý do: " + (user.banReason || "Vi phạm quy định của hệ thống.") + "\n\nVui lòng liên hệ CSKH qua số (024) 37663311 để được hỗ trợ.");
            return; // Chặn đứng, không cho đăng nhập
        }

        // Cấp quyền và lưu vào hệ thống
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Điều hướng dựa theo loại tài khoản
        if (user.username === 'admin') {
            window.location.replace('admin.html');
        } else if (user.type === 'employer') {
            window.location.replace('doanhnghiep.html');
        } else {
            window.location.replace('index.html');
        }
    } else {
        alert("Tài khoản hoặc mật khẩu không chính xác!");
    }
};

// -----------------------------------------------------------------
// BỌC ALIAS: Đảm bảo bắt được Form bằng mọi giá
// -----------------------------------------------------------------
window.login = window.processUserLogin;
window.handleLogin = window.processUserLogin;
window.submitLogin = window.processUserLogin;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('login.html')) {
        const loginForm = document.getElementById('login-form') || document.querySelector('form');
        if (loginForm) {
            loginForm.onsubmit = window.processUserLogin;
        }
    }
});
// =================================================================
// 29. BẢN NÂNG CẤP DOANH NGHIỆP: QUẢN LÝ CV & FIX LỖI HIỂN THỊ
// =================================================================

// --- 1. SỬA LỖI: CHỈ HIỂN THỊ TIN ĐÃ ĐƯỢC ADMIN DUYỆT ---
window.loadEmployerJobs = function() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const tbody = document.getElementById('employer-jobs-tbody');
    if(!tbody) return;

    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const approvedIds = JSON.parse(localStorage.getItem('admin_approved_jobs')) || [];

    // BỘ LỌC THÉP: Chỉ lấy job của user này VÀ đã được Admin ấn duyệt
    let myJobs = customJobs.filter(j => j.employerEmail === user.username && approvedIds.includes(j.id));

    if (myJobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-500 font-medium">Bạn chưa có tin tuyển dụng nào đang hiển thị.<br><span class="text-xs text-orange-500 mt-2 block">(Nếu bạn vừa đăng tin, vui lòng đợi Admin kiểm duyệt để hiển thị tại đây)</span></td></tr>';
        return;
    }

    tbody.innerHTML = myJobs.map(j => {
        return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
            <td class="py-4 px-6 font-bold text-slate-800">${j.title}</td>
            <td class="py-4 px-6 text-slate-600">${j.salary}</td>
            <td class="py-4 px-6"><span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200"><i class="fas fa-check-circle mr-1"></i> Đang hiển thị</span></td>
            <td class="py-4 px-6 text-slate-500"><i class="fas fa-eye mr-1"></i> ${Math.floor((j.id % 50) + 10)}</td>
            <td class="py-4 px-6 text-right">
                <button onclick="editJob(${j.id})" class="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition mr-1"><i class="fas fa-edit"></i></button>
                <button onclick="deleteJob(${j.id})" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
};

// --- 2. BƠM DỮ LIỆU THẬT VÀO DASHBOARD (BẢN FIX LỖI ÉP KIỂU) ---
window.updateEmployerDashboardStats = function() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const approvedIds = JSON.parse(localStorage.getItem('admin_approved_jobs')) || [];
    const safeApprovedIds = approvedIds.map(id => String(id));
    
    // Đếm số job ĐÃ ĐƯỢC DUYỆT và đang hiển thị
    let activeJobs = customJobs.filter(j => (j.employerEmail === user.username || j.author === user.username) && safeApprovedIds.includes(String(j.id)));
    if(document.getElementById('emp-stat-jobs')) document.getElementById('emp-stat-jobs').innerText = activeJobs.length;

    // Lượt xem (chỉ tính tin đã duyệt)
    let totalViews = 0;
    activeJobs.forEach(j => { totalViews += Math.floor((j.id % 50) + 10); });
    if(document.getElementById('emp-stat-views')) document.getElementById('emp-stat-views').innerText = totalViews;

    // Số CV chờ duyệt (chỉ tính của các tin đã duyệt)
    let applications = JSON.parse(localStorage.getItem('user_applications')) || [];
    let myJobIds = activeJobs.map(j => String(j.id));
    let myCVs = applications.filter(a => myJobIds.includes(String(a.jobId)) && a.status === 'pending');
    
    if(document.getElementById('emp-stat-cvs')) document.getElementById('emp-stat-cvs').innerText = myCVs.length;
    
    const badge = document.getElementById('cv-badge');
    if(badge) {
        if(myCVs.length > 0) { badge.innerText = myCVs.length; badge.classList.remove('hidden'); }
        else { badge.classList.add('hidden'); }
    }
};

// 3. Khôi phục luồng dữ liệu Hồ sơ ứng viên (Có thêm nút Xem CV BẢN FIX)
window.loadEmployerCVs = function() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const container = document.getElementById('employer-cvs-container');
    if(!container) return;

    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    let myJobIds = customJobs.filter(j => j.ownerEmail === user.username).map(j => String(j.id));

    let applications = JSON.parse(localStorage.getItem('user_applications')) || [];
    let myCVs = applications.filter(a => myJobIds.includes(String(a.jobId)));

    if (typeof updateEmployerDashboardStats === 'function') updateEmployerDashboardStats();

    if (myCVs.length === 0) {
        container.innerHTML = '<div class="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100 font-medium">Bạn chưa nhận được CV nào cho các vị trí đang tuyển.</div>';
        return;
    }

    myCVs.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return b.id - a.id;
    });

    const allUsers = JSON.parse(localStorage.getItem('users')) || [];

    container.innerHTML = myCVs.map(app => {
        const job = customJobs.find(j => String(j.id) === String(app.jobId));
        const applicant = allUsers.find(u => u.username === app.userId) || { fullName: 'Ứng viên', email: app.userId };
        
        let statusHtml = '', actionBtns = '';

        if (app.status === 'approved') {
            statusHtml = '<span class="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200"><i class="fas fa-check mr-1"></i> Đã Duyệt</span>';
        } else if (app.status === 'rejected') {
            statusHtml = '<span class="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold border border-red-200"><i class="fas fa-times mr-1"></i> Đã Từ chối</span>';
        } else {
            statusHtml = '<span class="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200 animate-pulse"><i class="fas fa-clock mr-1"></i> Chờ duyệt</span>';
            actionBtns = `
                <button onclick="processCV(${app.id}, 'approved')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition mr-2"><i class="fas fa-check mr-1"></i> Duyệt CV</button>
                <button onclick="processCV(${app.id}, 'rejected')" class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition"><i class="fas fa-times mr-1"></i> Từ chối</button>
            `;
        }

        return `
        <div class="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition mb-4">
            <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div class="flex items-center gap-4">
                    <img src="${applicant.avatar || 'https://placehold.co/150/dfe6e9/fff?text=User'}" class="w-14 h-14 rounded-full border-2 border-slate-100 object-cover shadow-sm">
                    <div>
                        <h4 class="font-bold text-slate-800 text-lg">${applicant.fullName || applicant.username}</h4>
                        <p class="text-sm text-slate-500 mb-2"><i class="fas fa-envelope mr-1"></i> ${applicant.email || applicant.username}</p>
                        
                        <button onclick="viewApplicantCV('${applicant.fullName || 'Ung_vien'}')" class="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 w-fit mt-1">
                            <i class="fas fa-file-pdf text-red-500"></i> Xem CV đính kèm
                        </button>

                    </div>
                </div>
                <div class="text-left md:text-right bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Ứng tuyển vị trí:</p>
                    <p class="font-bold text-blue-600">${job ? job.title : 'Tin tuyển dụng'}</p>
                </div>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="text-sm font-medium text-slate-400"><i class="fas fa-calendar-alt mr-1"></i> Nộp lúc: ${app.date}</div>
                <div class="flex items-center gap-3">${statusHtml}${actionBtns}</div>
            </div>
        </div>`;
    }).join('');
};

// --- HÀM GIẢ LẬP MỞ CV ---
window.viewApplicantCV = function(applicantName) {
    const dummyPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    window.open(dummyPdfUrl, '_blank');
};

window.processCV = function(appId, newStatus) {
    if (!confirm(`Xác nhận ${newStatus === 'approved' ? 'DUYỆT' : 'TỪ CHỐI'} hồ sơ ứng viên này?`)) return;
    
    let applications = JSON.parse(localStorage.getItem('user_applications')) || [];
    let appIndex = applications.findIndex(a => a.id === appId);
    
    if (appIndex !== -1) {
        applications[appIndex].status = newStatus;
        localStorage.setItem('user_applications', JSON.stringify(applications));
        
        // Gọi lại 2 hàm để render lại danh sách và cập nhật Menu
        loadEmployerCVs(); 
    }
};

// =================================================================
// BẢN VÁ LỖI CUỐI CÙNG: ĐỒNG BỘ CHÌA KHÓA DỮ LIỆU & ÉP KIỂU SỐ
// =================================================================

// 1. Sửa lỗi Quản lý Tin (Hiện cả tin chờ duyệt và sửa nút Bấm)
window.loadEmployerJobs = function() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    const tbody = document.getElementById('employer-jobs-tbody') || document.querySelector('#view-manage-jobs tbody') || document.querySelector('tbody');
    if(!tbody) return;

    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const approvedIds = JSON.parse(localStorage.getItem('admin_approved_jobs')) || [];
    const safeApprovedIds = approvedIds.map(id => String(id));

    // BẮT BỆNH SỐ 1: CHÌA KHÓA ĐÚNG LÀ ownerEmail
    let myJobs = customJobs.filter(j => j.ownerEmail === user.username);

    if (myJobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-500 font-medium">Bạn chưa đăng tin tuyển dụng nào.</td></tr>';
        return;
    }

    tbody.innerHTML = myJobs.map(j => {
        const isApproved = safeApprovedIds.includes(String(j.id));
        let statusHtml = '', actionHtml = '';

        if (isApproved) {
            statusHtml = '<span class="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200"><i class="fas fa-check-circle mr-1"></i> Đang hiển thị</span>';
            actionHtml = `
                <button onclick="openEditJobModal(${j.id})" class="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition mr-1" title="Sửa tin"><i class="fas fa-edit"></i></button>
                <button onclick="deleteJob(${j.id})" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="Xóa tin"><i class="fas fa-trash"></i></button>
            `;
        } else {
            statusHtml = '<span class="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200 animate-pulse"><i class="fas fa-clock mr-1"></i> Chờ duyệt</span>';
            actionHtml = `
                <button onclick="openEditJobModal(${j.id})" class="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition mr-1" title="Sửa bản nháp"><i class="fas fa-edit"></i></button>
                <button onclick="deleteJob(${j.id})" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="Rút lại tin này"><i class="fas fa-trash"></i></button>
            `;
        }

        return `<tr class="border-b border-slate-100 hover:bg-slate-50 transition"><td class="py-4 px-6 font-bold text-slate-800">${j.title}</td><td class="py-4 px-6 text-slate-600">${j.salary || 'Thỏa thuận'}</td><td class="py-4 px-6">${statusHtml}</td><td class="py-4 px-6 text-slate-500"><i class="fas fa-eye mr-1"></i> ${isApproved ? Math.floor((j.id % 50) + 10) : 0}</td><td class="py-4 px-6 text-right whitespace-nowrap">${actionHtml}</td></tr>`;
    }).join('');
};

// Biến lưu trữ đồ thị để chống lỗi ghi đè (Memory Leak)
window.empChartInstance = null; 

// Biến lưu trữ đồ thị
window.empChartInstance = null; 

// =================================================================
// BẢN CHỐT: ĐỒNG BỘ ĐÚNG TÊN TAB ('overview', 'manage-jobs') VÀ CHART.JS
// =================================================================

// 1. AUTO-HOOK: Bắt cóc hàm chuyển tab để bơm dữ liệu chuẩn xác 100%
(function autoHookNavigation() {
    if (typeof window.switchAdminView === 'function') {
        if (!window.switchAdminView.isHooked) {
            const originalSwitch = window.switchAdminView;
            window.switchAdminView = function(viewId) {
                originalSwitch(viewId); // Chuyển giao diện HTML
                
                // Chờ 50ms cho giao diện mở ra rồi mới vẽ dữ liệu (Sửa lỗi biểu đồ tàng hình)
                setTimeout(() => {
                    if (viewId === 'overview') {
                        if (typeof updateEmployerDashboardStats === 'function') updateEmployerDashboardStats();
                    }
                    if (viewId === 'manage-jobs') {
                        if (typeof loadEmployerJobs === 'function') loadEmployerJobs();
                    }
                    if (viewId === 'candidates') {
                        if (typeof loadEmployerCVs === 'function') loadEmployerCVs();
                    }
                }, 50);
            };
            window.switchAdminView.isHooked = true; // Đánh dấu là đã bắt cóc thành công
        }
    } else {
        setTimeout(autoHookNavigation, 100); // Đợi nếu hàm HTML chưa kịp load
    }
})();

// Biến toàn cục để lưu và reset biểu đồ
window.empChartInstance = null; 
// =================================================================
// SIÊU ĐỘNG CƠ DOANH NGHIỆP V11: FIX BIỂU ĐỒ - TÌM KIẾM - SORTING
// =================================================================

// 0. Bộ lọc trạng thái toàn cục cho Doanh nghiệp
window.empFilters = {
    jobs: { sortCol: 'id', sortDir: 'desc' },
    cvs: { sortCol: 'id', sortDir: 'desc' }
};

// 1. HÀM TỔNG QUAN (Vẽ biểu đồ CSS Bất tử - Bản vá lỗi cột)
window.updateEmployerDashboardStats = function() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const approvedIds = (JSON.parse(localStorage.getItem('admin_approved_jobs')) || []).map(id => String(id));
    let myJobs = customJobs.filter(j => j.ownerEmail === user.username || j.employerEmail === user.username);
    let activeJobs = myJobs.filter(j => approvedIds.includes(String(j.id)));

    // A. Thống kê số liệu
    if(document.getElementById('emp-stat-jobs')) document.getElementById('emp-stat-jobs').innerText = activeJobs.length;
    let totalViews = 0; activeJobs.forEach(j => { totalViews += Math.floor((j.id % 50) + 12); });
    if(document.getElementById('emp-stat-views')) document.getElementById('emp-stat-views').innerText = totalViews;
    let applications = JSON.parse(localStorage.getItem('user_applications')) || [];
    let myJobIds = myJobs.map(j => String(j.id));
    let pendingCVs = applications.filter(a => myJobIds.includes(String(a.jobId)) && a.status === 'pending');
    if(document.getElementById('emp-stat-cvs')) document.getElementById('emp-stat-cvs').innerText = pendingCVs.length;

    // B. Chiến dịch gần đây (Cột phải)
    const campaignBox = document.getElementById('emp-recent-campaigns');
    if (campaignBox) {
        let recent = [...myJobs].sort((a, b) => b.id - a.id).slice(0, 5);
        campaignBox.innerHTML = recent.length === 0 ? '<div class="text-center py-10 text-slate-400 text-sm">Chưa có tin đăng</div>' : 
            recent.map(j => {
                const isAppr = approvedIds.includes(String(j.id));
                const cvCount = applications.filter(a => String(a.jobId) === String(j.id)).length;
                return `<div class="p-4 border border-slate-100 rounded-xl bg-slate-50 mb-3"><div class="flex justify-between items-start mb-2"><h4 class="font-bold text-sm text-slate-800 truncate pr-2">${j.title}</h4><span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isAppr ? 'bg-green-100 text-green-600':'bg-amber-100 text-amber-600'}">${isAppr ? 'Đang chạy':'Chờ duyệt'}</span></div><div class="flex justify-between text-[11px] text-slate-500"><span>👁️ ${isAppr ? Math.floor((j.id%50)+12) : 0} lượt xem</span><span>📄 ${cvCount} CV ứng tuyển</span></div></div>`;
            }).join('');
    }

    // C. VẼ BIỂU ĐỒ (BẢN FIX CHỐT HẠ)
    const chartBox = document.getElementById('employer-chart-container');
    if (chartBox) {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            last7Days.push(`${d.getDate()}/${d.getMonth() + 1}`);
        }
        
        let barHtml = '<div class="flex items-end justify-between h-48 w-full gap-2 border-b border-slate-100 pb-1">';
        last7Days.forEach((day, idx) => {
            // Tạo dữ liệu giả lập cho từng ngày
            const hV = Math.floor(Math.random() * 60) + 15; // Lượt xem (cao hơn)
            const hA = Math.floor(Math.random() * 25) + 5;  // Lượt nộp (thấp hơn)
            
            barHtml += `
            <div class="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div class="absolute -top-10 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xl whitespace-nowrap">
                    Xem: ${hV+idx} | Nộp: ${hA}
                </div>
                <div class="flex items-end gap-1 w-full justify-center">
                    <div class="w-3 sm:w-4 bg-blue-500 rounded-t-sm transition-all duration-700 hover:bg-blue-600" style="height:${hV}%"></div>
                    <div class="w-3 sm:w-4 bg-emerald-500 rounded-t-sm transition-all duration-700 hover:bg-emerald-600" style="height:${hA}%"></div>
                </div>
                <span class="text-[10px] text-slate-400 mt-2 font-medium">${day}</span>
            </div>`;
        });
        barHtml += '</div>';
        
        // Ghi chú dưới biểu đồ
        barHtml += `<div class="flex justify-center gap-6 mt-4"><div class="flex items-center gap-1.5"><span class="w-3 h-3 bg-blue-500 rounded-sm"></span><span class="text-[11px] font-bold text-slate-600">Lượt xem</span></div><div class="flex items-center gap-1.5"><span class="w-3 h-3 bg-emerald-500 rounded-sm"></span><span class="text-[11px] font-bold text-slate-600">Lượt nộp CV</span></div></div>`;
        
        chartBox.innerHTML = barHtml;
    }
};

// 2. HÀM QUẢN LÝ TIN (CÓ TÌM KIẾM & SORT)
window.sortEmpJobs = function(col) {
    if (empFilters.jobs.sortCol === col) empFilters.jobs.sortDir = empFilters.jobs.sortDir === 'asc' ? 'desc' : 'asc';
    else { empFilters.jobs.sortCol = col; empFilters.jobs.sortDir = 'asc'; }
    loadEmployerJobs();
};

window.loadEmployerJobs = function() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const tbody = document.getElementById('employer-jobs-tbody');
    if(!tbody) return;

    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const approvedIds = (JSON.parse(localStorage.getItem('admin_approved_jobs')) || []).map(id => String(id));
    let myJobs = customJobs.filter(j => j.ownerEmail === user.username || j.employerEmail === user.username);

    // TÌM KIẾM
    const keyword = (document.getElementById('search-emp-jobs')?.value || '').toLowerCase().trim();
    if (keyword) {
        myJobs = myJobs.filter(j => j.title.toLowerCase().includes(keyword));
    }

    // SẮP XẾP
    const { sortCol, sortDir } = empFilters.jobs;
    myJobs.sort((a, b) => {
        let vA = a[sortCol], vB = b[sortCol];
        if (sortCol === 'views') { vA = Math.floor(a.id % 50); vB = Math.floor(b.id % 50); }
        if (vA < vB) return sortDir === 'asc' ? -1 : 1;
        if (vA > vB) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    if (myJobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-12 text-slate-400 font-medium">Không tìm thấy tin nào.</td></tr>';
        return;
    }

    tbody.innerHTML = myJobs.map(j => {
        const isAppr = approvedIds.includes(String(j.id));
        return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
            <td class="py-5 px-6 font-bold text-slate-800">${j.title}</td>
            <td class="py-5 px-6 text-slate-600 text-sm">${j.salary || 'Thỏa thuận'}</td>
            <td class="py-5 px-6">
                <span class="px-3 py-1.5 rounded-full text-[11px] font-bold border ${isAppr ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}">
                    ${isAppr ? 'Đang hiển thị' : 'Chờ duyệt'}
                </span>
            </td>
            <td class="py-5 px-6 text-slate-500 text-sm"><i class="fas fa-eye mr-1 opacity-50"></i> ${isAppr ? Math.floor((j.id % 50) + 12) : 0}</td>
            <td class="py-5 px-6 text-right">
                <div class="flex justify-end gap-2">
                    <button onclick="editJob(${j.id})" class="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteJob(${j.id})" class="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');
};

// 3. HÀM HỒ SƠ ỨNG VIÊN (CÓ TÌM KIẾM & XEM CV)
window.loadEmployerCVs = function() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const container = document.getElementById('employer-cvs-container');
    if(!container) return;

    const customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const myJobIds = customJobs.filter(j => j.ownerEmail === user.username || j.employerEmail === user.username).map(j => String(j.id));
    
    let apps = JSON.parse(localStorage.getItem('user_applications')) || [];
    let myCVs = apps.filter(a => myJobIds.includes(String(a.jobId)));
    
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];

    // TÌM KIẾM
    const keyword = (document.getElementById('search-emp-cvs')?.value || '').toLowerCase().trim();
    if (keyword) {
        myCVs = myCVs.filter(app => {
            const applicant = allUsers.find(u => u.username === app.userId) || {};
            const job = customJobs.find(j => String(j.id) === String(app.jobId)) || {};
            return (applicant.fullName || '').toLowerCase().includes(keyword) || 
                   (job.title || '').toLowerCase().includes(keyword);
        });
    }

    myCVs.sort((a, b) => b.id - a.id);

    if (myCVs.length === 0) {
        container.innerHTML = '<div class="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">Không tìm thấy hồ sơ nào.</div>';
        return;
    }

    container.innerHTML = myCVs.map(app => {
        const job = customJobs.find(j => String(j.id) === String(app.jobId));
        const applicant = allUsers.find(u => u.username === app.userId) || { fullName: 'Ứng viên', username: app.userId };
        
        let statusTag = app.status === 'approved' ? '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Đã Duyệt</span>' :
                        (app.status === 'rejected' ? '<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Đã Từ chối</span>' :
                        '<span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 animate-pulse">Chờ duyệt</span>');

        return `
        <div class="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition group">
            <div class="flex flex-col md:flex-row justify-between gap-6">
                <div class="flex items-center gap-4">
                    <img src="${applicant.avatar || './assets/logouser.png'}" class="w-16 h-16 rounded-full border-2 border-slate-100 object-cover">
                    <div>
                        <h4 class="font-black text-slate-800 text-lg group-hover:text-blue-600 transition">${applicant.fullName || applicant.username}</h4>
                        <p class="text-sm text-slate-500 mb-2"><i class="fas fa-envelope mr-1 opacity-50"></i> ${applicant.username}</p>
                        <button onclick="window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf','_blank')" class="text-[10px] uppercase tracking-widest bg-slate-900 text-white px-3 py-1.5 rounded-lg font-black hover:bg-blue-600 transition">
                            <i class="fas fa-file-pdf mr-1"></i> Xem CV đính kèm
                        </button>
                    </div>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 md:text-right min-w-[200px]">
                    <p class="text-[10px] text-slate-400 font-black uppercase mb-1">Vị trí ứng tuyển</p>
                    <p class="font-bold text-slate-700">${job ? job.title : 'N/A'}</p>
                    <div class="mt-2">${statusTag}</div>
                </div>
            </div>
            ${app.status === 'pending' ? `
            <div class="mt-6 pt-6 border-t border-slate-50 flex justify-end gap-3">
                <button onclick="processCV(${app.id}, 'approved')" class="bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-emerald-600 shadow-md transition">CHẤP THUẬN CV</button>
                <button onclick="processCV(${app.id}, 'rejected')" class="bg-white text-red-500 border border-red-100 px-6 py-2 rounded-xl text-sm font-black hover:bg-red-50 transition">TỪ CHỐI</button>
            </div>` : ''}
        </div>`;
    }).join('');
};

// 4. SIÊU ĐIỀU KHIỂN & BẮT CÓC HÀM GỐC (TRỊ DỨT ĐIỂM TRẮNG TRANG)
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('doanhnghiep.html')) {
        // Khởi tạo ngay lập tức
        setTimeout(() => {
            updateEmployerDashboardStats();
            loadEmployerJobs();
            loadEmployerCVs();
            if(typeof syncEmployerHeader === 'function') syncEmployerHeader();
        }, 300);

        // BẮT CÓC switchAdminView: Hễ bấm Menu là nạp lại dữ liệu tương ứng
        if (typeof window.switchAdminView === 'function') {
            const originalSwitch = window.switchAdminView;
            window.switchAdminView = function(viewId) {
                originalSwitch(viewId);
                setTimeout(() => {
                    if (viewId === 'overview') updateEmployerDashboardStats();
                    if (viewId === 'manage-jobs') loadEmployerJobs();
                    if (viewId === 'candidates') loadEmployerCVs();
                }, 100);
            };
        }
    }
});
// =================================================================
// KHÔI PHỤC CHỨC NĂNG SỬA TIN (DÙNG MODAL) & XÓA TIN (ĐÃ THÔNG ADMIN)
// =================================================================

// 1. HÀM MỞ MODAL SỬA TIN (Khôi phục từ bản gốc của Lead)
window.editJob = function(id) {
    const customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const job = customJobs.find(j => String(j.id) === String(id));
    if(!job) {
        alert("❌ Không tìm thấy dữ liệu tin tuyển dụng!");
        return;
    }

    // Ưu tiên hiển thị dữ liệu: Bản nháp mới nhất > Bản đang chờ duyệt > Bản gốc đang chạy
    const data = job.draft ? { ...job, ...job.draft } : (job.pendingUpdate ? { ...job, ...job.pendingUpdate } : job);

    // Đổ dữ liệu vào đúng các ID Modal trong doanhnghiep.html
    document.getElementById('edit-job-id').value = job.id;
    document.getElementById('edit-job-title').value = data.title || '';
    document.getElementById('edit-job-industry').value = (data.tags || []).join('; ');
    document.getElementById('edit-job-salary').value = data.salary || '';
    document.getElementById('edit-job-location').value = data.location || '';
    
    // Xử lý xuống dòng cho Textarea
    document.getElementById('edit-job-desc').value = (data.description || '').replace(/<br>/g, '\n');
    document.getElementById('edit-job-req').value = (data.requirements || '').replace(/<br>/g, '\n');
    document.getElementById('edit-job-benefit').value = (data.benefits || '').replace(/<br>/g, '\n');

    // Kiểm tra trạng thái nút Gửi duyệt
    if (typeof checkJobSubmitStatus === 'function') checkJobSubmitStatus(job);
    
    // Mở Modal lên
    const modal = document.getElementById('employer-edit-modal');
    if(modal) modal.classList.remove('hidden');
};

// 2. HÀM LƯU NHÁP TRONG MODAL
window.submitEditJob = function(event) {
    if (event) event.preventDefault();
    const id = document.getElementById('edit-job-id').value;
    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const jobIndex = customJobs.findIndex(j => String(j.id) === String(id));
    
    if(jobIndex === -1) return;

    // Thu thập dữ liệu từ Modal
    const tagsArray = document.getElementById('edit-job-industry').value.split(';').map(t => t.trim()).filter(t => t !== '');

    // Cập nhật vào trường DRAFT (Bản nháp cục bộ)
    customJobs[jobIndex].draft = {
        title: document.getElementById('edit-job-title').value,
        tags: tagsArray.length > 0 ? tagsArray : ['Chưa phân loại'],
        salary: document.getElementById('edit-job-salary').value,
        location: document.getElementById('edit-job-location').value,
        description: document.getElementById('edit-job-desc').value.replace(/\n/g, '<br>'),
        requirements: document.getElementById('edit-job-req').value.replace(/\n/g, '<br>'),
        benefits: document.getElementById('edit-job-benefit').value.replace(/\n/g, '<br>')
    };

    localStorage.setItem('custom_jobs', JSON.stringify(customJobs));
    alert("✅ Đã lưu thay đổi vào bản nháp! Bạn nhớ bấm 'Gửi duyệt lại' để Admin phê duyệt nhé.");
    
    // Cập nhật lại nút Gửi duyệt
    if (typeof checkJobSubmitStatus === 'function') checkJobSubmitStatus(customJobs[jobIndex]);
};

// 3. HÀM GỬI DUYỆT LẠI (ĐẨY SANG ADMIN)
window.requestJobApproval = function() {
    const id = document.getElementById('edit-job-id').value;
    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    const jobIndex = customJobs.findIndex(j => String(j.id) === String(id));
    
    if (jobIndex !== -1 && customJobs[jobIndex].draft) {
        if (!confirm("Xác nhận gửi bản hiệu chỉnh này cho Admin phê duyệt?")) return;
        
        // Chuyển từ Draft (Nháp) sang PendingUpdate (Chờ duyệt)
        customJobs[jobIndex].pendingUpdate = { ...customJobs[jobIndex].draft };
        delete customJobs[jobIndex].draft; // Xóa nháp cũ
        
        localStorage.setItem('custom_jobs', JSON.stringify(customJobs));
        
        // Gỡ án phạt khỏi sổ đen Admin (nếu có) để tin được hiện lại sau khi duyệt
        let deletedIds = JSON.parse(localStorage.getItem('admin_deleted_jobs')) || [];
        deletedIds = deletedIds.filter(dId => String(dId) !== String(id));
        localStorage.setItem('admin_deleted_jobs', JSON.stringify(deletedIds));

        alert("🚀 Đã gửi đơn yêu cầu phê duyệt thành công!");
        
        // Đóng modal và load lại bảng
        if (typeof closeEditJobModal === 'function') closeEditJobModal();
        if (typeof loadEmployerJobs === 'function') loadEmployerJobs();
        if (typeof updateEmployerNotifications === 'function') updateEmployerNotifications();
    } else {
        alert("💡 Bạn chưa thay đổi thông tin nào mới để gửi duyệt.");
    }
};

// 4. HÀM ĐÓNG MODAL
window.closeEditJobModal = function() {
    const modal = document.getElementById('employer-edit-modal');
    if(modal) modal.classList.add('hidden');
};

// 5. GIỮ NGUYÊN HÀM XÓA (VÌ ĐÃ CHẠY ĐÚNG)
window.deleteJob = function(jobId) {
    if (!confirm("⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN tin tuyển dụng này?\nDữ liệu sẽ biến mất khỏi hệ thống!")) return;

    let customJobs = JSON.parse(localStorage.getItem('custom_jobs')) || [];
    let approvedIds = JSON.parse(localStorage.getItem('admin_approved_jobs')) || [];
    let deletedIds = JSON.parse(localStorage.getItem('admin_deleted_jobs')) || [];

    // Xóa sạch dấu vết ở mọi kho
    const newJobs = customJobs.filter(j => String(j.id) !== String(jobId));
    const newApprovedIds = approvedIds.filter(id => String(id) !== String(jobId));
    const newDeletedIds = deletedIds.filter(id => String(id) !== String(jobId));

    localStorage.setItem('custom_jobs', JSON.stringify(newJobs));
    localStorage.setItem('admin_approved_jobs', JSON.stringify(newApprovedIds));
    localStorage.setItem('admin_deleted_jobs', JSON.stringify(newDeletedIds));

    alert("✅ Đã xóa tin thành công!");
    if (typeof loadEmployerJobs === 'function') loadEmployerJobs();
    if (typeof updateEmployerDashboardStats === 'function') updateEmployerDashboardStats();
};