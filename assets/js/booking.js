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
        `مرحبًا، أرغب في حجز موعد:%0A` +
        `الاسم: ${data.name}%0A` +
        `الهاتف: ${data.phone}%0A` +
        `الفرع: ${data.branch}%0A` +
        `الخدمة: ${data.treatment}%0A` +
        `التاريخ المفضل: ${data.date}%0A` +
        `الوقت المفضل: ${data.time}%0A` +
        `ملاحظات: ${data.notes}`
      );
    }
    return (
      `Hello, I would like to book an appointment:%0A` +
      `Name: ${data.name}%0A` +
      `Phone: ${data.phone}%0A` +
      `Branch: ${data.branch}%0A` +
      `Treatment: ${data.treatment}%0A` +
      `Preferred Date: ${data.date}%0A` +
      `Preferred Time: ${data.time}%0A` +
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
    });

    // Wire up any "Book via WhatsApp" buttons near the form to prefill the message
    document.querySelectorAll('.btn-wa[data-booking-wa]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const data = getFormData(form);
        const message = buildWhatsAppMessage(data);
        window.open(`https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${message}`, '_blank');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initBookingForm);
})();
