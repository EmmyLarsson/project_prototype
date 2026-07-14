/* ═══════════════════════════════════════════════════════════
   report_submit.js  ·  UniMaintain — แจ้งซ่อม
   Sections:
     1. Config & Constants
     2. State
     3. Element References
     4. Info Mode Toggle
     5. Work Type Chips
     6. Image Upload
     7. Entry Permission
     8. Form Validation
     9. Submit & Modal
    10. Toast
    11. Back Button
═══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────
   1. CONFIG & CONSTANTS
────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'unimaintain_user_profile';
const MAX_IMAGES  = 6;
const MAX_FILE_MB = 10;

const WORK_TYPES = [
  { id: 'electric',  label: 'ไฟฟ้า',        icon: 'bolt'         },
  { id: 'plumbing',  label: 'ประปา',         icon: 'plumbing'     },
  { id: 'furniture', label: 'เฟอร์นิเจอร์',  icon: 'chair'        },
  { id: 'room',      label: 'งานห้อง',       icon: 'construction' },
  { id: 'internet',  label: 'อินเทอร์เน็ต',  icon: 'router'       },
  { id: 'other',     label: 'อื่นๆ',          icon: 'more_horiz'   },
];

/* ──────────────────────────────────────────────────────────
   2. STATE
────────────────────────────────────────────────────────── */
let infoMode         = 'new';   // 'new' | 'saved'
let selectedWorkType = null;    // work type id
let uploadedFiles    = [];      // File[]
let permissionValue  = 'yes';   // 'yes' | 'no'
let _toastTimer      = null;

/* ──────────────────────────────────────────────────────────
   3. ELEMENT REFERENCES
────────────────────────────────────────────────────────── */
const el = id => document.getElementById(id);

const modeNewBtn    = el('mode-new');
const modeSavedBtn  = el('mode-saved');
const inpName       = el('inp-name');
const inpPhone      = el('inp-phone');
const inpRoom       = el('inp-room');
const workGrid      = el('work-grid');
const inpDesc       = el('inp-desc');
const uploadZone    = el('upload-zone');
const fileInput     = el('file-input');
const imgGrid       = el('img-grid');
const imgCount      = el('img-count');
const permYesBtn    = el('perm-yes');
const permNoBtn     = el('perm-no');
const inpPermission = el('inp-permission');
const btnSubmit     = el('btn-submit');
const btnBack       = el('btn-back');
const modalOverlay  = el('modal-overlay');
const btnOk         = el('btn-ok');
const ticketIdEl    = el('ticket-id');
const statTimeEl    = el('stat-time');
const statTypeEl    = el('stat-type');

/* ──────────────────────────────────────────────────────────
   4. INFO MODE TOGGLE
────────────────────────────────────────────────────────── */

/** Load profile from localStorage */
function loadProfile() {
  try   { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
  catch { return null; }
}

/** Save profile to localStorage */
function saveProfile(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
}

// Seed demo profile on first load
if (!loadProfile()) {
  saveProfile({ name: 'สมหญิง หญิงสม', phone: '080-123-4567', room: '110912' });
}

// ── วางก่อน function applyInfoMode ──
const _pill  = modeNewBtn.closest('.toggle-pill');
const _thumb = _pill.querySelector('.toggle-pill__thumb');
function moveThumb(btn) {
  _thumb.style.width     = btn.offsetWidth + 'px';
  _thumb.style.transform = `translateX(${btn.offsetLeft - 3}px)`;
}
/** Switch between 'new' | 'saved' mode */
function applyInfoMode(mode) {
  const prevMode = infoMode;
  infoMode = mode;

  if (mode === 'saved') {
    // Fill fields from stored profile
    const p = loadProfile();
    if (p) {
      inpName.value  = p.name  ?? '';
      inpPhone.value = p.phone ?? '';
      inpRoom.value  = p.room  ?? '';
    }
    [inpName, inpPhone, inpRoom].forEach(inp => {
      inp.classList.add('is-saved');
      inp.readOnly = true;
    });
    
     el('mode-new').closest('.toggle-pill').dataset.active = mode;
  modeSavedBtn.classList.add('toggle-pill__btn--on');
  modeNewBtn.classList.remove('toggle-pill__btn--on');
  moveThumb(modeSavedBtn);

  } else {
  if (prevMode === 'saved') {
    inpName.value = inpPhone.value = inpRoom.value = '';
  }
  [inpName, inpPhone, inpRoom].forEach(inp => {
    inp.classList.remove('is-saved');
    inp.readOnly = false;
  });
  modeNewBtn.classList.add('toggle-pill__btn--on');
  modeSavedBtn.classList.remove('toggle-pill__btn--on');
  _pill.dataset.active = 'new';
  moveThumb(modeNewBtn);
}


  // Reset any validation state on mode change
  ['fg-name', 'fg-phone', 'fg-room'].forEach(id => el(id)?.classList.remove('is-invalid'));
}


document.querySelectorAll('.toggle-pill__btn').forEach((btn, i) => {
  btn.addEventListener('click', () => {
    const pill = btn.closest('.toggle-pill');
    pill.dataset.active = i === 0 ? 'new' : 'saved';
    pill.querySelectorAll('.toggle-pill__btn').forEach(b => b.classList.remove('toggle-pill__btn--on'));
    btn.classList.add('toggle-pill__btn--on');
  });
});

modeNewBtn.addEventListener('click',   () => applyInfoMode('new'));
modeSavedBtn.addEventListener('click', () => applyInfoMode('saved'));

// Initialize
applyInfoMode('new');

/* ──────────────────────────────────────────────────────────
   5. WORK TYPE CHIPS
────────────────────────────────────────────────────────── */

// Build chip grid from WORK_TYPES array
WORK_TYPES.forEach(({ id, label, icon }) => {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'work-chip';
  chip.dataset.id = id;
  chip.setAttribute('aria-pressed', 'false');
  chip.innerHTML = `
    <span class="material-symbols-outlined work-chip__icon">${icon}</span>
    <span class="work-chip__label">${label}</span>
  `;
  chip.addEventListener('click', () => selectWorkType(id));
  workGrid.appendChild(chip);
});

function selectWorkType(id) {
  selectedWorkType = id;
  document.querySelectorAll('.work-chip').forEach(c => {
    const active = c.dataset.id === id;
    c.classList.toggle('work-chip--on', active);
    c.setAttribute('aria-pressed', String(active));
  });
  // Clear validation error for work type
  el('fg-work-type')?.classList.remove('is-invalid');
}

/* ──────────────────────────────────────────────────────────
   6. IMAGE UPLOAD
────────────────────────────────────────────────────────── */

// Click to open file picker
uploadZone.addEventListener('click', () => {
  if (uploadedFiles.length < MAX_IMAGES) fileInput.click();
});

// Keyboard accessibility
uploadZone.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && uploadedFiles.length < MAX_IMAGES) {
    e.preventDefault();
    fileInput.click();
  }
});

// Drag & drop
uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', e => {
  if (!uploadZone.contains(e.relatedTarget)) uploadZone.classList.remove('drag-over');
});
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  ingestFiles([...e.dataTransfer.files]);
});

// Native file picker
fileInput.addEventListener('change', () => {
  ingestFiles([...fileInput.files]);
  fileInput.value = '';
});

/** Validate & add files to state */
function ingestFiles(files) {
  let skippedType = 0, skippedSize = 0;

  for (const file of files) {
    if (uploadedFiles.length >= MAX_IMAGES) break;
    if (!file.type.startsWith('image/'))         { skippedType++; continue; }
    if (file.size > MAX_FILE_MB * 1024 * 1024)  { skippedSize++; continue; }
    uploadedFiles.push(file);
  }

  if (skippedSize > 0)
    showToast(`${skippedSize} ไฟล์มีขนาดเกิน ${MAX_FILE_MB} MB`, 'warn');
  if (skippedType > 0)
    showToast('รองรับเฉพาะไฟล์รูปภาพเท่านั้น', 'warn');

  renderPreviews();
}

/** Re-render the image preview grid */
function renderPreviews() {
  // Revoke stale object URLs (memory management)
  imgGrid.querySelectorAll('img').forEach(img => {
    if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
  });

  imgGrid.innerHTML = '';

  uploadedFiles.forEach((file, index) => {
    const url   = URL.createObjectURL(file);
    const thumb = document.createElement('div');
    thumb.className = 'img-thumb';
    thumb.innerHTML = `
      <img src="${url}" alt="รูปที่ ${index + 1}">
      <button type="button" class="img-thumb__del" aria-label="ลบรูปที่ ${index + 1}">
        <span class="material-symbols-outlined">close</span>
      </button>
    `;
    thumb.querySelector('.img-thumb__del').addEventListener('click', e => {
      e.stopPropagation();
      removeImage(index);
    });
    imgGrid.appendChild(thumb);
  });

  // Update counter badge
  imgCount.textContent = `${uploadedFiles.length} / ${MAX_IMAGES}`;

  // Toggle full state on upload zone
  uploadZone.classList.toggle('is-full', uploadedFiles.length >= MAX_IMAGES);
}

/** Remove one image by index */
function removeImage(index) {
  const imgs = imgGrid.querySelectorAll('img');
  if (imgs[index]?.src.startsWith('blob:')) URL.revokeObjectURL(imgs[index].src);
  uploadedFiles.splice(index, 1);
  renderPreviews();
}

/* ──────────────────────────────────────────────────────────
   7. ENTRY PERMISSION
────────────────────────────────────────────────────────── */

function setPermission(value) {
  permissionValue     = value;
  inpPermission.value = value;

  permYesBtn.classList.toggle('perm-btn--active', value === 'yes');
  permNoBtn.classList.toggle('perm-btn--active',  value === 'no');
}

permYesBtn.addEventListener('click', () => setPermission('yes'));
permNoBtn.addEventListener('click',  () => setPermission('no'));

// Initialize — sync JS state กับค่า default ใน HTML (ไม่อนุญาต)
setPermission('yes');

/* ──────────────────────────────────────────────────────────
   8. FORM VALIDATION
────────────────────────────────────────────────────────── */

/** Helper: set valid/invalid state on a field group */
function setFieldValid(groupId, isValid) {
  el(groupId)?.classList.toggle('is-invalid', !isValid);
}

/** Validate all required fields — returns true if all pass */
function validateForm() {
  let valid = true;

  // ชื่อผู้แจ้ง
  if (!inpName.value.trim())  { setFieldValid('fg-name',      false); valid = false; }
  else                         { setFieldValid('fg-name',      true);  }

  // เบอร์โทร
  if (!inpPhone.value.trim()) { setFieldValid('fg-phone',     false); valid = false; }
  else                         { setFieldValid('fg-phone',     true);  }

  // หมายเลขห้อง
  if (!inpRoom.value.trim())  { setFieldValid('fg-room',      false); valid = false; }
  else                         { setFieldValid('fg-room',      true);  }

  // ประเภทงาน
  if (!selectedWorkType)      { setFieldValid('fg-work-type', false); valid = false; }
  else                         { setFieldValid('fg-work-type', true);  }

  // รายละเอียดปัญหา
  if (!inpDesc.value.trim())  { setFieldValid('fg-desc',      false); valid = false; }
  else                         { setFieldValid('fg-desc',      true);  }

  return valid;
}

// Live validation — ลบ error ทันทีที่ผู้ใช้เริ่มพิมพ์
[inpName, inpPhone, inpRoom, inpDesc].forEach(inp => {
  inp.addEventListener('input', () => {
    if (inp.value.trim()) inp.closest('.field-group')?.classList.remove('is-invalid');
  });
});

/* ──────────────────────────────────────────────────────────
   9. SUBMIT & MODAL
────────────────────────────────────────────────────────── */

/** Generate random 6-char ticket ID e.g. REQ-A3KZ9X */
function generateTicketId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return 'REQ-' + Array.from({ length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

/** Open success bottom-sheet modal */
function openModal(ticketId, workTypeLabel) {
  ticketIdEl.textContent = ticketId;
  statTypeEl.textContent = workTypeLabel;
  statTimeEl.textContent = new Date().toLocaleTimeString('th-TH', {
    hour: '2-digit', minute: '2-digit',
  });

  modalOverlay.removeAttribute('aria-hidden');
  modalOverlay.classList.add('is-visible');
  document.body.style.overflow = 'hidden';
}

/** Close modal & restore scroll */
function closeModal() {
  modalOverlay.classList.remove('is-visible');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Submit button
btnSubmit.addEventListener('click', () => {
  if (!validateForm()) {
    // Scroll ไปยัง field แรกที่ invalid
    const firstInvalid = document.querySelector('.field-group.is-invalid');
    firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warn');
    return;
  }

  // บันทึก profile ถ้าอยู่ในโหมดระบุข้อมูลใหม่
  if (infoMode === 'new') {
    saveProfile({
      name:  inpName.value.trim(),
      phone: inpPhone.value.trim(),
      room:  inpRoom.value.trim(),
    });
  }

  const ticketId      = generateTicketId();
  const workTypeLabel = WORK_TYPES.find(w => w.id === selectedWorkType)?.label ?? '-';
  openModal(ticketId, workTypeLabel);
});



// ปุ่ม "ดูประวัติการแจ้งซ่อม"
btnOk.addEventListener('click', () => {
  closeModal();
  // window.location.href = 'history.html';
});

// แตะ backdrop เพื่อปิด modal
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

/* ──────────────────────────────────────────────────────────
   10. TOAST
────────────────────────────────────────────────────────── */

const TOAST_ICONS = {
  info:    'info',
  warn:    'warning',
  error:   'error',
  success: 'check_circle',
};

/**
 * แสดง toast notification
 * @param {string} message - ข้อความที่จะแสดง
 * @param {'info'|'warn'|'error'|'success'} type - ประเภท icon
 */
function showToast(message, type = 'info') {
  // ลบ toast เดิมถ้ามี
  document.querySelector('.app-toast')?.remove();
  if (_toastTimer) clearTimeout(_toastTimer);

  const icon  = TOAST_ICONS[type] ?? 'info';
  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `<span class="material-symbols-outlined">${icon}</span>${message}`;
  document.body.appendChild(toast);

  // Animate in (double rAF เพื่อรอ paint ก่อน transition)
  requestAnimationFrame(() => requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }));

  // Auto dismiss หลัง 3 วินาที
  _toastTimer = setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(8px)';
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}

/* ──────────────────────────────────────────────────────────
   11. BACK BUTTON
────────────────────────────────────────────────────────── */

btnBack.addEventListener('click', () => history.back());

