/* ==========================================================================
   app.js
   Global site behavior: navbar scroll state, mobile menu, floating action
   buttons, FAQ accordion, before/after slider, gallery filters, before/after
   category tabs.
   ========================================================================== */

(function () {
  /* ---------- Navbar scroll state ---------- */
  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.mobile-close');
    if (!burger || !menu) return;

    burger.addEventListener('click', () => menu.classList.add('open'));
    if (closeBtn) closeBtn.addEventListener('click', () => menu.classList.remove('open'));

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => menu.classList.remove('open'));
    });
  }

  /* ---------- Floating "back to top" ---------- */
  function initBackToTop() {
    const toTop = document.getElementById('toTop');
    if (!toTop) return;

    window.addEventListener('scroll', () => {
      toTop.style.display = window.scrollY > 500 ? 'flex' : 'none';
    });

    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach((item) => {
      item.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        items.forEach((i) => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  /* ---------- Before / After slider ---------- */
  function initBeforeAfterSlider() {
    const slider = document.getElementById('ba-slider');
    const after = document.getElementById('ba-after');
    if (!slider || !after) return;

    let dragging = false;

    const setPosition = (clientX) => {
      const wrap = slider.parentElement.getBoundingClientRect();
      let pct = ((clientX - wrap.left) / wrap.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      slider.style.left = pct + '%';
      after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    };

    slider.addEventListener('mousedown', () => (dragging = true));
    window.addEventListener('mouseup', () => (dragging = false));
    window.addEventListener('mousemove', (e) => {
      if (dragging) setPosition(e.clientX);
    });

    slider.addEventListener('touchstart', () => (dragging = true));
    window.addEventListener('touchend', () => (dragging = false));
    window.addEventListener('touchmove', (e) => {
      if (dragging && e.touches[0]) setPosition(e.touches[0].clientX);
    });
  }

  /* ---------- Before / After category tabs ---------- */
  function initBeforeAfterTabs() {
    const tabs = document.querySelectorAll('.ba-tab');
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        // In production: swap ba-image source / meta based on tab.dataset.category
      });
    });
  }

  /* ---------- Gallery filters ---------- */
  function initGalleryFilters() {
    const filters = document.querySelectorAll('.gallery-filters button');
    const items = document.querySelectorAll('.masonry .item');
    if (!filters.length || !items.length) return;

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        filters.forEach((f) => f.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.dataset.filter;

        items.forEach((item) => {
          if (category === 'all' || item.dataset.category === category) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initMobileMenu();
    initBackToTop();
    initFAQ();
    initBeforeAfterSlider();
    initBeforeAfterTabs();
    initGalleryFilters();
  });
})();
