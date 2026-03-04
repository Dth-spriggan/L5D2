console.log("JS CONNECTED");
function openLogin() {
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("overlay").classList.add("flex");
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("registerForm").classList.add("hidden");
}

function openRegister() {
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("overlay").classList.add("flex");
    document.getElementById("registerForm").classList.remove("hidden");
    document.getElementById("loginForm").classList.add("hidden");
}

function closeModal() {
    document.getElementById("overlay").classList.add("hidden");
    document.getElementById("overlay").classList.remove("flex");
}

function switchToRegister() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
}

function switchToLogin() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
}

function register() {
    let username = document.getElementById("registerUsername").value;
    let password = document.getElementById("registerPassword").value;
    let confirm = document.getElementById("confirmPassword").value;

    if (!username || !password) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    if (localStorage.getItem(username)) {
        alert("Tên người dùng đã tồn tại!");
        return;
    }

    if (password !== confirm) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    localStorage.setItem(username, password);
    alert("Đăng ký thành công!");
    switchToLogin();
}

function login() {
    let username = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;

    let storedPassword = localStorage.getItem(username);

    if (storedPassword === null) {
        alert("Tài khoản không tồn tại!");
    } else if (storedPassword === password) {
        alert("Đăng nhập thành công!");
        closeModal();
        document.getElementById("authButtons").innerHTML = `
            <span class="text-gray-700 font-medium">Xin chào, ${username}</span>
            <button onclick="logout()" class="text-red-500 hover:underline">Đăng xuất</button>
        `;
        localStorage.setItem("loggedInUser", username);
    } else {
        alert("Sai mật khẩu!");
    }
}

function logout() {
    localStorage.removeItem("loggedInUser");
    location.reload();
}

window.onload = function() {
    let user = localStorage.getItem("loggedInUser");
    if (user) {
        document.getElementById("authButtons").innerHTML = `
            <span class="text-gray-700 font-medium">Xin chào, ${user}</span>
            <button onclick="logout()" class="text-red-500 hover:underline">Đăng xuất</button>
        `;
    }
    console.log("APP RUNNING OK");
};