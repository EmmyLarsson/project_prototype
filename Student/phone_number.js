/* ════════════════════════════════════════
   phone_contacts.js
   UniMaintain — Phone Contacts Page
════════════════════════════════════════ */

'use strict';

/* ── Back Button ──────────────────────── */
document.getElementById('btn-back')?.addEventListener('click', () => {
  // กลับหน้า profile — เปลี่ยน path ตาม routing จริง
  window.location.href = 'profile.html';
});

/* ── Copy Number ──────────────────────── */
const toast     = document.getElementById('copy-toast');
const toastText = toast?.querySelector('.toast-text');
let toastTimer  = null;

function showToast(phone) {
  if (!toast) return;

  // อัปเดตข้อความให้แสดงเบอร์ที่คัดลอก
  if (toastText) toastText.textContent = `คัดลอก ${phone} แล้ว`;

  // reset animation ก่อนแสดงซ้ำ
  toast.classList.remove('is-visible');
  void toast.offsetWidth; // force reflow

  toast.classList.add('is-visible');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2400);
}

async function copyPhone(phone, btn) {
  try {
    await navigator.clipboard.writeText(phone);
  } catch {
    // fallback สำหรับ browser เก่า
    const el = document.createElement('input');
    el.value = phone;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  // visual feedback บนปุ่ม
  const icon = btn.querySelector('.material-symbols-rounded');
  if (icon) {
    icon.textContent = 'check';
    btn.style.borderColor = '#1a6b3c';
    btn.style.color       = '#1a6b3c';

    setTimeout(() => {
      icon.textContent      = 'content_copy';
      btn.style.borderColor = '';
      btn.style.color       = '';
    }, 1800);
  }

  showToast(phone);
}

/* delegate click บน .btn-copy ทุกปุ่ม */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-copy');
  if (!btn) return;

  const phone = btn.dataset.phone;
  if (phone) copyPhone(phone, btn);
});

/* ── Call Button — touch feedback ──── */
document.querySelectorAll('.btn-call').forEach(btn => {
  btn.addEventListener('touchstart', () => btn.classList.add('active'), { passive: true });
  btn.addEventListener('touchend',   () => btn.classList.remove('active'), { passive: true });
});

/* ── Header scroll shadow ────────────── */
const header = document.querySelector('.app-header');
window.addEventListener('scroll', () => {
  if (!header) return;
  header.style.boxShadow = window.scrollY > 10
    ? '0 4px 20px rgba(112, 93, 0, 0.28)'
    : '0 2px 10px rgba(112, 93, 0, 0.18)';
}, { passive: true });
