/* ═══════════════════════════════════════════════════════════
   CONFIG — ปรับเกณฑ์สถานะได้ตรงนี้
   ═══════════════════════════════════════════════════════════ */
const STOCK_THRESHOLDS = {
  OUT: 0,       // จำนวน <= ค่านี้ => หมดคงคลัง
  LOW_MAX: 4    // จำนวน <= ค่านี้ (แต่มากกว่า OUT) => ใกล้จะหมด
  // มากกว่า LOW_MAX => คงคลัง
};

const CARDS_PER_PAGE = 6;

const CATEGORY_LABELS = {
  electric: 'ไฟฟ้า',
  plumbing: 'ประปา',
  furniture: 'เฟอร์นิเจอร์',
  room: 'ห้อง',
  internet: 'อินเทอร์เน็ต',
  other: 'อื่นๆ'
};

const CATEGORY_ICONS = {
  electric: 'bolt',
  plumbing: 'water_drop',
  furniture: 'chair',
  room: 'door_front',
  internet: 'wifi',
  other: 'category'
};

/* ═══════════════════════════════════════════════════════════
   MOCK DATA STORE (แทนที่ด้วย API ในเฟสถัดไป)
   ═══════════════════════════════════════════════════════════ */
let equipmentData = [
  { id: 'I001', name: 'เก้าอี้สำนักงาน', category: 'furniture', quantity: 4, unit: 'ตัว', image: null },
  { id: 'I002', name: 'ก๊อกน้ำ', category: 'plumbing', quantity: 1, unit: 'ชุด', image: null },
  { id: 'I003', name: 'หลอดไฟ LED', category: 'electric', quantity: 15, unit: 'ชิ้น', image: null },
  { id: 'I004', name: 'สายแลน Cat6', category: 'internet', quantity: 0, unit: 'เส้น', image: null },
  { id: 'I005', name: 'พัดลมตั้งพื้น', category: 'electric', quantity: 8, unit: 'ตัว', image: null },
  { id: 'I006', name: 'มือจับประตู', category: 'room', quantity: 3, unit: 'ชุด', image: null },
  { id: 'I007', name: 'โต๊ะเหล็ก', category: 'furniture', quantity: 6, unit: 'ตัว', image: null },
  { id: 'I008', name: 'เบรกเกอร์ไฟฟ้า', category: 'electric', quantity: 2, unit: 'ตัว', image: null },
  { id: 'I009', name: 'ท่อ PVC', category: 'plumbing', quantity: 0, unit: 'เส้น', image: null },
  { id: 'I010', name: 'เราเตอร์ Wi-Fi', category: 'internet', quantity: 5, unit: 'เครื่อง', image: null },
  { id: 'I011', name: 'กุญแจห้องพัก', category: 'room', quantity: 12, unit: 'ชุด', image: null },
  { id: 'I012', name: 'ที่นอน', category: 'other', quantity: 20, unit: 'ผืน', image: null }
];

let nextIdNumber = equipmentData.length + 1;

/* ═══════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════ */
const state = {
  searchTerm: '',
  statusFilter: 'all',
  categoryFilter: 'all',
  currentPage: 1,
  modalMode: 'add',     // 'add' | 'edit'
  editingId: null,
  pendingImageDataUrl: null,
  pendingDeleteId: null
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
function getStatus(qty) {
  if (qty <= STOCK_THRESHOLDS.OUT) return 'out';
  if (qty <= STOCK_THRESHOLDS.LOW_MAX) return 'low';
  return 'stock';
}

function getStatusLabel(status) {
  return { stock: 'คงคลัง', low: 'ใกล้จะหมด', out: 'หมดคงคลัง' }[status];
}

function getFilteredData() {
  return equipmentData.filter(item => {
    const matchesSearch =
      state.searchTerm === '' ||
      item.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(state.searchTerm.toLowerCase());

    const matchesStatus =
      state.statusFilter === 'all' || getStatus(item.quantity) === state.statusFilter;

    const matchesCategory =
      state.categoryFilter === 'all' || item.category === state.categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });
}

function updateStatusCounts() {
  // นับจำนวน "ชื่อรายการ" ไม่ใช่จำนวนชิ้น ตามที่ตกลงไว้
  const counts = { all: equipmentData.length, stock: 0, low: 0, out: 0 };
  equipmentData.forEach(item => {
    counts[getStatus(item.quantity)]++;
  });
  document.getElementById('count-all').textContent = counts.all;
  document.getElementById('count-stock').textContent = counts.stock;
  document.getElementById('count-low').textContent = counts.low;
  document.getElementById('count-out').textContent = counts.out;
}

/* ═══════════════════════════════════════════════════════════
   RENDER: CARD GRID + PAGINATION
   ═══════════════════════════════════════════════════════════ */
function renderCard(item) {
  const status = getStatus(item.quantity);
  const statusLabel = getStatusLabel(status);
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
  const icon = CATEGORY_ICONS[item.category] || 'inventory_2';

  const visualContent = item.image
    ? `<img src="${item.image}" alt="${escapeHtml(item.name)}" style="width:100%;height:100%;object-fit:cover;">`
    : `<span class="material-symbols-outlined">${icon}</span>`;

  return `
    <div class="eq-card" data-id="${item.id}">
      <div class="eq-card__visual">
        ${visualContent}
        <span class="eq-card__code">${item.id}</span>
      </div>
      <span class="eq-status-badge eq-status-badge--${status}">${statusLabel}</span>
      <div class="eq-card__top">
        <h4 class="eq-card__name">${escapeHtml(item.name)}</h4>
        <span class="eq-card__category">${categoryLabel}</span>
      </div>
      <div class="eq-card__meta">
        <span>รหัสครุภัณฑ์:</span><b>${item.id}</b>
        <span>จำนวนคงเหลือ:</span><b>${item.quantity} ${item.unit}</b>
      </div>
      <button class="eq-card__edit-btn" data-edit-id="${item.id}">แก้ไข</button>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderGrid() {
  const filtered = getFilteredData();
  const grid = document.getElementById('equipment-grid');
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
  attachCardEditListeners();
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

function attachCardEditListeners() {
  document.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.editId));
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

  document.getElementById('status-filter-row').addEventListener('click', (e) => {
    const pill = e.target.closest('.status-pill');
    if (!pill) return;
    document.querySelectorAll('.status-pill').forEach(p => p.classList.remove('is-active'));
    pill.classList.add('is-active');
    state.statusFilter = pill.dataset.status;
    state.currentPage = 1;
    renderGrid();
  });

  document.getElementById('category-chip-row').addEventListener('click', (e) => {
    const chip = e.target.closest('.category-chip');
    if (!chip) return;
    document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    state.categoryFilter = chip.dataset.category;
    state.currentPage = 1;
    renderGrid();
  });
}

/* ═══════════════════════════════════════════════════════════
   EQUIPMENT MODAL (Add / Edit)
   ═══════════════════════════════════════════════════════════ */
const equipmentModalOverlay = document.getElementById('equipment-modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalDeleteBtn = document.getElementById('modal-delete-btn');
const saveBtnLabel = document.getElementById('save-btn-label');
const saveBtnIcon = document.getElementById('save-btn-icon');

const nameInput = document.getElementById('equipment-name');
const categorySelect = document.getElementById('equipment-category');
const qtyInput = document.getElementById('equipment-quantity');
const imageInput = document.getElementById('image-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const uploadPreview = document.getElementById('upload-preview');
const previewImg = document.getElementById('preview-img');

function resetModalForm() {
  nameInput.value = '';
  categorySelect.value = '';
  qtyInput.value = 1;
  state.pendingImageDataUrl = null;
  uploadPlaceholder.style.display = 'flex';
  uploadPreview.style.display = 'none';
  imageInput.value = '';
  clearFieldErrors();
}

function clearFieldErrors() {
  document.getElementById('name-error').textContent = '';
  document.getElementById('category-error').textContent = '';
  document.getElementById('image-error').textContent = '';
  nameInput.classList.remove('has-error');
  categorySelect.classList.remove('has-error');
}

function openAddModal() {
  state.modalMode = 'add';
  state.editingId = null;
  resetModalForm();
  modalTitle.textContent = 'เพิ่มครุภัณฑ์';
  modalDeleteBtn.style.display = 'none';
  saveBtnLabel.textContent = 'เพิ่ม';
  saveBtnIcon.textContent = 'add_circle';
  equipmentModalOverlay.classList.add('is-open');
}

function openEditModal(id) {
  const item = equipmentData.find(e => e.id === id);
  if (!item) return;

  state.modalMode = 'edit';
  state.editingId = id;
  clearFieldErrors();

  nameInput.value = item.name;
  categorySelect.value = item.category;
  qtyInput.value = item.quantity;

  if (item.image) {
    state.pendingImageDataUrl = item.image;
    previewImg.src = item.image;
    uploadPlaceholder.style.display = 'none';
    uploadPreview.style.display = 'flex';
  } else {
    state.pendingImageDataUrl = null;
    uploadPlaceholder.style.display = 'flex';
    uploadPreview.style.display = 'none';
  }

  modalTitle.textContent = 'แก้ไขครุภัณฑ์';
  modalDeleteBtn.style.display = 'flex';
  saveBtnLabel.textContent = 'บันทึกข้อมูล';
  saveBtnIcon.textContent = 'save';
  equipmentModalOverlay.classList.add('is-open');
}

function closeEquipmentModal() {
  equipmentModalOverlay.classList.remove('is-open');
}

document.getElementById('open-add-modal').addEventListener('click', openAddModal);
document.getElementById('modal-close-btn').addEventListener('click', closeEquipmentModal);
document.getElementById('modal-cancel-btn').addEventListener('click', closeEquipmentModal);
equipmentModalOverlay.addEventListener('click', (e) => {
  if (e.target === equipmentModalOverlay) closeEquipmentModal();
});

/* Image upload preview */
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.pendingImageDataUrl = e.target.result;
    previewImg.src = e.target.result;
    uploadPlaceholder.style.display = 'none';
    uploadPreview.style.display = 'flex';
    document.getElementById('image-error').textContent = '';
  };
  reader.readAsDataURL(file);
});

/* Quantity stepper */
document.getElementById('qty-increment').addEventListener('click', () => {
  qtyInput.value = parseInt(qtyInput.value || 0, 10) + 1;
});
document.getElementById('qty-decrement').addEventListener('click', () => {
  const val = parseInt(qtyInput.value || 0, 10);
  if (val > 0) qtyInput.value = val - 1;
});

/* Validation + Save */
function showAlertModal(message) {
  document.getElementById('alert-modal-message').textContent = message;
  document.getElementById('alert-modal-overlay').classList.add('is-open');
}

document.getElementById('alert-modal-close').addEventListener('click', () => {
  document.getElementById('alert-modal-overlay').classList.remove('is-open');
});

function validateForm() {
  clearFieldErrors();
  let isValid = true;
  const missing = [];

  if (!nameInput.value.trim()) {
    document.getElementById('name-error').textContent = 'กรุณากรอกชื่อครุภัณฑ์';
    nameInput.classList.add('has-error');
    missing.push('ชื่อครุภัณฑ์');
    isValid = false;
  }

  if (!categorySelect.value) {
    document.getElementById('category-error').textContent = 'กรุณาเลือกประเภท';
    categorySelect.classList.add('has-error');
    missing.push('ประเภท');
    isValid = false;
  }

  if (state.modalMode === 'add' && !state.pendingImageDataUrl) {
    document.getElementById('image-error').textContent = 'กรุณาอัปโหลดรูปภาพครุภัณฑ์';
    missing.push('รูปภาพ');
    isValid = false;
  }

  if (!isValid) {
    showAlertModal(`กรุณากรอกข้อมูลให้ครบ: ${missing.join(', ')}`);
  }

  return isValid;
}

document.getElementById('modal-save-btn').addEventListener('click', () => {
  if (!validateForm()) return;

  const name = nameInput.value.trim();
  const category = categorySelect.value;
  const quantity = Math.max(0, parseInt(qtyInput.value || 0, 10));

  if (state.modalMode === 'add') {
    const newId = `I${String(nextIdNumber).padStart(3, '0')}`;
    nextIdNumber++;
    equipmentData.push({
      id: newId,
      name,
      category,
      quantity,
      unit: 'ชิ้น',
      image: state.pendingImageDataUrl
    });
  } else {
    const item = equipmentData.find(e => e.id === state.editingId);
    if (item) {
      item.name = name;
      item.category = category;
      item.quantity = quantity;
      item.image = state.pendingImageDataUrl;
    }
  }

  closeEquipmentModal();
  updateStatusCounts();
  state.currentPage = 1;
  renderGrid();
});

/* ═══════════════════════════════════════════════════════════
   DELETE CONFIRMATION MODAL
   ═══════════════════════════════════════════════════════════ */
const deleteModalOverlay = document.getElementById('delete-modal-overlay');

modalDeleteBtn.addEventListener('click', () => {
  state.pendingDeleteId = state.editingId;
  const item = equipmentData.find(e => e.id === state.editingId);
  document.getElementById('delete-modal-message').textContent =
    item ? `คุณต้องการลบ "${item.name}" ออกจากระบบใช่หรือไม่?` : 'คุณต้องการลบรายการนี้ออกจากระบบใช่หรือไม่?';
  deleteModalOverlay.classList.add('is-open');
});

document.getElementById('delete-cancel-btn').addEventListener('click', () => {
  deleteModalOverlay.classList.remove('is-open');
});

deleteModalOverlay.addEventListener('click', (e) => {
  if (e.target === deleteModalOverlay) deleteModalOverlay.classList.remove('is-open');
});

document.getElementById('delete-confirm-btn').addEventListener('click', () => {
  equipmentData = equipmentData.filter(e => e.id !== state.pendingDeleteId);
  deleteModalOverlay.classList.remove('is-open');
  closeEquipmentModal();
  updateStatusCounts();
  renderGrid();
});

/* ═══════════════════════════════════════════════════════════
   SIDEBAR NAVIGATION (placeholder — wire to real routing later)
   ═══════════════════════════════════════════════════════════ */
document.querySelectorAll('.sidebar__item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    if (page === 'equipment') return; // already here
    // Placeholder: future navigation, e.g. window.location.href = `${page}.html`;
    console.log('Navigate to:', page);
  });
});

document.getElementById('logout-btn').addEventListener('click', () => {
  console.log('Logout clicked (placeholder)');
});

/* ═══════════════════════════════════════════════════════════
   ESC KEY CLOSES ANY OPEN MODAL
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    equipmentModalOverlay.classList.remove('is-open');
    deleteModalOverlay.classList.remove('is-open');
    document.getElementById('alert-modal-overlay').classList.remove('is-open');
  }
});

/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
initFilters();
updateStatusCounts();
renderGrid();