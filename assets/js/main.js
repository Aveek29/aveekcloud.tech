document.addEventListener('DOMContentLoaded', () => {
  hideLoader();
  initCanvasParticles();
  initTypewriter();
  initNavigation();
  initTabs();
  initContactForm();
  initThemeToggle();
  initScrollReveal();
});

function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  window.addEventListener('load', () => loader.classList.add('hidden'));
  setTimeout(() => loader.classList.add('hidden'), 1500);
}

function initCanvasParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) { canvas.style.display = 'none'; return; }
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  const mouse = { x: null, y: null, radius: 120 };

  if (!isTouch) {
    const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = null; mouse.y = null; };
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('mouseleave', onLeave);
  }

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.r = Math.random() * 1.5 + 0.8;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.updateColor();
    }

    updateColor() {
      const theme = document.body.getAttribute('data-theme') || 'dark-neon';
      const map = {
        'light': { dot: 'rgba(127,0,255,0.12)', line: 'rgba(127,0,255,' },
        'cyberpunk': { dot: 'rgba(255,0,200,0.15)', line: 'rgba(0,255,255,' },
        'aurora': { dot: 'rgba(0,255,153,0.15)', line: 'rgba(0,212,255,' },
        'sunset': { dot: 'rgba(255,107,53,0.15)', line: 'rgba(255,0,128,' },
      };
      const c = map[theme] || { dot: 'rgba(0,242,254,0.15)', line: 'rgba(0,242,254,' };
      this.color = c.dot;
      this.lineColor = c.line;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const f = (mouse.radius - dist) / mouse.radius;
          this.x -= dx * f * 0.015;
          this.y -= dy * f * 0.015;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function populate() {
    particles = [];
    const maxP = isTouch ? 25 : 60;
    const divisor = isTouch ? 35000 : 20000;
    const count = Math.min(maxP, Math.floor((canvas.width * canvas.height) / divisor));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
    }
  }

  function connect() {
    const maxDist = 100;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.strokeStyle = `${particles[a].lineColor}${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) { p.update(); p.draw(); }
    connect();
    animId = requestAnimationFrame(loop);
  }

  let resizeTimer;
  function resize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      populate();
    }, 200);
  }

  window.addEventListener('resize', resize);
  resize();
  loop();

  window.addEventListener('themeChanged', () => {
    for (const p of particles) p.updateColor();
  });
}

function initTypewriter() {
  const target = document.getElementById('typed-text');
  if (!target) return;

  const words = [
    'AWS Certified Cloud Practitioner (967/1000)',
    'Cloud & Systems Architect',
    'AI & Machine Learning Engineer',
    'Full-Stack Web Developer',
    'Java Spring Boot & Cloud Engineer'
  ];

  let wordIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let speed = 80;

  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  target.parentNode.insertBefore(cursor, target.nextSibling);

  function type() {
    const word = words[wordIdx];
    if (deleting) {
      target.textContent = word.substring(0, charIdx - 1);
      charIdx--;
      speed = 30;
    } else {
      target.textContent = word.substring(0, charIdx + 1);
      charIdx++;
      speed = 70;
    }

    if (!deleting && charIdx === word.length) {
      deleting = true;
      speed = 2000;
    } else if (deleting && charIdx === 0) {
      deleting = false;
      wordIdx = (wordIdx + 1) % words.length;
      speed = 500;
    }

    setTimeout(type, speed);
  }

  setTimeout(type, 1200);
}

function initNavigation() {
  const header = document.querySelector('header');
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('nav');
  const overlay = document.querySelector('.nav-overlay');
  const navLinks = document.querySelectorAll('nav a');
  const sections = document.querySelectorAll('section[id]');

  function closeNav() {
    nav.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    const icon = hamburger.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-bars';
  }

  function openNav() {
    nav.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.classList.add('nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
    const icon = hamburger.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-xmark';
  }

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);

    let current = '';
    sections.forEach(s => {
      const top = s.offsetTop - 120;
      const h = s.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + h) {
        current = s.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  });

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      if (nav.classList.contains('active')) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (overlay) {
      overlay.addEventListener('click', closeNav);
    }

    navLinks.forEach(link => {
      link.addEventListener('click', closeNav);
    });
  }
}

function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-tab');
      buttons.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
    });
  });
}

function initContactForm() {
  const form = document.getElementById('portfolio-contact');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name || !email || !message) {
      btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please fill all fields';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${res.status})`);
      }

      btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Sent Successfully!';
      btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
      btn.style.boxShadow = '0 0 20px rgba(16,185,129,0.4)';
      form.reset();
    } catch (err) {
      console.error('Email send error:', err);
      btn.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> ' + (err.message || 'Failed — try again');
      btn.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
      btn.style.boxShadow = '0 0 20px rgba(239,68,68,0.4)';
    } finally {
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.style.boxShadow = '';
      }, 3000);
    }
  });
}

function initThemeToggle() {
  const saved = localStorage.getItem('portfolio-theme') || 'dark-neon';
  const dropdown = document.querySelector('.theme-dropdown');
  const options = document.querySelectorAll('.theme-option');

  const applyTheme = (val) => {
    document.body.setAttribute('data-theme', val);
    localStorage.setItem('portfolio-theme', val);
    options.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.themeVal === val);
    });
    if (dropdown) dropdown.classList.remove('open');
    window.dispatchEvent(new Event('themeChanged'));
  };

  applyTheme(saved);

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown) dropdown.classList.toggle('open');
    });
  }

  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      applyTheme(opt.dataset.themeVal);
    });
  });

  document.addEventListener('click', (e) => {
    if (dropdown && !e.target.closest('.theme-picker')) {
      dropdown.classList.remove('open');
    }
  });
}

function initScrollReveal() {
  const cards = document.querySelectorAll(
    '.glass-card, .section-header, .project-card, .cert-card, .aerospace-card, .timeline-item, .contact-method, .contact-form'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  cards.forEach(card => {
    card.classList.add('reveal');
    observer.observe(card);
  });
}
