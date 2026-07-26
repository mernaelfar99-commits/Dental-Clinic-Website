/* ==========================================================================
   animations.js
   Handles: loading screen, particles, scroll reveal, animated counters.
   ========================================================================== */

(function () {
  /* ---------- Loading Screen ---------- */
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 4 + 's';
      loader.appendChild(p);
    }

    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hide'), 1800);
    });

    // Fallback in case 'load' already fired
    setTimeout(() => loader.classList.add('hide'), 3500);
  }

  /* ---------- Scroll Reveal ---------- */
  function initReveal() {
    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((t) => io.observe(t));
  }

  /* ---------- Animated Counters ---------- */
  function initCounters() {
    const statsSection = document.getElementById('stats');
    if (!statsSection) return;

    let counted = false;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !counted) {
            counted = true;
            statsSection.querySelectorAll('.stat .num').forEach((numEl) => {
              const raw = numEl.textContent.trim();
              const match = raw.match(/\d+/);
              if (match && !raw.includes('★')) {
                const target = parseInt(match[0], 10);
                const prefix = raw.split(match[0])[0];
                const suffix = raw.split(match[0])[1] || '';
                let current = 0;
                const step = Math.max(1, Math.ceil(target / 40));
                const interval = setInterval(() => {
                  current += step;
                  if (current >= target) {
                    current = target;
                    clearInterval(interval);
                  }
                  numEl.textContent = prefix + current + suffix;
                }, 30);
              }
            });
          }
        });
      },
      { threshold: 0.4 }
    );

    io.observe(statsSection);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initReveal();
    initCounters();
  });
})();
