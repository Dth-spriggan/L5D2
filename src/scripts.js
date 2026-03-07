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
const mockJobs = [
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
    const jobId = parseInt(urlParams.get('id'));

    // Nếu không có ID trên URL, đá về trang chủ
    if (!jobId) {
        window.location.href = 'index.html';
        return;
    }

    // Tìm công việc trong mảng mockJobs dựa vào ID
    const job = mockJobs.find(j => j.id === jobId);

    if (!job) {
        alert('Không tìm thấy công việc này!');
        window.location.href = 'listvieclam.html';
        return;
    }

    // Đổ dữ liệu vào các thẻ HTML đã đánh sẵn ID
    document.getElementById('detail-title').innerText = job.title;
    document.getElementById('detail-company').innerText = job.company;
    document.getElementById('detail-salary').innerText = job.salary;
    document.getElementById('detail-location').innerText = job.location;
    
    if(document.getElementById('detail-logo')) {
        document.getElementById('detail-logo').src = job.logo;
    }

    // Đổ mảng Tags (Kỹ năng)
    const tagsContainer = document.getElementById('detail-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = job.tags.map(tag => `<span class="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-lg border border-blue-100 font-medium">${tag}</span>`).join('');
    }
    // Nối tiếp vào hàm loadJobDetail() hiện tại
    document.getElementById('detail-description').innerHTML = job.description || 'Chưa có mô tả công việc.';
    document.getElementById('detail-requirements').innerHTML = job.requirements || 'Chưa có yêu cầu.';
    document.getElementById('detail-benefits').innerHTML = job.benefits || 'Chưa có thông tin phúc lợi.';
};

// Hàm xử lý nút Ứng tuyển & Lưu tin
window.handleJobAction = function(actionType) {
    // Phục hồi lại dòng lấy thông tin user để làm chìa khóa lưu LocalStorage
    const currentUser = localStorage.getItem('currentUser') || 'guest';

    if (actionType === 'apply') {
        // Mở Popup nộp CV
        const modal = document.getElementById('apply-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    } else if (actionType === 'save') {
        const urlParams = new URLSearchParams(window.location.search);
        const currentJobId = parseInt(urlParams.get('id'));

        if (!currentJobId) return;

        // Dùng currentUser làm tên kho lưu trữ riêng cho từng người
        const storageKey = `savedJobs_${currentUser}`; 
        let savedJobs = JSON.parse(localStorage.getItem(storageKey)) || [];

        if (!savedJobs.includes(currentJobId)) {
            savedJobs.push(currentJobId);
            localStorage.setItem(storageKey, JSON.stringify(savedJobs));
            
            alert('Đã lưu công việc thành công! Dữ liệu đã sẵn sàng cho nhánh user-ui.');
        } else {
            alert('Bạn đã lưu công việc này từ trước rồi!');
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

// Hàm giả lập Submit CV
window.submitApplication = function(event) {
    event.preventDefault(); // Ngăn load lại trang
    
    const btn = document.getElementById('submit-cv-btn');
    const originalText = btn.innerHTML;
    
    // Đổi trạng thái nút thành Đang tải (Loading)
    btn.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Đang gửi CV...`;
    btn.disabled = true;
    btn.classList.add('opacity-70', 'cursor-not-allowed');

    // Giả lập sau 1.5 giây thì gửi thành công
    setTimeout(() => {
        alert('🎉 Chúc mừng! CV của bạn đã được gửi tới Nhà tuyển dụng thành công!');
        closeApplyModal();
        
        // Trả lại trạng thái nút
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove('opacity-70', 'cursor-not-allowed');
    }, 1500);
};// =================================================================
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
    
    const btn = document.getElementById('submit-report-btn');
    const originalText = btn.innerHTML;
    
    // Hiệu ứng loading
    btn.innerHTML = `<svg class="animate-spin h-4 w-4 mr-2 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Đang gửi...`;
    btn.disabled = true;
    btn.classList.add('opacity-70', 'cursor-not-allowed');

    setTimeout(() => {
        alert('Cảm ơn bạn! Báo cáo đã được gửi đến Ban Quản Trị MidCV để xem xét xử lý.');
        closeReportModal();
        
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove('opacity-70', 'cursor-not-allowed');
    }, 1000);
};