document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const usernameError = document.getElementById('usernameError');
  const passwordError = document.getElementById('passwordError');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const submitBtn = document.getElementById('submitBtn');
  const rememberMe = document.getElementById('rememberMe');

  // ===== แสดง/ซ่อนรหัสผ่าน =====
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.querySelector('.material-symbols-outlined').textContent =
      isPassword ? 'visibility_off' : 'visibility';
  });

  // ===== โหลดค่า "จดจำฉัน" ถ้ามีบันทึกไว้ =====
  const savedUsername = localStorage.getItem('staff_remember_username');
  if (savedUsername) {
    usernameInput.value = savedUsername;
    rememberMe.checked = true;
  }

  // ===== Validate ก่อน submit =====
  function validate() {
    let valid = true;
    usernameError.textContent = '';
    passwordError.textContent = '';
    usernameInput.classList.remove('error');
    passwordInput.classList.remove('error');

    if (!usernameInput.value.trim()) {
      usernameError.textContent = 'กรุณากรอกชื่อผู้ใช้งาน';
      usernameInput.classList.add('error');
      valid = false;
    }
    if (!passwordInput.value.trim()) {
      passwordError.textContent = 'กรุณากรอกรหัสผ่าน';
      passwordInput.classList.add('error');
      valid = false;
    } else if (passwordInput.value.length < 6) {
      passwordError.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      passwordInput.classList.add('error');
      valid = false;
    }
    return valid;
  }

  // ===== Submit form =====
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // จัดการ "จดจำฉัน"
    if (rememberMe.checked) {
      localStorage.setItem('staff_remember_username', usernameInput.value.trim());
    } else {
      localStorage.removeItem('staff_remember_username');
    }

    submitBtn.disabled = true;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;">progress_activity</span> กำลังเข้าสู่ระบบ...`;

    try {
      // 👉 TODO: เปลี่ยนเป็น fetch ไปยัง API จริงของระบบ เช่น
      // const res = await fetch('/api/auth/login', { method:'POST', body: JSON.stringify({...}) });

      await new Promise(r => setTimeout(r, 1200)); // demo delay
      alert('เข้าสู่ระบบสำเร็จ (Demo) — เชื่อมต่อ API จริงได้ที่ staff-login.js');
      // window.location.href = '/staff/dashboard.html';

    } catch (err) {
      alert('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  });
});

// เพิ่ม animation หมุนสำหรับ loading icon
const style = document.createElement('style');
style.textContent = `@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`;
document.head.appendChild(style);