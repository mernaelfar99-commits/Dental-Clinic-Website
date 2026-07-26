/* ==========================================================================
   language.js
   Handles Arabic (RTL) / English (LTR) language switching.
   Works with elements that carry data-ar / data-en attributes.
   Persists the chosen language in localStorage across pages.
   ========================================================================== */

(function () {
  const STORAGE_KEY = 'clinic_lang';

  function getStoredLang() {
    return localStorage.getItem(STORAGE_KEY) || 'ar';
  }

  function applyLang(lang) {
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    document.querySelectorAll('[data-ar]').forEach((elx) => {
      const value = elx.getAttribute('data-' + lang);
      if (value !== null) {
        elx.textContent = value;
      }
    });

    document.querySelectorAll('[data-ar-placeholder]').forEach((elx) => {
      const value = elx.getAttribute('data-' + lang + '-placeholder');
      if (value !== null) {
        elx.setAttribute('placeholder', value);
      }
    });

    document.querySelectorAll('.lang-switch').forEach((btn) => {
      btn.textContent = lang === 'ar' ? 'EN' : 'AR';
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function toggleLang() {
    const current = document.documentElement.getAttribute('lang') || 'ar';
    const next = current === 'ar' ? 'en' : 'ar';
    applyLang(next);
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyLang(getStoredLang());

    document.querySelectorAll('.lang-switch').forEach((btn) => {
      btn.addEventListener('click', toggleLang);
    });
  });

  window.toggleLang = toggleLang;
  window.applyLang = applyLang;
})();
