// ======================
// MỞ FORM
// ======================

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


// ======================
// ĐĂNG KÝ
// ======================

function register() {
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (!username || !password) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    if (password !== confirm) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    if (localStorage.getItem(username)) {
        alert("Tên người dùng đã tồn tại!");
        return;
    }

    localStorage.setItem(username, password);
    alert("Đăng ký thành công!");

    closeModal();
}


// ======================
// ĐĂNG NHẬP
// ======================

function login() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    const storedPassword = localStorage.getItem(username);

    if (!storedPassword) {
        alert("Tài khoản không tồn tại!");
        return;
    }

    if (storedPassword !== password) {
        alert("Sai mật khẩu!");
        return;
    }

    localStorage.setItem("loggedInUser", username);

    updateHeader(username);
    closeModal();
}


// ======================
// ĐĂNG XUẤT
// ======================

function logout() {
    localStorage.removeItem("loggedInUser");
    location.reload();
}


// ======================
// CẬP NHẬT HEADER
// ======================

function updateHeader(username) {
    const authButtons = document.getElementById("authButtons");

    authButtons.innerHTML = `
        <span class="text-gray-700 font-medium">
            Xin chào, ${username}
        </span>
        <button onclick="logout()" 
            class="text-red-500 hover:underline font-medium">
            Đăng xuất
        </button>
    `;
}


// ======================
// KIỂM TRA ĐĂNG NHẬP KHI LOAD
// ======================

window.onload = function () {
    const user = localStorage.getItem("loggedInUser");

    if (user) {
        updateHeader(user);
    }
};