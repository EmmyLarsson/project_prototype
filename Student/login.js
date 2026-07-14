/**
 * login.js
 * ระบบแจ้งซ่อมหอพักในกำกับ 10-11 มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // ── Element References ──────────────────────────────────
    const form     = document.getElementById('loginForm');
    const uInput   = document.getElementById('username');
    const pInput   = document.getElementById('password');
    const eyeBtn   = document.getElementById('togglePwd');
    const eyeIcon  = document.getElementById('eyeIcon');
    const remCk    = document.getElementById('rememberMe');
    const subBtn   = document.getElementById('submitBtn');
    const btnTxt   = document.getElementById('btnTxt');
    const spinner  = document.getElementById('spinner');
    const alertBox = document.getElementById('alertBox');
    const alertMsg = document.getElementById('alertMsg');
    const uErr     = document.getElementById('usernameErr');
    const pErr     = document.getElementById('passwordErr');

    // ── Init: Restore "remember me" username ────────────────
    const savedUser = localStorage.getItem('dorm_remember_user');
    if (savedUser) {
        uInput.value  = savedUser;
        remCk.checked = true;
    }

    // ══════════════════════════════════════════
    // 0. Mock User Database (ชั่วคราว — ยังไม่มี Backend)
    //    ⚠️ TODO: ลบส่วนนี้ทิ้งเมื่อเชื่อมต่อ API จริงแล้ว
    // ══════════════════════════════════════════
    const MOCK_USERS = [
        { username: 'student01',   password: '123456', role: 'student'    },
        { username: 'staff01',     password: '123456', role: 'staff'      },
        { username: 'tech01',      password: '123456', role: 'technician' },
        { username: 'admin',       password: 'admin123', role: 'admin'    },
    ];

    // ══════════════════════════════════════════
    // 1. Toggle Password Visibility
    // ══════════════════════════════════════════
    eyeBtn.addEventListener('click', () => {
        const isHidden = pInput.type === 'password';
        pInput.type          = isHidden ? 'text' : 'password';
        eyeIcon.textContent  = isHidden ? 'visibility_off' : 'visibility';
        eyeBtn.setAttribute('aria-label', isHidden ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน');
    });

    // ══════════════════════════════════════════
    // 2. Live Validation Clear (on typing)
    // ══════════════════════════════════════════
    uInput.addEventListener('input', () => {
        clrErr(uInput, uErr);
        hideAlert();
    });
    pInput.addEventListener('input', () => {
        clrErr(pInput, pErr);
        hideAlert();
    });

    // ══════════════════════════════════════════
    // 3. Form Submit Handler
    // ══════════════════════════════════════════
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();
        clrErr(uInput, uErr);
        clrErr(pInput, pErr);

        if (!validate()) return;

        setLoad(true);
        try {
            await doLogin(uInput.value.trim(), pInput.value);
        } catch (err) {
            showAlert(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
            // เน้นกรอบ input สีแดงทั้งคู่ เมื่อ login ไม่สำเร็จ
            uInput.classList.add('err');
            pInput.classList.add('err');
        } finally {
            setLoad(false);
        }
    });

    // ══════════════════════════════════════════
    // 4. Validate Fields (ตรวจสอบว่ากรอกครบก่อน)
    // ══════════════════════════════════════════
    function validate() {
        let ok = true;
        if (!uInput.value.trim()) {
            setErr(uInput, uErr, 'กรุณากรอกชื่อผู้ใช้งาน');
            ok = false;
        }
        if (!pInput.value) {
            setErr(pInput, pErr, 'กรุณากรอกรหัสผ่าน');
            ok = false;
        } else if (pInput.value.length < 6) {
            setErr(pInput, pErr, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            ok = false;
        }
        return ok;
    }

    // ══════════════════════════════════════════
    // 5. Login Logic
    //    ⚠️ TODO: เมื่อมี Backend จริง ให้ลบ Mock ด้านล่าง
    //    แล้วเปลี่ยนกลับไปใช้ fetch('/api/auth/login', ...)
    //    ตามโค้ดที่ comment ไว้ด้านล่างสุดของฟังก์ชันนี้
    // ══════════════════════════════════════════
    async function doLogin(username, password) {

        // จำลองเวลาหน่วง (loading) เพื่อ UX ที่สมจริง
        await new Promise((resolve) => setTimeout(resolve, 550));

        // ── ตรวจสอบกับ Mock user list ──
        const matchedUser = MOCK_USERS.find((u) => u.username === username);

        // กรณี: username ผิด, password ผิด, หรือผิดทั้งคู่
        // → แจ้งเตือนข้อความเดียวกันทุกกรณี (ไม่บอกว่าผิดจุดไหน เพื่อความปลอดภัย)
        if (!matchedUser || matchedUser.password !== password) {
            throw new Error('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
        }

        // ── กรณี: กรอกถูกต้อง ──

        // Handle remember me
        if (remCk.checked) {
            localStorage.setItem('dorm_remember_user', username);
        } else {
            localStorage.removeItem('dorm_remember_user');
        }

        // Store auth token & role (mock token)
        const store = remCk.checked ? localStorage : sessionStorage;
        store.setItem('dorm_token', 'mock-token-' + Date.now());
        store.setItem('dorm_role',  matchedUser.role);
        store.setItem('dorm_user',  matchedUser.username);

        // พาไปหน้า Home
        redirectTo();

        /* ═══════════════════════════════════════════════════
           📌 เมื่อเชื่อมต่อ Backend จริงแล้ว ให้ลบโค้ดด้านบนตั้งแต่
           "จำลองเวลาหน่วง" ถึง "redirectTo();" ทิ้งทั้งหมด
           แล้วแทนที่ด้วยโค้ดนี้:

        const res = await fetch('/api/auth/login', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ username, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
        }

        if (remCk.checked) {
            localStorage.setItem('dorm_remember_user', username);
        } else {
            localStorage.removeItem('dorm_remember_user');
        }

        const store = remCk.checked ? localStorage : sessionStorage;
        store.setItem('dorm_token', data.token);
        store.setItem('dorm_role',  data.role);

        redirectTo();
        ═══════════════════════════════════════════════════ */
    }

    // ══════════════════════════════════════════
    // 6. Redirect ไปหน้า Home
    // ══════════════════════════════════════════
    function redirectTo() {
        // ⚠️ TODO: เปลี่ยน path ให้ตรงกับโครงสร้างโปรเจกต์จริง
        window.location.href = 'home.html';
    }

    // ══════════════════════════════════════════
    // UI Helpers
    // ══════════════════════════════════════════
    function setLoad(on) {
        subBtn.disabled      = on;
        btnTxt.style.display = on ? 'none' : '';
        spinner.classList.toggle('hidden', !on);
    }

    function showAlert(msg) {
        alertMsg.textContent = msg;
        alertBox.classList.remove('hidden');
        // Re-trigger shake animation
        alertBox.style.animation = 'none';
        void alertBox.offsetHeight;
        alertBox.style.animation = '';
    }

    function hideAlert() {
        alertBox.classList.add('hidden');
        alertMsg.textContent = '';
    }

    function setErr(input, el, msg) {
        input.classList.add('err');
        el.textContent = msg;
    }

    function clrErr(input, el) {
        input.classList.remove('err');
        el.textContent = '';
    }

}); // end DOMContentLoaded
