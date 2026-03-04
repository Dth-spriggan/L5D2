// =============================
// MỞ FORM
// =============================

function openLogin() {
    const overlay = document.getElementById("overlay");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    overlay.classList.remove("hidden");
    overlay.classList.add("flex");

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
}

function openRegister() {
    const overlay = document.getElementById("overlay");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    overlay.classList.remove("hidden");
    overlay.classList.add("flex");

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
}

function closeModal() {
    const overlay = document.getElementById("overlay");
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
}


// =============================
// ĐĂNG KÝ
// =============================

function register() {
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!username || !password || !confirmPassword) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp");
        return;
    }

    if (localStorage.getItem(username)) {
        alert("Tên người dùng đã tồn tại");
        return;
    }

    localStorage.setItem(username, password);
    alert("Đăng ký thành công!");
    closeModal();
}


// =============================
// ĐĂNG NHẬP
// =============================

function login() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!username || !password) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    const storedPassword = localStorage.getItem(username);

    if (!storedPassword) {
        alert("Tài khoản không tồn tại");
        return;
    }

    if (storedPassword !== password) {
        alert("Sai mật khẩu");
        return;
    }

    alert("Đăng nhập thành công!");
    closeModal();
}


// =============================
// ĐÓNG MODAL KHI CLICK RA NGOÀI
// =============================

window.addEventListener("click", function (event) {
    const overlay = document.getElementById("overlay");
    if (event.target === overlay) {
        closeModal();
    }
});