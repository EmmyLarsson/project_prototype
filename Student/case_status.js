/* ═══════════════════════════════════════════════════════
   progress_detail.js · UniMaintain
   Sections:
     1. Back Button
     2. Copy Phone Number
     3. Toast
═══════════════════════════════════════════════════════ */
'use strict';

/* ──────────────────────────────────────────────────────
   1. BACK BUTTON
────────────────────────────────────────────────────── */
document.getElementById('btn-back')?.addEventListener('click', () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = 'history.html';
  }
});

/* ──────────────────────────────────────────────────────
   2. COPY PHONE NUMBER
────────────────────────────────────────────────────── */
const btnCopy  = document.getElementById('btn-copy-phone');
const copyIcon = document.getElementById('copy-icon');

btnCopy?.addEventListener('click', async () => {
  const phone = btnCopy.dataset.phone ?? '';

  try {
    await navigator.clipboard.writeText(phone);
    onCopySuccess();
  } catch {
    const tmp = document.createElement('input');
    tmp.value = phone;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    onCopySuccess();
  }
});

function onCopySuccess() {
  copyIcon.textContent = 'check';
  btnCopy.classList.add('copied');
  showToast('คัดลอกเบอร์โทรแล้ว');

  setTimeout(() => {
    copyIcon.textContent = 'content_copy';
    btnCopy.classList.remove('copied');
  }, 2200);
}

/* ──────────────────────────────────────────────────────
   3. TOAST
────────────────────────────────────────────────────── */
let _toastTimer = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ──────────────────────────────────────────────────────
   4. MODAL รายละเอียดคำร้องแจ้งซ่อม
────────────────────────────────────────────────────── */
const cardRequestSubmitted = document.getElementById('cardRequestSubmitted');
const requestModalOverlay  = document.getElementById('requestModalOverlay');
const btnModalClose        = document.getElementById('btnModalClose');

function openRequestModal() {
  requestModalOverlay?.classList.add('show');
  document.body.classList.add('modal-open');
}

function closeRequestModal() {
  requestModalOverlay?.classList.remove('show');
  document.body.classList.remove('modal-open');
}

cardRequestSubmitted?.addEventListener('click', openRequestModal);

// รองรับ keyboard (Enter / Space) เพราะการ์ดมี role="button"
cardRequestSubmitted?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openRequestModal();
  }
});

btnModalClose?.addEventListener('click', closeRequestModal);

// ปิด modal เมื่อคลิกพื้นหลังมืด (นอก sheet)
requestModalOverlay?.addEventListener('click', (e) => {
  if (e.target === requestModalOverlay) closeRequestModal();
});

// ปิด modal ด้วยปุ่ม Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeRequestModal();
    closeLightbox();
  }
});

/* ──────────────────────────────────────────────────────
   5. LIGHTBOX ดูรูปภาพขยาย (รองรับอนาคตเมื่อมีฐานข้อมูลรูป)
────────────────────────────────────────────────────── */
const photoThumbs      = document.querySelectorAll('.photo-thumb');
const lightboxOverlay  = document.getElementById('lightboxOverlay');
const lightboxCaption  = document.getElementById('lightboxCaption');
const btnLightboxClose = document.getElementById('btnLightboxClose');

function openLightbox(label) {
  if (lightboxCaption) lightboxCaption.textContent = label || '';
  lightboxOverlay?.classList.add('show');
}

function closeLightbox() {
  lightboxOverlay?.classList.remove('show');
}

photoThumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    // TODO: เมื่อมีฐานข้อมูลรูปจริง ให้เปลี่ยนมาโหลด data-full (URL รูปภาพ)
    // แทนการแสดง placeholder icon เช่น:
    // const fullUrl = thumb.dataset.full;
    // lightboxContent.innerHTML = `<img src="${fullUrl}" alt="${thumb.dataset.label}">`;
    openLightbox(thumb.dataset.label);
  });
});

btnLightboxClose?.addEventListener('click', closeLightbox);

lightboxOverlay?.addEventListener('click', (e) => {
  if (e.target === lightboxOverlay) closeLightbox();
});
