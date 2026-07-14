/* ═══════════════ rating.js ═══════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1) STAR RATING ---------- */
  const stars = document.querySelectorAll('.rating-star');
  const feedbackBox  = document.getElementById('ratingFeedback');
  const feedbackIcon = document.getElementById('ratingFeedbackIcon');
  const feedbackText = document.getElementById('ratingFeedbackText');

  const LEVELS = {
    1: { text: 'แย่มาก ไม่พึงพอใจ',        icon: 'sentiment_very_dissatisfied' },
    2: { text: 'พอใช้ ควรปรับปรุง',        icon: 'sentiment_dissatisfied' },
    3: { text: 'ปานกลาง',                  icon: 'sentiment_neutral' },
    4: { text: 'ดี พึงพอใจ',               icon: 'sentiment_satisfied' },
    5: { text: 'ยอดเยี่ยม ประทับใจมาก',     icon: 'sentiment_very_satisfied' },
  };

  let currentRating = 0;

  function renderStars(rating, animate = false) {
    stars.forEach((star, idx) => {
      const val = idx + 1;
      star.classList.remove('is-pop');
      if (val <= rating) {
        star.classList.add('is-active');
      } else {
        star.classList.remove('is-active');
      }
    });
    if (animate) {
      const target = stars[rating - 1];
      if (target) {
        // reflow เพื่อ retrigger animation
        target.classList.remove('is-pop');
        void target.offsetWidth;
        target.classList.add('is-pop');
      }
    }
  }

  function updateFeedback(rating) {
    if (rating === 0) {
      feedbackBox.removeAttribute('data-level');
      feedbackIcon.textContent = 'sentiment_neutral';
      feedbackText.textContent = 'โปรดให้คะแนนความพึงพอใจ';
      return;
    }
    const level = LEVELS[rating];
    feedbackBox.setAttribute('data-level', rating);
    feedbackIcon.textContent = level.icon;
    feedbackText.textContent = level.text;
  }

  stars.forEach((star) => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value, 10);
      currentRating = value;
      renderStars(value, true);
      updateFeedback(value);
      if (window.navigator.vibrate) window.navigator.vibrate(12);
    });

    // hover preview (desktop)
    star.addEventListener('mouseenter', () => {
      const value = parseInt(star.dataset.value, 10);
      renderStars(value);
    });
  });

  document.getElementById('ratingStars').addEventListener('mouseleave', () => {
    renderStars(currentRating);
  });

  /* ---------- 2) TEXTAREA CHAR COUNT ---------- */
  const textarea  = document.getElementById('suggestions');
  const charCount = document.getElementById('charCount');

  textarea.addEventListener('input', () => {
    let length = textarea.value.length;
    if (length > 500) {
      textarea.value = textarea.value.substring(0, 500);
      length = 500;
    }
    charCount.textContent = `${length} / 500`;
  });

  /* ---------- 3) UPLOAD PHOTO ---------- */
  const MAX_FILES = 6;
  const MAX_SIZE_MB = 10;
  const uploadInput = document.getElementById('photoUpload');
  const uploadZone  = document.getElementById('uploadZone');
  const imgGrid      = document.getElementById('imgGrid');
  const imgCounter   = document.getElementById('imgCounter');

  let uploadedFiles = [];

  function updateCounter() {
    imgCounter.textContent = `${uploadedFiles.length}/${MAX_FILES}`;
    uploadZone.classList.toggle('is-full', uploadedFiles.length >= MAX_FILES);
  }

  function renderThumbs() {
    imgGrid.innerHTML = '';
    uploadedFiles.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const thumb = document.createElement('div');
      thumb.className = 'img-thumb';
      thumb.innerHTML = `
        <img src="${url}" alt="รูปที่ ${index + 1}">
        <button class="img-thumb__del" data-index="${index}" aria-label="ลบรูป">
          <span class="material-symbols-outlined">close</span>
        </button>
      `;
      imgGrid.appendChild(thumb);
    });

    imgGrid.querySelectorAll('.img-thumb__del').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(btn.dataset.index, 10);
        uploadedFiles.splice(idx, 1);
        renderThumbs();
        updateCounter();
      });
    });
  }

  function addFiles(fileList) {
    const files = Array.from(fileList);
    for (const file of files) {
      if (uploadedFiles.length >= MAX_FILES) {
        showToast(`แนบรูปได้สูงสุด ${MAX_FILES} รูป`);
        break;
      }
      if (!file.type.startsWith('image/')) {
        showToast('รองรับเฉพาะไฟล์รูปภาพ');
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        showToast(`ไฟล์ "${file.name}" มีขนาดเกิน ${MAX_SIZE_MB} MB`);
        continue;
      }
      uploadedFiles.push(file);
    }
    renderThumbs();
    updateCounter();
  }

  uploadInput.addEventListener('change', (e) => {
    addFiles(e.target.files);
    uploadInput.value = '';
  });

  // Drag & drop
  ['dragenter', 'dragover'].forEach((evt) => {
    uploadZone.addEventListener(evt, (e) => {
      e.preventDefault();
      if (uploadedFiles.length < MAX_FILES) uploadZone.classList.add('drag-over');
    });
  });
  ['dragleave', 'drop'].forEach((evt) => {
    uploadZone.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
    });
  });
  uploadZone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  });

  /* ---------- TOAST ---------- */
  const toast     = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  let toastTimer  = null;

  function showToast(message) {
    toastText.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  /* ---------- SUCCESS MODAL ---------- */
  const modalOverlay = document.getElementById('modalOverlay');
  const btnModalClose = document.getElementById('btnModalClose');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnBack = document.getElementById('btnBack');

  btnSubmit.addEventListener('click', () => {
    if (currentRating === 0) {
      showToast('โปรดให้คะแนนความพึงพอใจก่อนยืนยัน');
      document.getElementById('ratingStars').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    // TODO: ส่งข้อมูล currentRating, textarea.value, uploadedFiles ไปยัง API
    modalOverlay.classList.add('is-visible');
  });

  btnModalClose.addEventListener('click', () => {
    modalOverlay.classList.remove('is-visible');
    // TODO: redirect กลับไปหน้ารายการงานซ่อม
  });

  btnBack.addEventListener('click', () => {
    // TODO: redirect กลับไปหน้าก่อนหน้า
    window.history.back();
  });

  updateFeedback(0);
  updateCounter();
});