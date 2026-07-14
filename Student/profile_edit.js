/* ════════════════════════════════════════
   profile_edit.js
   UniMaintain — Edit Profile Page
   ════════════════════════════════════════ */

'use strict';

// ── Element References ──────────────────
const form         = document.getElementById('edit-form');
const btnBack      = document.getElementById('btn-back');
const btnSave      = document.getElementById('btn-save');
const btnAvatarEdit= document.getElementById('btn-avatar-edit');
const avatarInput  = document.getElementById('avatar-input');
const avatarImg    = document.getElementById('avatar-img');

const phoneInput   = document.getElementById('phone');
const roomInput    = document.getElementById('room');

const fieldPhone   = document.getElementById('field-phone');
const fieldRoom    = document.getElementById('field-room');
const errorPhone   = document.getElementById('error-phone');
const errorRoom    = document.getElementById('error-room');

const modalOverlay = document.getElementById('modal-overlay');
const modalSummary = document.getElementById('modal-summary');
const btnModalOk   = document.getElementById('btn-modal-ok');

// ════════════════════════════════════════
// 1. BACK BUTTON
// ════════════════════════════════════════
btnBack.addEventListener('click', () => {
  // หากมี history ก่อนหน้า → กลับหน้าเดิม
  // หากไม่มี → ไปหน้า profile.html
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = 'profile.html';
  }
});

// ════════════════════════════════════════
// 2. AVATAR — เปลี่ยนรูปโปรไฟล์
// ════════════════════════════════════════
btnAvatarEdit.addEventListener('click', () => {
  avatarInput.click();
});

avatarInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ตรวจสอบชนิดไฟล์
  if (!file.type.startsWith('image/')) {
    showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
    return;
  }

  // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('ขนาดไฟล์ต้องไม่เกิน 5MB', 'error');
    return;
  }

  // Preview รูปใหม่ทันที
  const reader = new FileReader();
  reader.onload = (ev) => {
    avatarImg.src = ev.target.result;
    avatarImg.classList.add('avatar-updated');
    showToast('อัปโหลดรูปภาพสำเร็จ', 'success');
  };
  reader.readAsDataURL(file);

  // reset input เพื่อให้เลือกไฟล์เดิมซ้ำได้
  avatarInput.value = '';
});

// ════════════════════════════════════════
// 3. VALIDATION
// ════════════════════════════════════════

/**
 * ตรวจสอบเบอร์โทรศัพท์ไทย
 * รับรูปแบบ: 0xx-xxxxxxx หรือ 0xxxxxxxxx (10 หลัก)
 */
function validatePhone(value) {
  const cleaned = value.replace(/-/g, '');
  return /^0[0-9]{9}$/.test(cleaned);
}

/**
 * ตรวจสอบหมายเลขห้อง (ตัวเลข 4-8 หลัก)
 */
function validateRoom(value) {
  return /^[0-9A-Za-z]{3,10}$/.test(value.trim());
}

/**
 * แสดง / ซ่อน error ใต้ field
 * @param {HTMLElement} fieldEl   - div.field ของ input นั้น
 * @param {HTMLElement} errorEl   - p.field-error
 * @param {string|null} message   - ข้อความ error (null = ล้าง error)
 */
function setFieldError(fieldEl, errorEl, message) {
  if (message) {
    errorEl.textContent = message;
    fieldEl.classList.add('field--invalid');
    return false;
  } else {
    errorEl.textContent = '';
    fieldEl.classList.remove('field--invalid');
    return true;
  }
}

/** ตรวจสอบทุก field แล้วคืนค่า true ถ้าผ่านทั้งหมด */
function validateAll() {
  let valid = true;

  // เบอร์โทร
  if (!phoneInput.value.trim()) {
    setFieldError(fieldPhone, errorPhone, 'กรุณากรอกเบอร์โทรติดต่อ');
    valid = false;
  } else if (!validatePhone(phoneInput.value)) {
    setFieldError(fieldPhone, errorPhone, 'รูปแบบเบอร์โทรไม่ถูกต้อง (เช่น 080-4562334)');
    valid = false;
  } else {
    setFieldError(fieldPhone, errorPhone, null);
  }

  // หมายเลขห้อง
  if (!roomInput.value.trim()) {
    setFieldError(fieldRoom, errorRoom, 'กรุณากรอกหมายเลขห้องพัก');
    valid = false;
  } else if (!validateRoom(roomInput.value)) {
    setFieldError(fieldRoom, errorRoom, 'หมายเลขห้องไม่ถูกต้อง (เช่น 111320)');
    valid = false;
  } else {
    setFieldError(fieldRoom, errorRoom, null);
  }

  return valid;
}

// ── Real-time validation (เมื่อออกจาก field) ──
phoneInput.addEventListener('blur', () => {
  if (!phoneInput.value.trim()) {
    setFieldError(fieldPhone, errorPhone, 'กรุณากรอกเบอร์โทรติดต่อ');
  } else if (!validatePhone(phoneInput.value)) {
    setFieldError(fieldPhone, errorPhone, 'รูปแบบเบอร์โทรไม่ถูกต้อง (เช่น 080-4562334)');
  } else {
    setFieldError(fieldPhone, errorPhone, null);
  }
});

roomInput.addEventListener('blur', () => {
  if (!roomInput.value.trim()) {
    setFieldError(fieldRoom, errorRoom, 'กรุณากรอกหมายเลขห้องพัก');
  } else if (!validateRoom(roomInput.value)) {
    setFieldError(fieldRoom, errorRoom, 'หมายเลขห้องไม่ถูกต้อง (เช่น 111320)');
  } else {
    setFieldError(fieldRoom, errorRoom, null);
  }
});

// ── ล้าง error ทันทีที่เริ่มพิมพ์ใหม่ ──
phoneInput.addEventListener('input', () => {
  if (fieldPhone.classList.contains('field--invalid')) {
    setFieldError(fieldPhone, errorPhone, null);
  }
});

roomInput.addEventListener('input', () => {
  if (fieldRoom.classList.contains('field--invalid')) {
    setFieldError(fieldRoom, errorRoom, null);
  }
});

// ════════════════════════════════════════
// 4. FORM SUBMIT — บันทึกข้อมูล
// ════════════════════════════════════════
form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!validateAll()) {
    // เลื่อนไปยัง field แรกที่มี error
    const firstError = form.querySelector('.field--invalid .input');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
    return;
  }

  // ── สถานะ Loading ──
  setSaveLoading(true);

  // จำลอง API call (ในอนาคตแทนที่ด้วย fetch/axios)
  setTimeout(() => {
    setSaveLoading(false);
    openSuccessModal();
  }, 900);
});

/** เปิด/ปิดสถานะ loading บน btn-save */
function setSaveLoading(isLoading) {
  btnSave.disabled = isLoading;
  if (isLoading) {
    btnSave.innerHTML = `
      <span class="material-symbols-rounded spin">sync</span>
      <span>กำลังบันทึก...</span>
    `;
  } else {
    btnSave.innerHTML = `
      <span class="material-symbols-rounded">save</span>
      <span>บันทึกข้อมูล</span>
    `;
  }
}

// ════════════════════════════════════════
// 5. SUCCESS MODAL
// ════════════════════════════════════════
function openSuccessModal() {
  // สร้าง summary จากข้อมูลที่กรอก
  modalSummary.innerHTML = `
    <div class="summary-row">
      <span class="material-symbols-rounded">call</span>
      <div class="summary-row-text">
        <span class="summary-label">เบอร์โทรติดต่อ</span>
        <span class="summary-value">${escapeHtml(phoneInput.value.trim())}</span>
      </div>
    </div>
    <div class="summary-row">
      <span class="material-symbols-rounded">apartment</span>
      <div class="summary-row-text">
        <span class="summary-label">หมายเลขห้องพัก</span>
        <span class="summary-value">${escapeHtml(roomInput.value.trim())}</span>
      </div>
    </div>
  `;

  // แสดง modal
  modalOverlay.hidden = false;
  // รอ 1 frame แล้วค่อย animate เพื่อให้ transition ทำงาน
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modalOverlay.classList.add('is-open');
    });
  });

  // focus ที่ปุ่ม ตกลง เพื่อ accessibility
  setTimeout(() => btnModalOk.focus(), 300);
}

function closeSuccessModal() {
  modalOverlay.classList.remove('is-open');
  // รอ animation จบแล้วซ่อน
  setTimeout(() => {
    modalOverlay.hidden = true;
  }, 300);
}

// ปุ่ม ตกลง ใน modal
btnModalOk.addEventListener('click', () => {
  closeSuccessModal();
  // ค้างอยู่หน้าเดิม พร้อมข้อมูลที่อัปเดตแล้ว
  // (ในอนาคต: sync ข้อมูลจาก API response)
});

// กด backdrop ปิด modal ได้
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeSuccessModal();
});

// กด Escape ปิด modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalOverlay.hidden) {
    closeSuccessModal();
  }
});

// ════════════════════════════════════════
// 6. TOAST NOTIFICATION (เสริม)
// ════════════════════════════════════════
let toastTimer = null;

function showToast(message, type = 'success') {
  // สร้าง toast ถ้ายังไม่มี
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(12px);
      background: var(--on-surface);
      color: #fff;
      padding: 10px 18px;
      border-radius: 99px;
      font-size: 13px;
      font-weight: 500;
      font-family: var(--font-body, Inter, sans-serif);
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 6px 20px rgba(0,0,0,.22);
      z-index: 999;
      opacity: 0;
      transition: opacity .22s, transform .22s;
      white-space: nowrap;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  const icon = type === 'error' ? 'error' : 'check_circle';
  const color = type === 'error' ? '#ff7474' : '#6effc4';
  toast.innerHTML = `<span style="font-family:'Material Symbols Rounded';font-size:16px;color:${color}">${icon}</span>${message}`;

  // show
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(12px)';
  }, 2800);
}

// ════════════════════════════════════════
// UTILS
// ════════════════════════════════════════
/** ป้องกัน XSS ใน innerHTML */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Spin animation สำหรับ loading icon ──
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinStyle);
