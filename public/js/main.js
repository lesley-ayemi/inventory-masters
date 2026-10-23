// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');
if (toggle && links) {
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
}

// Reveal on scroll, plus count-up for the outcome stats
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function countUp(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  if (reduceMotion || !target) return;
  const duration = 1200;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

// Contact form
const form = document.getElementById('contact-form');
if (form) {
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');

  const showErrors = (errors = {}) => {
    form.querySelectorAll('[data-error]').forEach((el) => {
      const msg = errors[el.dataset.error] || '';
      el.textContent = msg;
      el.closest('.field').classList.toggle('has-error', Boolean(msg));
    });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form-status';
    button.disabled = true;
    button.textContent = 'Sending…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        showErrors();
        form.reset();
        status.textContent = 'Thanks! Your enquiry has been sent. We’ll be in touch soon.';
        status.classList.add('ok');
      } else if (data.errors) {
        showErrors(data.errors);
        const first = form.querySelector('.has-error input, .has-error textarea, .has-error select');
        if (first) first.focus();
      } else {
        throw new Error(data.error || 'Request failed');
      }
    } catch {
      status.textContent = 'Sorry, something went wrong. Please call or email us directly.';
      status.classList.add('fail');
    } finally {
      button.disabled = false;
      button.textContent = 'Send enquiry';
    }
  });
}
