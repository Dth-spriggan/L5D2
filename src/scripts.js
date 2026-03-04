// Đợi load xong HTML rồi mới chạy JS
document.addEventListener("DOMContentLoaded", function () {

    // ===== LẤY PHẦN TỬ =====
    const overlay = document.getElementById("overlay");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const authButtons = document.getElementById("authButtons");

    // ===== MỞ LOGIN =====
    window.openLogin = function () {
        overlay.classList.remove("hidden");
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
    };

    // ===== MỞ REGISTER =====
    window.openRegister = function () {
        overlay.classList.remove("hidden");
        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
    };

    // ===== ĐÓNG MODAL =====
    window.closeModal = function () {
        overlay.classList.add("hidden");
        loginForm.classList.add("hidden");
        registerForm.classList.add("hidden");
    };

    // ===== ĐĂNG KÝ =====
    window.register = function () {
        const username = document.getElementById("registerUsername").value;
        const password = document.getElementById("registerPassword").value;
        const confirm = document.getElementById("confirmPassword").value;

        if (!username || !password) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (password !== confirm) {
            alert("Mật khẩu không khớp!");
            return;
        }

        localStorage.setItem("user", username);
        localStorage.setItem("pass", password);

        alert("Đăng ký thành công!");
        closeModal();
    };

    // ===== ĐĂNG NHẬP =====
    window.login = function () {
        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        const savedUser = localStorage.getItem("user");
        const savedPass = localStorage.getItem("pass");

        if (username === savedUser && password === savedPass) {
            alert("Đăng nhập thành công!");

            authButtons.innerHTML = `
                <span class="font-medium text-gray-700">
                    Xin chào, ${username}
                </span>
                <button onclick="logout()"
                    class="bg-red-500 text-white px-4 py-2 rounded-lg">
                    Đăng xuất
                </button>
            `;

            closeModal();
        } else {
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    };

    // ===== ĐĂNG XUẤT =====
    window.logout = function () {
        location.reload();
    };

});