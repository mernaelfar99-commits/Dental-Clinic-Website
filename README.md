# Dental-Clinic-Website

A luxury, cinematic, bilingual (Arabic/English) website for **Dr. Abdurahman Moheb Amer** — Cosmetic, Restorative & Oral Surgery Dentist.

Static site — no build step required. Ready to deploy directly to **Vercel**, **Netlify**, GitHub Pages, or any static host.

---

## 📁 Project Structure

```
Dental-Clinic-Website/
│── index.html
│── about.html
│── services.html
│── before-after.html
│── gallery.html
│── locations.html
│── contact.html
│── vercel.json
│── assets/
│     ├── css/
│     │      style.css          → base variables, layout, components
│     │      responsive.css     → all media queries
│     │      animations.css     → keyframes & scroll-reveal classes
│     │
│     ├── js/
│     │      app.js             → nav, mobile menu, FAQ, sliders, filters, floating buttons
│     │      booking.js         → booking form logic + WhatsApp deep link
│     │      animations.js      → loader, scroll reveal, animated counters
│     │      language.js        → AR/EN toggle, RTL/LTR, persists via localStorage
│     │
│     ├── images/
│     │      hero/
│     │      doctor/
│     │      gallery/
│     │      before-after/
│     │      certificates/
│     │      services/
│     │      icons/
│     │
│     ├── videos/
│     ├── fonts/
│     └── logos/
│── README.md
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary Ivory | `#F8F6F2` |
| Luxury Gold | `#D4AF37` |
| Warm Champagne | `#E6D2A2` |
| Deep Charcoal | `#1C1C1C` |
| Soft Gray | `#F4F4F4` |
| Pure White | `#FFFFFF` |
| Accent Gold Glow | `#C9A227` |

**Fonts:** Cairo / IBM Plex Sans Arabic (Arabic) · Playfair Display / Poppins (English) — loaded via Google Fonts in every page `<head>`.

---

## 🌍 Language Switching

- Every translatable element carries `data-ar="..."` and `data-en="..."` attributes.
- `assets/js/language.js` toggles `<html lang>` / `<html dir>` and swaps text content.
- The chosen language persists across page navigation via `localStorage`.
- Click the **EN / AR** pill button in the navbar (or mobile menu) to switch.

---

## 📦 Pages

| Page | Purpose |
|---|---|
| `index.html` | Hero, doctor intro, why-choose highlights, emergency banner, services teaser, stats, reviews, CTA |
| `about.html` | Full doctor biography, credentials, "why choose" grid, certificates |
| `services.html` | All 17 services, patient journey timeline |
| `before-after.html` | Interactive before/after slider with category tabs |
| `gallery.html` | Filterable masonry gallery |
| `locations.html` | Branch cards (Bella & Dokki) with embedded Google Maps |
| `contact.html` | Booking form, contact details, social links, FAQ accordion |

---

## 🔧 Before You Deploy — Replace These Placeholders

1. **Phone / WhatsApp number** — currently `+201035120194` in every page's floating buttons, footer, and `assets/js/booking.js` (`CLINIC_WHATSAPP_NUMBER`). Search-and-replace across all files.
2. **Images** — drop real photos into the matching `assets/images/...` subfolders using the same filenames referenced in the HTML (e.g. `assets/images/doctor/dr-abdurahman.jpg`). Until replaced, the `about-photo` block will show gracefully with a gold gradient fallback.
3. **Google Maps embeds** — in `locations.html`, replace the two `iframe src` query strings with the clinic's exact address or Place ID for pinpoint accuracy.
4. **Email / social links** — update `info@dr-abdurahman-clinic.com`, Instagram, Facebook, and Messenger links in `contact.html` and the footer of every page.
5. **Booking form backend** — `assets/js/booking.js` currently shows a success animation client-side only. Connect the `submit` handler to your booking API / email service (e.g. Formspree, a serverless function, or your CRM) before going live.

---

## ▲ Deploying to Vercel

1. Push this folder to a GitHub repository (or drag-and-drop the folder into the Vercel dashboard).
2. In Vercel: **New Project → Import** the repo.
3. Framework preset: **Other** (static site — no build command needed).
4. Output directory: `.` (project root).
5. Deploy — done. `vercel.json` is included to ensure clean URL routing.

---

## ✅ Performance & SEO Notes

- Each page has its own `<title>` and `<meta name="description">` targeting local SEO keywords (Dentist Egypt, Dokki, Bella, Kafr El Sheikh, Hollywood Smile, etc.).
- Images should be exported as compressed WebP/JPEG and given `width`/`height` attributes once added, to protect Lighthouse performance scores.
- All animations use CSS transitions + `IntersectionObserver`, avoiding heavy animation libraries for faster load times.
- No inline `<style>` or `<script>` blocks — all CSS/JS is modular and cache-friendly.

---

© 2026 Dr. Abdurahman Moheb Amer — All Rights Reserved.
