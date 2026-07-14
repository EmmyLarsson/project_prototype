/* ═══════════════════════════════════════════════════════
   home.js · UniMaintain Staff Portal Dashboard
   ═══════════════════════════════════════════════════════ */
'use strict';

/* ── นาฬิกาตามเวลาเครื่องผู้ใช้ ─────────────── */
function updateClock() {
  const now = new Date();
  const days = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const beYear = now.getFullYear() + 543;
  document.getElementById('current-date').textContent =
    `วัน${days[now.getDay()]}ที่ ${now.getDate()} ${months[now.getMonth()]} ${beYear}`;
  document.getElementById('current-time').textContent =
    `เวลา ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')} น.`;
}
updateClock();
setInterval(updateClock, 1000);

/* ── Sidebar navigation state ───────────────── */
document.querySelectorAll('.sidebar__item').forEach(item => {
  item.addEventListener('click', function() {
    document.querySelector('.sidebar__item.is-active')?.classList.remove('is-active');
    this.classList.add('is-active');
    // TODO: เชื่อม router จริง เช่น window.location.href = pageMap[this.dataset.page]
  });
});

document.getElementById('logout-btn').addEventListener('click', () => {
  // TODO: เชื่อม API logout จริงในอนาคต
  if (confirm('ยืนยันการออกจากระบบ?')) {
    window.location.href = 'login.html';
  }
});

document.getElementById('view-all-btn').addEventListener('click', () => {
  window.location.href = 'repair_management.html'; // หน้าจัดการงานซ่อม
});

/* ── Avatar SVG generator (inline, ไม่โหลดรูปนอก) ───── */
function avatarSVG(seed, hasPhoto) {
  const colors = ['#1a40c2','#705d00','#22863a','#ba1a1a','#6d28d9'];
  const c = colors[seed % colors.length];
  if (hasPhoto) {
    return `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="${c}22"/>
      <circle cx="32" cy="24" r="12" fill="${c}"/>
      <path d="M8 60c0-14 10-22 24-22s24 8 24 22" fill="${c}"/></svg>`;
  }
  return `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e0e3e8"/>
    <circle cx="32" cy="24" r="11" fill="#9aa0ac"/>
    <path d="M10 58c0-13 9-20 22-20s22 7 22 20" fill="#9aa0ac"/></svg>`;
}

/* ── Demo data: รายการแจ้งซ่อม (mock, รอเชื่อม API) ───── */
const requests = [
  { case:'1100067', name:'แอนนี่ เวอร์ตัน', room:'100934', date:'07/02/2569', status:'รอตรวจสอบ', hasPhoto:true },
  { case:'1100068', name:'นายสมชาย สายน้ำ', room:'100456', date:'08/02/2569', status:'รอตรวจสอบ', hasPhoto:false },
  { case:'1100069', name:'นางสาวปาริชาต ใจดี', room:'110210', date:'08/02/2569', status:'รอตรวจสอบ', hasPhoto:false },
  { case:'1100070', name:'นายวีระ ชัยชนะ', room:'100112', date:'09/02/2569', status:'รอตรวจสอบ', hasPhoto:true },
  { case:'1100071', name:'นางสาวศิริพร แสงทอง', room:'110305', date:'09/02/2569', status:'รอตรวจสอบ', hasPhoto:false },
  { case:'1100072', name:'นายอนุชา ทองแท้', room:'100621', date:'10/02/2569', status:'รอตรวจสอบ', hasPhoto:false },
];

const PAGE_SIZE = 4;
let currentPage = 1;
const totalPages = Math.ceil(requests.length / PAGE_SIZE);

function renderRequests(page) {
  const grid = document.getElementById('request-grid');
  grid.innerHTML = '';
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = requests.slice(start, start + PAGE_SIZE);

  pageItems.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'req-card';
    card.innerHTML = `
      <div class="req-card__top">
        <div class="req-avatar">${avatarSVG(start + i, r.hasPhoto)}</div>
        <div class="req-info">
          <div class="req-info__case">หมายเลข Case: <b>${r.case}</b></div>
          <div class="req-info__name">${r.name}</div>
          <div class="req-info__room">หมายเลขห้อง: <b>${r.room}</b></div>
        </div>
      </div>
      <div class="req-card__bottom">
        <div>
          <div class="req-date">วันที่แจ้ง: <b>${r.date}</b></div>
          <span class="status-badge">สถานะ: ${r.status}</span>
        </div>
        <div class="req-actions">
          <button class="btn-detail" data-case="${r.case}">
            <span class="material-symbols-outlined" style="font-size:16px;">visibility</span> ดูเพิ่มเติม
          </button>
          <div class="req-actions__row">
            <button class="btn-approve" data-case="${r.case}">
              <span class="material-symbols-outlined" style="font-size:16px;">check_circle</span> อนุมัติ
            </button>
            <button class="btn-reject" data-case="${r.case}">
              <span class="material-symbols-outlined" style="font-size:16px;">cancel</span> ปฏิเสธ
            </button>
          </div>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  bindCardActions();
}

function bindCardActions() {
  document.querySelectorAll('.btn-detail').forEach(btn =>
    btn.addEventListener('click', () => {
      // TODO: เชื่อม API / เปิด modal รายละเอียด case
      alert('ดูรายละเอียด Case: ' + btn.dataset.case + ' (รอเชื่อม API)');
    }));
  document.querySelectorAll('.btn-approve').forEach(btn =>
    btn.addEventListener('click', () => {
      // TODO: เชื่อม API อนุมัติ
      alert('อนุมัติ Case: ' + btn.dataset.case + ' (รอเชื่อม API)');
    }));
  document.querySelectorAll('.btn-reject').forEach(btn =>
    btn.addEventListener('click', () => {
      // TODO: เชื่อม API ปฏิเสธ
      alert('ปฏิเสธ Case: ' + btn.dataset.case + ' (รอเชื่อม API)');
    }));
}

function renderPagination() {
  const pag = document.getElementById('pagination');
  pag.innerHTML = '';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">chevron_left</span>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
  pag.appendChild(prevBtn);

  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (p === currentPage ? ' is-active' : '');
    btn.textContent = p;
    btn.addEventListener('click', () => goToPage(p));
    pag.appendChild(btn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">chevron_right</span>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
  pag.appendChild(nextBtn);
}

function goToPage(p) {
  if (p < 1 || p > totalPages) return;
  currentPage = p;
  renderRequests(currentPage);
  renderPagination();
  document.getElementById('request-grid').scrollIntoView({ behavior:'smooth', block:'nearest' });
}

renderRequests(currentPage);
renderPagination();