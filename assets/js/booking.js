/* ==========================================================================
   booking.js
   Handles the appointment booking form: validation, submission,
   success animation, and WhatsApp deep-link generation.
   ========================================================================== */

(function () {
  // Update this with the real clinic WhatsApp number (international format, no + or spaces)
  const CLINIC_WHATSAPP_NUMBER = '201035120194';

  function buildWhatsAppMessage(data) {
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    if (lang === 'ar') {
      return (
        `مرحبًا، أرغب في حجز موعد:\n` +
        `الاسم: ${data.name}\n` +
        `الهاتف: ${data.phone}\n` +
        `الفرع: ${data.branch}\n` +
        `الخدمة: ${data.treatment}\n` +
        `التاريخ المفضل: ${data.date}\n` +
        `الوقت المفضل: ${data.time}\n` +
        `ملاحظات: ${data.notes}`
      );
    }
    return (
      `Hello, I would like to book an appointment:\n` +
      `Name: ${data.name}\n` +
      `Phone: ${data.phone}\n` +
      `Branch: ${data.branch}\n` +
      `Treatment: ${data.treatment}\n` +
      `Preferred Date: ${data.date}\n` +
      `Preferred Time: ${data.time}\n` +
      `Notes: ${data.notes}`
    );
  }

  function getFormData(form) {
    return {
      name: form.querySelector('#f-name')?.value.trim() || '',
      phone: form.querySelector('#f-phone')?.value.trim() || '',
      branch: form.querySelector('#f-branch')?.value || '',
      treatment: form.querySelector('#f-treatment')?.value || '',
      date: form.querySelector('#f-date')?.value || '',
      time: form.querySelector('#f-time')?.value || '',
      notes: form.querySelector('#f-notes')?.value.trim() || '-'
    };
  }

  function initBookingForm() {
    const form = document.getElementById('bookingForm');
    const successBox = document.getElementById('successAnim');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = getFormData(form);
      if (!data.name || !data.phone) {
        form.reportValidity();
        return;
      }

      // In production this would POST to a backend / booking API.
      // For now we show a luxury success confirmation.
      form.style.display = 'none';
      if (successBox) successBox.style.display = 'block';

      // Store last booking locally for reference (optional, non-sensitive demo use)
      try {
        sessionStorage.setItem('lastBooking', JSON.stringify(data));
      } catch (err) {
        /* sessionStorage unavailable — ignore */
      }
      // After successful validation and showing success animation,
      // also open WhatsApp with the prebuilt message so the user can send booking details.
      try {
        const message = buildWhatsAppMessage(data);
        const url = `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      } catch (err) {
        // Do not break the success flow if opening WhatsApp fails.
        console.warn('Unable to open WhatsApp link', err);
      }
    });

    // Wire up any "Book via WhatsApp" buttons near the form to prefill the message
    document.querySelectorAll('.btn-wa[data-booking-wa]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const data = getFormData(form);
        const message = buildWhatsAppMessage(data);
        // encode once when building the wa.me URL so whitespace/newlines are preserved
        window.open(`https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initBookingForm);
})();
