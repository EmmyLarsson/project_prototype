'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const menuEdit  = document.getElementById('menuEdit');
    const menuPhone = document.getElementById('menuPhone');
    const btnLogout = document.getElementById('btnLogout');
    const MAIN_TABS = ['home', 'history', 'profile'];
    const bottomNav = document.querySelector('.bottom-nav');
    const navItems = document.querySelectorAll('.nav-it');


    /* ── 1. Tab Navigation ── */
    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            if (page === 'home')    { window.location.href = 'home.html';    return; }
            if (page === 'history') { window.location.href = 'history.html'; return; }
            // profile → อยู่หน้านี้แล้ว
        });
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
        });
    });

    /* ── 2. แก้ไขข้อมูล ── */
    menuEdit.addEventListener('click', () => {
        console.log('[Profile] แก้ไขข้อมูล');
        window.location.href = 'profile_edit.html';
    });

    /* ── 3. เบอร์โทร ── */
    menuPhone.addEventListener('click', () => {
        console.log('[Profile] เบอร์โทรติดต่อ');
        // window.location.href = 'profile-phone.html';
    });

    /* ── 4. Logout ── */
    btnLogout.addEventListener('click', () => {
        const ok = window.confirm('ต้องการออกจากระบบหรือไม่?');
        if (ok) {
            console.log('[Profile] ออกจากระบบ');
            // sessionStorage.clear();
            // window.location.href = 'login.html';
        }
    });

    
    if (sessionStorage.getItem('fromMainTab') === '1') {
        bottomNav.classList.add('no-anim');
    }

    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
        const page = btn.dataset.page;

        if (MAIN_TABS.includes(page)) {
            sessionStorage.setItem('fromMainTab', '1');
        } else {
            sessionStorage.removeItem('fromMainTab');
        }

        navItems.forEach(n => n.classList.remove('active'));
        btn.classList.add('active');

        console.log('[Nav] →', page);
        window.location.href = `${page}.html`;
        });
    });

});