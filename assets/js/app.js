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

    // passive listener for better scroll performance
    window.addEventListener('scroll', onScroll, { passive: true });
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

    // use RAF to batch DOM writes on scroll
    let ticking = false;
    const updateToTop = () => {
      const y = window.scrollY;
      toTop.style.display = y > 500 ? 'flex' : 'none';
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateToTop);
        ticking = true;
      }
    }, { passive: true });

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

    // Use pointer events + RAF to reduce layout thrashing
    let dragging = false;
    let pendingX = null;
    const wrap = slider.parentElement;

    const applyPosition = () => {
      if (pendingX === null) return;
      const rect = wrap.getBoundingClientRect();
      let pct = ((pendingX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      // update width of after (more performant than clip-path)
      after.style.width = pct + '%';
      // position slider using transform to avoid layout where possible
      slider.style.left = pct + '%';
      pendingX = null;
    };

    const schedule = () => {
      if (pendingX === null) return;
      requestAnimationFrame(applyPosition);
    };

    const onPointerMove = (clientX) => {
      pendingX = clientX;
      if (pendingX !== null) schedule();
    };

    slider.addEventListener('pointerdown', (e) => {
      dragging = true;
      slider.setPointerCapture && slider.setPointerCapture(e.pointerId);
    });

    window.addEventListener('pointerup', () => {
      dragging = false;
      pendingX = null;
    });

    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      e.preventDefault();
      onPointerMove(e.clientX);
    });

    // touch fallback for older browsers
    slider.addEventListener('touchstart', () => (dragging = true));
    window.addEventListener('touchend', () => (dragging = false));
    window.addEventListener('touchmove', (e) => {
      if (dragging && e.touches && e.touches[0]) {
        onPointerMove(e.touches[0].clientX);
      }
    }, { passive: false });
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
