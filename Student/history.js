
'use strict';
(function () {
  if (sessionStorage.getItem('mainNav') === '1') {
    const nav = document.querySelector('.bottom-nav');
    if (nav) {
      nav.classList.add('no-anim');   /* → CSS ปิด animation */
      sessionStorage.removeItem('mainNav');
    }
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  /* ── 0. Case Data (mock) ── */
  const CASES = [
    { id: '1100067', dateRaw: '25690207', dateDisplay: '07/02/2569', items: 'ไฟเสีย, ชักโครกชำรุด', types: ['งานไฟฟ้า', 'งานประปา'], status: 'pending' },
    { id: '1100063', dateRaw: '25690206', dateDisplay: '06/02/2569', items: 'หน้าต่างชำรุด, บานพับหัก', types: ['งานช่างทั่วไป'], status: 'pending' },
    { id: '1100059', dateRaw: '25690207', dateDisplay: '07/02/2569', items: 'โคมไฟชำรุด', types: ['งานไฟฟ้า'], status: 'working' },
    { id: '1100052', dateRaw: '25690201', dateDisplay: '01/02/2569', items: 'เตียงนอนชำรุด, ขาโต๊ะหัก', types: ['งานเฟอร์นิเจอร์'], status: 'working' },
    { id: '1100045', dateRaw: '25690120', dateDisplay: '20/01/2569', items: 'แอร์ไม่เย็น (คอมเพรสเซอร์เสีย)', types: ['งานระบบปรับอากาศ'], status: 'done' },
    { id: '1100030', dateRaw: '25690203', dateDisplay: '03/02/2569', items: 'เตียงนอนชำรุด', types: ['งานเฟอร์นิเจอร์'], status: 'done' },
    { id: '1100028', dateRaw: '25690115', dateDisplay: '15/01/2569', items: 'ก๊อกน้ำรั่ว, ท่อน้ำตัน', types: ['งานประปา'], status: 'done' },
    { id: '1100015', dateRaw: '25681220', dateDisplay: '20/12/2568', items: 'ประตูห้องน้ำชำรุด', types: ['งานช่างทั่วไป'], status: 'cancel' },
  ];

  const STATUS_ORDER = { pending: 0, working: 1, done: 2, cancel: 3 };
  const STATUS_CONFIG = {
    pending: { label: 'รอตรวจสอบ', cls: 'st-pending' },
    working: { label: 'อยู่ระหว่างการซ่อม', cls: 'st-working' },
    done:    { label: 'เสร็จสิ้น', cls: 'st-done' },
    cancel:  { label: 'ยกเลิก', cls: 'st-cancel' },
  };
  const SECTION_TITLE = { date: 'รายการทั้งหมด', type: 'เรียงตามประเภทงาน', status: 'แบ่งตามความคืบหน้า' };

  /* ── 2. State ── */
  let sortKey = 'date';
  let dateDir = 'desc';

  /* ── 3. DOM References ── */
  const searchInput = document.getElementById('searchInput');
  const btnClear    = document.getElementById('btnClear');
  const cardStack   = document.getElementById('cardStack');
  const emptyState  = document.getElementById('emptyState');
  const countPill   = document.getElementById('countPill');
  const totalBadge  = document.getElementById('totalBadge');
  const dateDirIcon = document.getElementById('dateDirIcon');
  const secTitle    = document.getElementById('secTitle');
  const chips       = document.querySelectorAll('.chip');
  const navItems    = document.querySelectorAll('.nav-it');
  const MAIN_TABS = ['home', 'history', 'profile'];
  const bottomNav = document.querySelector('.bottom-nav');

  /* ── 4. Init ── */
  totalBadge.textContent = `${CASES.length} รายการ`;
  render();

  /* ── 5. Render ── */
  function render() {
    const q = searchInput.value.trim().toLowerCase();
    let list = CASES.filter(c => !q || c.id.toLowerCase().includes(q) || c.items.toLowerCase().includes(q) || c.types.some(t => t.toLowerCase().includes(q)));

    switch (sortKey) {
      case 'date':
        list.sort((a, b) => dateDir === 'desc' ? b.dateRaw.localeCompare(a.dateRaw) : a.dateRaw.localeCompare(b.dateRaw));
        break;
      case 'type':
        list.sort((a, b) => a.types[0].localeCompare(b.types[0], 'th', { sensitivity: 'base' }));
        break;
      case 'status':
        list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
        break;
    }

    cardStack.innerHTML = '';
    if (list.length === 0) { emptyState.classList.add('show'); countPill.textContent = 0; return; }
    emptyState.classList.remove('show');
    countPill.textContent = list.length;

    if (sortKey === 'status') buildGrouped(list);
    else list.forEach((c, i) => cardStack.appendChild(createCard(c, i)));
  }

  function buildGrouped(list) {
    const groups = {};
    list.forEach(c => { if (!groups[c.status]) groups[c.status] = []; groups[c.status].push(c); });
    let cardIdx = 0;
    Object.keys(groups).sort((a, b) => STATUS_ORDER[a] - STATUS_ORDER[b]).forEach(status => {
      const cfg = STATUS_CONFIG[status];
      const items = groups[status];
      const hdr = document.createElement('div');
      hdr.className = `group-header ${cfg.cls}`;
      hdr.innerHTML = `<span class="group-dot"></span><span class="group-title">${cfg.label}</span><span class="group-count">${items.length} รายการ</span>`;
      cardStack.appendChild(hdr);
      items.forEach(c => cardStack.appendChild(createCard(c, cardIdx++)));
    });
  }

  function createCard(c, idx) {
    const cfg = STATUS_CONFIG[c.status];
    const tagsHtml = c.types.map(t => `<span class="tag">${t}</span>`).join('');
    const delay = (Math.min(idx, 6) * 0.06).toFixed(2);
    const el = document.createElement('a');
    el.className = `r-card ${cfg.cls}`;
    el.href = '#';
    el.dataset.id = c.id;
    el.dataset.status = c.status;
    el.style.animationDelay = `${delay}s`;
    el.innerHTML = `<div class="card-body"><div class="card-r1"><div><p class="c-lbl">รหัส Case</p><p class="c-num">#${c.id}</p></div><div><p class="c-lbl" style="text-align:right">วันที่แจ้ง</p><p class="d-val">${c.dateDisplay}</p></div></div><div class="card-r2"><div class="info-row"><span class="i-key">รายการซ่อม</span><span class="i-val">${c.items}</span></div><div class="info-row"><span class="i-key">ประเภทงาน</span><span class="i-val">${tagsHtml}</span></div></div><div class="card-r3"><span class="st-badge ${cfg.cls}"><span class="st-dot"></span>${cfg.label}</span><span class="arrow-circle"><span class="material-symbols-outlined">chevron_right</span></span></div></div>`;
    el.addEventListener('click', e => { e.preventDefault(); console.log('[Card] caseId:', c.id); });
    return el;
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.sort;
      if (key === sortKey) { if (key === 'date') { dateDir = dateDir === 'desc' ? 'asc' : 'desc'; dateDirIcon.textContent = dateDir === 'desc' ? 'arrow_downward' : 'arrow_upward'; } }
      else {
        sortKey = key; dateDir = 'desc'; dateDirIcon.textContent = 'arrow_downward';
        chips.forEach(ch => { ch.classList.remove('chip-active'); ch.classList.add('chip-inactive'); ch.setAttribute('aria-pressed', 'false'); });
        chip.classList.remove('chip-inactive'); chip.classList.add('chip-active'); chip.setAttribute('aria-pressed', 'true');
        secTitle.textContent = SECTION_TITLE[sortKey];
      }
      render();
    });
  });

  searchInput.addEventListener('input', () => { btnClear.classList.toggle('show', searchInput.value.length > 0); render(); });
  btnClear.addEventListener('click', () => { searchInput.value = ''; btnClear.classList.remove('show'); searchInput.focus(); render(); });
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      btn.classList.add('active');
      const page = btn.dataset.page;
      console.log('[Nav] →', page);
      if (page === 'home') window.location.href = 'home.html';
      if (page === 'profile') window.location.href = 'profile.html';
    });
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