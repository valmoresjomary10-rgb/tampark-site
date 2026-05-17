/* ============================================================
   TALIBON MEMORIAL PARK — Main JavaScript
   ============================================================ */

/* ── Navigation ── */
const navbar   = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

/* ── Page Routing ── */
function navigate(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile menu
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';

  // Re-run fade-in for newly visible page
  setTimeout(initFadeIn, 50);
}

document.querySelectorAll('[data-page]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    navigate(el.dataset.page);
  });
});

/* ── Fade-in on Scroll ── */
function initFadeIn() {
  const items = document.querySelectorAll('.fade-in:not(.visible)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => observer.observe(el));
}
initFadeIn();

/* ── Lightbox ── */
const lightbox = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    const lightboxImg = document.getElementById('lightboxImg');
    if (img && lightboxImg) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Inquiry Form — Connected to Node.js Backend ── */
const inquiryForm = document.getElementById('inquiryForm');
if (inquiryForm) {
  inquiryForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // ── Step 1: Validate all fields first ──
    let valid = true;

    const fields = [
      { id: 'fullName', msg: 'Please enter your full name.' },
      { id: 'email',    msg: 'Please enter a valid email address.', type: 'email' },
      { id: 'phone',    msg: 'Please enter your phone number.' },
      { id: 'service',  msg: 'Please select a service.' },
      { id: 'message',  msg: 'Please enter your message.' },
    ];

    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const err   = document.getElementById(f.id + 'Error');
      let ok = input.value.trim() !== '';
      if (f.type === 'email') {
        ok = ok && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      }
      input.classList.toggle('error', !ok);
      if (err) {
        err.textContent = f.msg;
        err.classList.toggle('show', !ok);
      }
      if (!ok) valid = false;
    });

    if (!valid) return; // Stop here if validation fails

    // ── Step 2: Show loading state on button ──
    const submitBtn = inquiryForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // ── Step 3: Send form data to our Node.js server ──
    try {
      const response = await fetch('https://tampark-site-production.up.railway.app/submit-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: document.getElementById('fullName').value.trim(),
          email:    document.getElementById('email').value.trim(),
          phone:    document.getElementById('phone').value.trim(),
          service:  document.getElementById('service').value,
          message:  document.getElementById('message').value.trim(),
        })
      });

      const result = await response.json();

      // ── Step 4: Handle the response ──
      if (result.success) {
        // Show your existing success message
        const success = document.getElementById('formSuccess');
        inquiryForm.reset();
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 6000);
      } else {
        alert('⚠️ ' + result.error);
      }

    } catch (err) {
      // This happens if the server is not running
      console.error('Server error:', err);
      alert('❌ Could not connect to the server. Make sure you ran: node server.js');
    } finally {
      // Always restore the button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // Live clear errors on input
  inquiryForm.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const err = document.getElementById(el.id + 'Error');
      if (err) err.classList.remove('show');
    });
  });
}
