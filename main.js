/* ═══════════════════════════════════════════════════════════════════════════
   CareerPilot — main.js
   Animations, counters, scroll-triggered reveals, navbar, pricing toggle
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll effect ─────────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });

  // ── Hamburger toggle ─────────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // ── Fade-up on scroll ────────────────────────────────────────────────────
  const fadeEls = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => observer.observe(el));

  // ── Animated number counters ─────────────────────────────────────────────
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '+';
      const dur    = 2000; // ms
      let start    = 0;
      const step   = target / (dur / 16);

      const tick = () => {
        start += step;
        if (start >= target) {
          el.textContent = target.toLocaleString() + suffix;
          return;
        }
        el.textContent = Math.floor(start).toLocaleString() + suffix;
        requestAnimationFrame(tick);
      };
      tick();
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // ── Pricing toggle ──────────────────────────────────────────────────────
  const toggle = document.getElementById('billingToggle');
  if (toggle) {
    let yearly = false;
    toggle.addEventListener('click', () => {
      yearly = !yearly;
      toggle.classList.toggle('active', yearly);

      document.querySelectorAll('.price-amount').forEach(el => {
        const monthlyPrice = el.dataset.monthly;
        const yearlyPrice  = el.dataset.yearly;
        el.textContent = yearly ? yearlyPrice : monthlyPrice;
      });
    });
  }

  // ── Smooth scroll for anchor links ───────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Analytics bars grow animation ────────────────────────────────────────
  const barsSection = document.querySelector('.analytics-bars');
  if (barsSection) {
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.bar').forEach(bar => {
            const h = bar.style.height;
            bar.style.height = '0';
            setTimeout(() => { bar.style.height = h; }, 100);
          });
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    barObserver.observe(barsSection);
  }

});
