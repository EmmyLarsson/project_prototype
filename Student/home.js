'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // ── Element References ──────────────────────────────────
    const searchInput = document.getElementById('searchInput');
    const btnClear    = document.getElementById('btnClear');
    const cardStack   = document.getElementById('cardStack');
    const emptyState  = document.getElementById('emptyState');
    const countPill   = document.getElementById('countPill');
    const statCards   = document.querySelectorAll('.stat-card');
    const navItems    = document.querySelectorAll('.nav-it');
    const fabBtn      = document.getElementById('fabBtn');
    const notifBtn    = document.getElementById('notifBtn');
    const MAIN_TABS = ['home', 'history', 'profile'];
    const bottomNav = document.querySelector('.bottom-nav');

    let activeFilter = 'all';

    // ══════════════════════════════════════════
    // 1. Init Statistics
    // ══════════════════════════════════════════
    function initStats() {
        const cards = cardStack.querySelectorAll('.r-card');
        let p = 0, w = 0, d = 0;
        cards.forEach(c => {
            const s = c.dataset.status;
            if (s === 'pending') p++;
            else if (s === 'working') w++;
            else if (s === 'done') d++;
        });
        document.getElementById('cntPending').textContent = p;
        document.getElementById('cntWorking').textContent = w;
        document.getElementById('cntDone').textContent    = d;
        countPill.textContent = cards.length;
    }
    initStats();

    // ══════════════════════════════════════════
    // 2. Navigation Tab Switches
 navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            if (page === 'profile')    { window.location.href = 'profile.html';    return; }
            if (page === 'history') { window.location.href = 'history.html'; return; }
            // profile → อยู่หน้านี้แล้ว
        });
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
        });
    });

    

    // ══════════════════════════════════════════
    // 3. Stats Filter Cards Handler
    // ══════════════════════════════════════════
    statCards.forEach(card => {
        card.addEventListener('click', () => {
            const filter = card.dataset.filter;
            if (activeFilter === filter) {
                activeFilter = 'all';
                statCards.forEach(s => { s.classList.remove('active'); s.setAttribute('aria-pressed','false'); });
            } else {
                activeFilter = filter;
                statCards.forEach(s => { s.classList.remove('active'); s.setAttribute('aria-pressed','false'); });
                card.classList.add('active');
                card.setAttribute('aria-pressed','true');
            }
            applyFilters();
        });
        card.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); card.click(); } });
    });

    // ══════════════════════════════════════════
    // 4. Search Bar Events
    // ══════════════════════════════════════════
    searchInput.addEventListener('input', () => {
        btnClear.classList.toggle('show', searchInput.value.length > 0);
        applyFilters();
    });
    
    btnClear.addEventListener('click', () => {
        searchInput.value = '';
        btnClear.classList.remove('show');
        searchInput.focus();
        applyFilters();
    });
    
    searchInput.addEventListener('keydown', e => { if (e.key==='Enter') e.preventDefault(); });

    // ══════════════════════════════════════════
    // 5. Core Filtering System
    // ══════════════════════════════════════════
    function applyFilters() {
        const q = searchInput.value.trim().toLowerCase();
        const allCards = cardStack.querySelectorAll('.r-card');
        let visible = 0;
        
        allCards.forEach(card => {
            const match =
                (!q || card.dataset.id.toLowerCase().includes(q) || card.dataset.items.toLowerCase().includes(q)) &&
                (activeFilter === 'all' || card.dataset.status === activeFilter);
            card.style.display = match ? '' : 'none';
            if (match) visible++;
        });
        
        countPill.textContent = visible;
        emptyState.classList.toggle('show', visible === 0);
    }

    // ══════════════════════════════════════════
    // 6. Maintenance Card Actions
    // ══════════════════════════════════════════
    cardStack.querySelectorAll('.r-card').forEach(card => {
        card.addEventListener('click', e => {
            e.preventDefault();
            console.log('[Card] caseId:', card.dataset.id);
        });
    });

    // ══════════════════════════════════════════
    // 7. Floating Action Button (FAB)
    // ══════════════════════════════════════════
    fabBtn.addEventListener('click', () => {
        console.log('[FAB] new repair request');
        window.location.href = 'report_submit.html';
    });

    // ══════════════════════════════════════════
    // 8. Notification Badge Action
    // ══════════════════════════════════════════
    notifBtn.addEventListener('click', () => {
        console.log('[Notif] open');
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