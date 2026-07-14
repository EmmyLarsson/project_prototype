/* ═══════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════ */
const CARDS_PER_PAGE = 6;

const ROLE_LABELS = {
  student: 'นักศึกษา',
  staff: 'เจ้าหน้าที่',
  technician: 'ช่างผู้ดำเนินการ'
};

const ROLE_ICONS = {
  student: 'school',
  staff: 'badge',
  technician: 'engineering'
};

const SPECIALTY_LABELS = {
  electric: 'ช่างไฟฟ้า',
  plumbing: 'ช่างประปา',
  furniture: 'ช่างเฟอร์นิเจอร์',
  general: 'ช่างทั่วไป'
};

/* ═══════════════════════════════════════════════════════════
   MOCK DATA STORE (6 รายชื่อคละบทบาท — แทนที่ด้วย API ในเฟสถัดไป)
   ═══════════════════════════════════════════════════════════ */
let personnelData = [
  {
    id: 'STU001',
    role: 'student',
    fullname: 'แอนนี่ เวอร์ตัน',
    phone: '080-123-4567',
    email: 'annie.v@psu.ac.th',
    avatar: null,
    username: 'annie.v',
    password: 'Annie1234',
    roomNumber: '110912'
  },
  {
    id: 'STU002',
    role: 'student',
    fullname: 'นางสาวปาริชาต ใจดี',
    phone: '081-234-5678',
    email: 'parichat.j@psu.ac.th',
    avatar: null,
    username: 'parichat.j',
    password: 'Parichat99',
    roomNumber: '110305'
  },
  {
    id: 'STF001',
    role: 'staff',
    fullname: 'สมหมาย พรชัย',
    phone: '082-345-6789',
    email: 'sommai.p@psu.ac.th',
    avatar: null,
    username: 'sommai.p',
    password: 'Sommai2024',
    position: 'เจ้าหน้าที่ธุรการ'
  },
  {
    id: 'STF002',
    role: 'staff',
    fullname: 'นางสาวศิริพร แสงทอง',
    phone: '083-456-7890',
    email: 'siriporn.s@psu.ac.th',
    avatar: null,
    username: 'siriporn.s',
    password: 'Siriporn88',
    position: 'เจ้าหน้าที่ประสานงาน'
  },
  {
    id: 'T000444',
    role: 'technician',
    fullname: 'นายสมชาย สายน้ำ',
    phone: '084-567-8901',
    email: '',
    avatar: null,
    specialty: 'plumbing',
    techNumber: 'T000444'
  },
  {
    id: 'T000512',
    role: 'technician',
    fullname: 'นายวีระ ชัยชนะ',
    phone: '085-678-9012',
    email: '',
    avatar: null,
    specialty: 'electric',
    techNumber: 'T000512'
  }
];

let nextStudentNum = 3;
let nextStaffNum = 3;
let nextTechNum = 600;

/* ═══════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════ */
const state = {
  searchTerm: '',
  roleFilter: 'all',
  currentPage: 1,
  modalMode: 'add',     // 'add' | 'edit'
  editingId: null,
  pendingAvatarDataUrl: null,
  pendingDeleteId: null
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
function getFilteredData() {
  return personnelData.filter(p => {
    const term = state.searchTerm.toLowerCase();
    const matchesSearch =
      term === '' ||
      p.fullname.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      (p.email && p.email.toLowerCase().includes(term));

    const matchesRole = state.roleFilter === 'all' || p.role === state.roleFilter;

    return matchesSearch && matchesRole;
  });
}

function updateRoleCounts() {
  const counts = { all: personnelData.length, student: 0, staff: 0, technician: 0 };
  personnelData.forEach(p => counts[p.role]++);
  document.getElementById('count-all').textContent = counts.all;
  document.getElementById('count-student').textContent = counts.student;
  document.getElementById('count-staff').textContent = counts.staff;
  document.getElementById('count-technician').textContent = counts.technician;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function getMetaLinesForCard(p) {
  if (p.role === 'student') {
    return `
      <div><span class="material-symbols-outlined">meeting_room</span> ห้อง ${escapeHtml(p.roomNumber || '-')}</div>
      <div><span class="material-symbols-outlined">call</span> ${escapeHtml(p.phone || '-')}</div>
    `;
  }
  if (p.role === 'staff') {
    return `
      <div><span class="material-symbols-outlined">work</span> ${escapeHtml(p.position || '-')}</div>
      <div><span class="material-symbols-outlined">call</span> ${escapeHtml(p.phone || '-')}</div>
    `;
  }
  // technician
  return `
    <div><span class="material-symbols-outlined">construction</span> ${escapeHtml(SPECIALTY_LABELS[p.specialty] || '-')}</div>
    <div><span class="material-symbols-outlined">call</span> ${escapeHtml(p.phone || '-')}</div>
  `;
}

/* ═══════════════════════════════════════════════════════════
   RENDER: CARD GRID + PAGINATION
   ═══════════════════════════════════════════════════════════ */
function renderCard(p) {
  const roleLabel = ROLE_LABELS[p.role];
  const roleIcon = ROLE_ICONS[p.role];

  const avatarContent = p.avatar
    ? `<img src="${p.avatar}" alt="${escapeHtml(p.fullname)}">`
    : `<span class="material-symbols-outlined">person</span>`;

  return `
    <div class="pn-card" data-id="${p.id}">
      <div class="pn-card__top">
        <div class="pn-card__avatar">${avatarContent}</div>
        <div class="pn-card__info">
          <div class="pn-card__name">${escapeHtml(p.fullname)}</div>
          <div class="pn-card__code">รหัส: ${p.id}</div>
          <span class="pn-role-badge pn-role-badge--${p.role}">
            <span class="material-symbols-outlined" style="font-size:13px;">${roleIcon}</span>
            ${roleLabel}
          </span>
        </div>
      </div>
      <div class="pn-card__meta">
        ${getMetaLinesForCard(p)}
      </div>
      <div class="pn-card__actions">
        <button class="pn-card__edit-btn" data-edit-id="${p.id}">
          <span class="material-symbols-outlined">edit</span> แก้ไข
        </button>
        <button class="pn-card__delete-btn" data-delete-id="${p.id}">
          <span class="material-symbols-outlined">delete</span> ลบ
        </button>
      </div>
    </div>
  `;
}

function renderGrid() {
  const filtered = getFilteredData();
  const grid = document.getElementById('personnel-grid');
  const emptyState = document.getElementById('empty-state');

  const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
  if (state.currentPage > totalPages) state.currentPage = totalPages;

  const start = (state.currentPage - 1) * CARDS_PER_PAGE;
  const pageItems = filtered.slice(start, start + CARDS_PER_PAGE);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
    grid.innerHTML = pageItems.map(renderCard).join('');
  }

  renderPagination(totalPages);
  attachCardListeners();
}

function renderPagination(totalPages) {
  const pagination = document.getElementById('pagination');
  if (totalPages <= 1) { pagination.innerHTML = ''; return; }

  let html = `<button class="page-btn" id="page-prev" ${state.currentPage === 1 ? 'disabled' : ''}>ก่อนหน้านี้</button>`;
  html += `<div style="display:flex;gap:4px;">`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === state.currentPage ? 'is-active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `</div>`;
  html += `<button class="page-btn" id="page-next" ${state.currentPage === totalPages ? 'disabled' : ''}>ถัดไป</button>`;

  pagination.innerHTML = html;

  const prevBtn = document.getElementById('page-prev');
  const nextBtn = document.getElementById('page-next');
  if (prevBtn) prevBtn.addEventListener('click', () => { state.currentPage--; renderGrid(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { state.currentPage++; renderGrid(); });

  pagination.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentPage = parseInt(btn.dataset.page, 10);
      renderGrid();
    });
  });
}

function attachCardListeners() {
  document.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.editId));
  });
  document.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', () => openDeleteConfirm(btn.dataset.deleteId));
  });
}

/* ═══════════════════════════════════════════════════════════
   FILTER CONTROLS
   ═══════════════════════════════════════════════════════════ */
function initFilters() {
  document.getElementById('search-input').addEventListener('input', (e) => {
    state.searchTerm = e.target.value.trim();
    state.currentPage = 1;
    renderGrid();
  });

  document.getElementById('role-filter-row').addEventListener('click', (e) => {
    const pill = e.target.closest('.role-pill');
    if (!pill) return;
    document.querySelectorAll('.role-pill').forEach(p => p.classList.remove('is-active'));
    pill.classList.add('is-active');
    state.roleFilter = pill.dataset.role;
    state.currentPage = 1;
    renderGrid();
  });
}

/* ═══════════════════════════════════════════════════════════
   MODAL ELEMENTS
   ═══════════════════════════════════════════════════════════ */
const personnelModalOverlay = document.getElementById('personnel-modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalDeleteBtn = document.getElementById('modal-delete-btn');
const saveBtnLabel = document.getElementById('save-btn-label');
const saveBtnIcon = document.getElementById('save-btn-icon');

const roleSelect = document.getElementById('role-select');
const commonFieldsRow = document.getElementById('common-fields-row');
const emailField = document.getElementById('email-field');
const fullnameInput = document.getElementById('fullname-input');
const phoneInput = document.getElementById('phone-input');
const emailInput = document.getElementById('email-input');

const studentSection = document.getElementById('student-section');
const staffSection = document.getElementById('staff-section');
const technicianSection = document.getElementById('technician-section');

const studentUsername = document.getElementById('student-username');
const studentPassword = document.getElementById('student-password');
const roomNumberInput = document.getElementById('room-number');

const staffUsername = document.getElementById('staff-username');
const staffPassword = document.getElementById('staff-password');
const staffPositionInput = document.getElementById('staff-position');

const techSpecialty = document.getElementById('tech-specialty');
const techNumberInput = document.getElementById('tech-number');

const avatarInput = document.getElementById('avatar-input');
const avatarPlaceholder = document.getElementById('avatar-placeholder');
const avatarPreview = document.getElementById('avatar-preview');
const previewAvatarImg = document.getElementById('preview-avatar-img');

/* ═══════════════════════════════════════════════════════════
   DYNAMIC FIELD LOGIC (show/hide based on role)
   ═══════════════════════════════════════════════════════════ */
function applyRoleVisibility(role) {
  // ซ่อนทุก dynamic section ก่อน
  studentSection.style.display = 'none';
  staffSection.style.display = 'none';
  technicianSection.style.display = 'none';

  if (role === 'student') {
    commonFieldsRow.style.display = 'grid';
    emailField.style.display = 'block';
    studentSection.style.display = 'flex';
  } else if (role === 'staff') {
    commonFieldsRow.style.display = 'grid';
    emailField.style.display = 'block';
    staffSection.style.display = 'flex';
  } else if (role === 'technician') {
    // ตามสเปก: technician ซ่อนฟิลด์ร่วม (ชื่อ, เบอร์, อีเมล) ออกไปโดยสิ้นเชิง
    // → คงไว้แค่ ชื่อ-นามสกุล กับเบอร์โทร (จำเป็นต่อการติดต่อ) แต่ซ่อน email
    // ตามคำสั่งจริง: "แสดงเฉพาะฟิลด์ ประเภทความเชี่ยวชาญ และหมายเลขช่างเท่านั้น"
    commonFieldsRow.style.display = 'none';
    emailField.style.display = 'none';
    technicianSection.style.display = 'flex';
  } else {
    commonFieldsRow.style.display = 'grid';
    emailField.style.display = 'block';
  }
}

roleSelect.addEventListener('change', () => {
  applyRoleVisibility(roleSelect.value);
  clearFieldErrors();
});

/* ═══════════════════════════════════════════════════════════
   PASSWORD VISIBILITY TOGGLE
   ═══════════════════════════════════════════════════════════ */
document.querySelectorAll('.password-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    const icon = btn.querySelector('.material-symbols-outlined');
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.textContent = isPassword ? 'visibility_off' : 'visibility';
  });
});

/* ═══════════════════════════════════════════════════════════
   AVATAR UPLOAD
   ═══════════════════════════════════════════════════════════ */
avatarInput.addEventListener('change', () => {
  const file = avatarInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.pendingAvatarDataUrl = e.target.result;
    previewAvatarImg.src = e.target.result;
    avatarPlaceholder.style.display = 'none';
    avatarPreview.style.display = 'flex';
    document.getElementById('avatar-error').textContent = '';
  };
  reader.readAsDataURL(file);
});

/* ═══════════════════════════════════════════════════════════
   RESET / OPEN MODAL
   ═══════════════════════════════════════════════════════════ */
function resetModalForm() {
  roleSelect.value = '';
  roleSelect.disabled = false;
  fullnameInput.value = '';
  phoneInput.value = '';
  emailInput.value = '';
  studentUsername.value = '';
  studentPassword.value = '';
  roomNumberInput.value = '';
  staffUsername.value = '';
  staffPassword.value = '';
  staffPositionInput.value = '';
  techSpecialty.value = '';
  techNumberInput.value = '';

  state.pendingAvatarDataUrl = null;
  avatarPlaceholder.style.display = 'flex';
  avatarPreview.style.display = 'none';
  avatarInput.value = '';

  applyRoleVisibility('');
  clearFieldErrors();
}

function clearFieldErrors() {
  const errorIds = [
    'role-error', 'fullname-error', 'phone-error', 'email-error',
    'avatar-error', 'student-username-error', 'student-password-error',
    'room-number-error', 'staff-username-error', 'staff-password-error',
    'staff-position-error', 'tech-specialty-error', 'tech-number-error'
  ];
  errorIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  [roleSelect, fullnameInput, phoneInput, emailInput, studentUsername,
   studentPassword, roomNumberInput, staffUsername, staffPassword,
   staffPositionInput, techSpecialty, techNumberInput].forEach(el => {
    el.classList.remove('has-error');
  });
}

function openAddModal() {
  state.modalMode = 'add';
  state.editingId = null;
  resetModalForm();
  modalTitle.textContent = 'เพิ่มข้อมูลบุคลากร';
  modalDeleteBtn.style.display = 'none';
  saveBtnLabel.textContent = 'เพิ่มข้อมูล';
  saveBtnIcon.textContent = 'person_add';
  personnelModalOverlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function openEditModal(id) {
  const p = personnelData.find(x => x.id === id);
  if (!p) return;

  state.modalMode = 'edit';
  state.editingId = id;
  clearFieldErrors();

  roleSelect.value = p.role;
  roleSelect.disabled = true; // ล็อกบทบาทในโหมดแก้ไข ตามสเปก
  applyRoleVisibility(p.role);

  fullnameInput.value = p.fullname || '';
  phoneInput.value = p.phone || '';
  emailInput.value = p.email || '';

  if (p.role === 'student') {
    studentUsername.value = p.username || '';
    studentPassword.value = p.password || '';
    roomNumberInput.value = p.roomNumber || '';
  } else if (p.role === 'staff') {
    staffUsername.value = p.username || '';
    staffPassword.value = p.password || '';
    staffPositionInput.value = p.position || '';
  } else if (p.role === 'technician') {
    techSpecialty.value = p.specialty || '';
    techNumberInput.value = p.techNumber || '';
  }

  if (p.avatar) {
    state.pendingAvatarDataUrl = p.avatar;
    previewAvatarImg.src = p.avatar;
    avatarPlaceholder.style.display = 'none';
    avatarPreview.style.display = 'flex';
  } else {
    state.pendingAvatarDataUrl = null;
    avatarPlaceholder.style.display = 'flex';
    avatarPreview.style.display = 'none';
  }

  modalTitle.textContent = 'แก้ไขข้อมูลบุคลากร';
  modalDeleteBtn.style.display = 'flex';
  saveBtnLabel.textContent = 'บันทึกข้อมูล';
  saveBtnIcon.textContent = 'save';
  personnelModalOverlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closePersonnelModal() {
  personnelModalOverlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

document.getElementById('open-add-modal').addEventListener('click', openAddModal);
document.getElementById('modal-close-btn').addEventListener('click', closePersonnelModal);
document.getElementById('modal-cancel-btn').addEventListener('click', closePersonnelModal);
personnelModalOverlay.addEventListener('click', (e) => {
  if (e.target === personnelModalOverlay) closePersonnelModal();
});

/* ═══════════════════════════════════════════════════════════
   VALIDATION
   ═══════════════════════════════════════════════════════════ */
function showAlertModal(message) {
  document.getElementById('alert-modal-message').textContent = message;
  document.getElementById('alert-modal-overlay').classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

document.getElementById('alert-modal-close').addEventListener('click', () => {
  document.getElementById('alert-modal-overlay').classList.remove('is-open');
  document.body.style.overflow = '';
});

function setFieldError(inputEl, errorId, message) {
  inputEl.classList.add('has-error');
  document.getElementById(errorId).textContent = message;
}

function validateForm() {
  clearFieldErrors();
  let isValid = true;
  const missing = [];

  const role = roleSelect.value;

  if (!role) {
    setFieldError(roleSelect, 'role-error', 'กรุณาเลือกบทบาท');
    missing.push('บทบาท');
    isValid = false;
  }

  // ── รูปภาพ: บังคับเฉพาะโหมดเพิ่ม ──
  if (state.modalMode === 'add' && !state.pendingAvatarDataUrl) {
    document.getElementById('avatar-error').textContent = 'กรุณาอัปโหลดรูปภาพ';
    missing.push('รูปภาพโปรไฟล์');
    isValid = false;
  }

  if (role === 'technician') {
    // ═══ Technician: เฉพาะความเชี่ยวชาญ + หมายเลขช่าง ═══
    if (!fullnameInput.value.trim() && commonFieldsRow.style.display !== 'none') {
      setFieldError(fullnameInput, 'fullname-error', 'กรุณากรอกชื่อ-นามสกุล');
      missing.push('ชื่อ-นามสกุล');
      isValid = false;
    }
    if (!techSpecialty.value) {
      setFieldError(techSpecialty, 'tech-specialty-error', 'กรุณาเลือกความเชี่ยวชาญ');
      missing.push('ประเภทความเชี่ยวชาญช่าง');
      isValid = false;
    }
    if (!techNumberInput.value.trim()) {
      setFieldError(techNumberInput, 'tech-number-error', 'กรุณากรอกหมายเลขช่าง');
      missing.push('หมายเลขช่าง');
      isValid = false;
    }
  } else if (role) {
    // ═══ Student / Staff: ฟิลด์ร่วม ═══
    if (!fullnameInput.value.trim()) {
      setFieldError(fullnameInput, 'fullname-error', 'กรุณากรอกชื่อ-นามสกุล');
      missing.push('ชื่อ-นามสกุล');
      isValid = false;
    }
    if (!phoneInput.value.trim()) {
      setFieldError(phoneInput, 'phone-error', 'กรุณากรอกเบอร์โทรศัพท์');
      missing.push('เบอร์โทรศัพท์');
      isValid = false;
    }
    if (!emailInput.value.trim()) {
      setFieldError(emailInput, 'email-error', 'กรุณากรอกอีเมล');
      missing.push('อีเมล');
      isValid = false;
    }

    if (role === 'student') {
      if (!studentUsername.value.trim()) {
        setFieldError(studentUsername, 'student-username-error', 'กรุณากรอก Username');
        missing.push('Username');
        isValid = false;
      }
      if (!studentPassword.value.trim()) {
        setFieldError(studentPassword, 'student-password-error', 'กรุณากรอก Password');
        missing.push('Password');
        isValid = false;
      }
      if (!roomNumberInput.value.trim()) {
        setFieldError(roomNumberInput, 'room-number-error', 'กรุณากรอกหมายเลขห้องพัก');
        missing.push('หมายเลขห้องพัก');
        isValid = false;
      }
    } else if (role === 'staff') {
      if (!staffUsername.value.trim()) {
        setFieldError(staffUsername, 'staff-username-error', 'กรุณากรอก Username');
        missing.push('Username');
        isValid = false;
      }
      if (!staffPassword.value.trim()) {
        setFieldError(staffPassword, 'staff-password-error', 'กรุณากรอก Password');
        missing.push('Password');
        isValid = false;
      }
      if (!staffPositionInput.value.trim()) {
        setFieldError(staffPositionInput, 'staff-position-error', 'กรุณากรอกตำแหน่งงาน');
        missing.push('ตำแหน่งงาน');
        isValid = false;
      }
    }
  }

  if (!isValid) {
    showAlertModal(`กรุณากรอกข้อมูลให้ครบ: ${missing.join(', ')}`);
  }

  return isValid;
}

/* ═══════════════════════════════════════════════════════════
   SAVE (ADD / EDIT)
   ═══════════════════════════════════════════════════════════ */
document.getElementById('modal-save-btn').addEventListener('click', () => {
  if (!validateForm()) return;

  const role = roleSelect.value;

  if (state.modalMode === 'add') {
    let newId;
    const record = {
      role,
      fullname: fullnameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      avatar: state.pendingAvatarDataUrl
    };

    if (role === 'student') {
      newId = `STU${String(nextStudentNum).padStart(3, '0')}`;
      nextStudentNum++;
      record.id = newId;
      record.username = studentUsername.value.trim();
      record.password = studentPassword.value.trim();
      record.roomNumber = roomNumberInput.value.trim();
    } else if (role === 'staff') {
      newId = `STF${String(nextStaffNum).padStart(3, '0')}`;
      nextStaffNum++;
      record.id = newId;
      record.username = staffUsername.value.trim();
      record.password = staffPassword.value.trim();
      record.position = staffPositionInput.value.trim();
    } else if (role === 'technician') {
      newId = techNumberInput.value.trim() || `T${String(nextTechNum++)}`;
      record.id = newId;
      record.specialty = techSpecialty.value;
      record.techNumber = techNumberInput.value.trim();
      // ชื่อ-เบอร์ อาจไม่ได้กรอกถ้าฟิลด์ร่วมถูกซ่อน — ใช้ค่า fallback
      record.fullname = record.fullname || `ช่าง ${newId}`;
    }

    personnelData.push(record);
    showToast('เพิ่มข้อมูลบุคลากรสำเร็จ');
  } else {
    const p = personnelData.find(x => x.id === state.editingId);
    if (p) {
      p.fullname = fullnameInput.value.trim() || p.fullname;
      p.phone = phoneInput.value.trim();
      p.email = emailInput.value.trim();
      p.avatar = state.pendingAvatarDataUrl;

      if (p.role === 'student') {
        p.username = studentUsername.value.trim();
        p.password = studentPassword.value.trim();
        p.roomNumber = roomNumberInput.value.trim();
      } else if (p.role === 'staff') {
        p.username = staffUsername.value.trim();
        p.password = staffPassword.value.trim();
        p.position = staffPositionInput.value.trim();
      } else if (p.role === 'technician') {
        p.specialty = techSpecialty.value;
        p.techNumber = techNumberInput.value.trim();
      }
    }
    showToast('บันทึกการแก้ไขสำเร็จ');
  }

  closePersonnelModal();
  updateRoleCounts();
  state.currentPage = 1;
  renderGrid();
});

/* ═══════════════════════════════════════════════════════════
   DELETE (from card button OR from inside edit modal)
   ═══════════════════════════════════════════════════════════ */
const deleteModalOverlay = document.getElementById('delete-modal-overlay');

function openDeleteConfirm(id) {
  state.pendingDeleteId = id;
  const p = personnelData.find(x => x.id === id);
  document.getElementById('delete-modal-message').textContent =
    p ? `คุณต้องการลบ "${p.fullname}" ออกจากระบบใช่หรือไม่?` : 'คุณต้องการลบรายการนี้ออกจากระบบใช่หรือไม่?';
  deleteModalOverlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

modalDeleteBtn.addEventListener('click', () => {
  openDeleteConfirm(state.editingId);
});

document.getElementById('delete-cancel-btn').addEventListener('click', () => {
  deleteModalOverlay.classList.remove('is-open');
  document.body.style.overflow = personnelModalOverlay.classList.contains('is-open') ? 'hidden' : '';
});

deleteModalOverlay.addEventListener('click', (e) => {
  if (e.target === deleteModalOverlay) {
    deleteModalOverlay.classList.remove('is-open');
    document.body.style.overflow = personnelModalOverlay.classList.contains('is-open') ? 'hidden' : '';
  }
});

document.getElementById('delete-confirm-btn').addEventListener('click', () => {
  personnelData = personnelData.filter(p => p.id !== state.pendingDeleteId);
  deleteModalOverlay.classList.remove('is-open');
  closePersonnelModal();
  updateRoleCounts();
  renderGrid();
  showToast('ลบข้อมูลบุคลากรสำเร็จ');
});

/* ═══════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR NAVIGATION (placeholder — wire to real routing later)
   ═══════════════════════════════════════════════════════════ */
document.querySelectorAll('.sidebar__item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    if (page === 'personnel') return; // already here
    // TODO: window.location.href = `${page}.html`;
    console.log('Navigate to:', page);
  });
});

document.getElementById('logout-btn').addEventListener('click', () => {
  if (confirm('ยืนยันการออกจากระบบ?')) {
    window.location.href = 'login.html';
  }
});

/* ═══════════════════════════════════════════════════════════
   ESC KEY CLOSES ANY OPEN MODAL
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    personnelModalOverlay.classList.remove('is-open');
    deleteModalOverlay.classList.remove('is-open');
    document.getElementById('alert-modal-overlay').classList.remove('is-open');
    document.body.style.overflow = '';
  }
});

/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
initFilters();
updateRoleCounts();
renderGrid();
