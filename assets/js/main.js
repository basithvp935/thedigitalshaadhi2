/* =========================================================
   Rahul & Priya — Wedding Invitation scripts
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Edit your details here ---------- */
  const CONFIG = {
    weddingDate: new Date('2027-02-14T18:30:00+05:30'), // ceremony start (IST)
    weddingEnd:  new Date('2027-02-14T23:30:00+05:30'),
    title: "Rahul & Priya's Wedding",
    location: 'The Rosewood Palace, Lake Pichola Road, Udaipur',
  };

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* ---------- Preloader ---------- */
  const preloader = $('#preloader');
  const hidePreloader = () => preloader && preloader.classList.add('is-hidden');
  window.addEventListener('load', () => setTimeout(hidePreloader, 400));
  setTimeout(hidePreloader, 5000); // safety net on slow networks

  /* ---------- Personalised guest name: index.html?to=Anjali ---------- */
  const guest = new URLSearchParams(location.search).get('to');
  if (guest) $('#guestName').textContent = 'Dear ' + guest.trim().slice(0, 40);

  /* ---------- Split names into letters ---------- */
  let charIndex = 0;
  $$('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = '';
    el.setAttribute('aria-label', text);
    [...text].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--c', charIndex++);
      span.textContent = ch;
      el.appendChild(span);
    });
    charIndex += 3; // pause before the next name
  });

  /* ---------- Open the envelope ----------
     seal shakes → cracks in two → flap swings open →
     letter slides out → blooms into the website            */
  const intro = $('#intro');
  const envelope = $('#envelope');
  let opened = false;

  function openInvitation() {
    if (opened) return;
    opened = true;
    playMusic();
    const fast = reduceMotion ? 0.2 : 1;
    const at = (ms, fn) => setTimeout(fn, ms * fast);

    intro.classList.add('is-opening');
    envelope.classList.add('is-breaking');
    at(450, () => envelope.classList.add('is-cracked'));
    at(1000, () => envelope.classList.add('is-flap-open'));
    at(1480, () => envelope.classList.add('is-flap-behind'));
    at(1800, () => envelope.classList.add('is-letter-out'));
    at(3300, () => intro.classList.add('is-blooming'));
    at(4000, () => {
      body.classList.remove('is-locked');
      body.classList.add('is-open');
      window.scrollTo(0, 0);
      intro.classList.add('is-done');
      initReveal();
      petals.start();
    });
    at(5200, () => { introDust.stop(); intro.remove(); });
  }
  $('#openInvite').addEventListener('click', openInvitation);
  $('#seal').addEventListener('click', openInvitation);

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Scroll-driven effects (one rAF loop) ---------- */
  const progress = $('#scrollProgress');
  const toTop = $('#toTop');
  const parallaxEls = reduceMotion ? [] : $$('[data-parallax]');

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }

  function updateScroll() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;

    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    toTop.classList.toggle('is-visible', y > vh * 0.8);

    // parallax
    parallaxEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const speed = parseFloat(el.dataset.parallax) || 0;
      const offset = (r.top + r.height / 2 - vh / 2) * speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });

  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateScroll();


  /* ---------- Countdown ---------- */
  const cdEls = {};
  $$('[data-unit]').forEach((el) => { cdEls[el.dataset.unit] = el; });
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  let cdTimer;

  function setUnit(unit, value) {
    const el = cdEls[unit];
    if (el.textContent === value) return;
    el.textContent = value;
    el.classList.remove('tick');
    void el.offsetWidth; // restart animation
    el.classList.add('tick');
  }

  function updateCountdown() {
    const diff = CONFIG.weddingDate - Date.now();
    if (diff <= 0) {
      clearInterval(cdTimer);
      $('#countdownTimer').innerHTML = '<p class="countdown-done">Just Married!</p>';
      return;
    }
    const s = Math.floor(diff / 1000);
    setUnit('days', pad(Math.floor(s / 86400), 3));
    setUnit('hours', pad(Math.floor((s % 86400) / 3600)));
    setUnit('minutes', pad(Math.floor((s % 3600) / 60)));
    setUnit('seconds', pad(s % 60));
  }
  updateCountdown();
  cdTimer = setInterval(updateCountdown, 1000);

  /* ---------- Add to calendar (.ics) ---------- */
  const icsDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  $('#addToCalendar').addEventListener('click', () => {
    const esc = (t) => t.replace(/([,;\\])/g, '\\$1');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invitation//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:rahul-priya-wedding-20270214@invite',
      'DTSTAMP:' + icsDate(new Date()),
      'DTSTART:' + icsDate(CONFIG.weddingDate),
      'DTEND:' + icsDate(CONFIG.weddingEnd),
      'SUMMARY:' + esc(CONFIG.title),
      'LOCATION:' + esc(CONFIG.location),
      'DESCRIPTION:' + esc('We can\'t wait to celebrate with you!'),
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Reminder', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'rahul-priya-wedding.ics' });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  /* ---------- Count-up numbers (love note stats) ---------- */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = parseInt(el.dataset.count, 10) || 0;
        const start = performance.now();
        const dur = reduceMotion ? 1 : 1600;
        const step = (now) => {
          const k = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countIO.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countIO.observe(el));
  } else {
    counters.forEach((el) => { el.textContent = el.dataset.count; });
  }

  /* ---------- RSVP ---------- */
  const form = $('#rsvpForm');
  const thanksModal = new bootstrap.Modal('#thanksModal');

  $$('input[name="attending"]', form).forEach((r) => r.addEventListener('change', () => {
    form.classList.toggle('is-declining', $('#attNo').checked);
  }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    const data = new FormData(form);
    const entry = {
      name: data.get('name').trim(),
      contact: data.get('contact').trim(),
      attending: data.get('attending'),
      guests: data.get('attending') === 'yes' ? data.get('guests') : '0',
      events: data.get('attending') === 'yes' ? data.getAll('events') : [],
      message: (data.get('message') || '').trim(),
      sentAt: new Date().toISOString(),
    };

    /* To collect responses online, POST `entry` to Formspree,
       Google Apps Script, or your own backend here. */
    try {
      const saved = JSON.parse(localStorage.getItem('rsvp') || '[]');
      saved.push(entry);
      localStorage.setItem('rsvp', JSON.stringify(saved));
    } catch (_) { /* storage unavailable — ignore */ }

    const first = entry.name.split(' ')[0];
    $('#thanksText').textContent = entry.attending === 'yes'
      ? `Dear ${first}, we're overjoyed that you'll be celebrating with us!`
      : `Dear ${first}, you'll be missed. Thank you for your love and blessings.`;
    thanksModal.show();
    form.reset();
    form.classList.remove('was-validated', 'is-declining');
  });

  /* ---------- Background music ---------- */
  const audio = $('#bgMusic');
  const musicBtn = $('#musicToggle');

  function setMusicUI(playing) {
    musicBtn.classList.toggle('is-playing', playing);
    musicBtn.setAttribute('aria-pressed', String(playing));
  }
  function playMusic() {
    audio.volume = 0.5;
    const p = audio.play();
    if (p) p.then(() => setMusicUI(true)).catch(() => setMusicUI(false));
  }
  audio.addEventListener('error', () => musicBtn.classList.add('is-unavailable'));
  musicBtn.addEventListener('click', () => {
    if (audio.paused) playMusic();
    else { audio.pause(); setMusicUI(false); }
  });

  /* ---------- Falling petals ---------- */
  const petals = (() => {
    const canvas = $('#petals');
    const ctx = canvas.getContext('2d');
    const colors = [['#ffe3e8', '#f4a9b8'], ['#fff1f1', '#eeb3be'], ['#fde7ea', '#e8949f']];
    let w, h, dpr, items = [], running = false;

    // pre-render petal sprites
    const sprites = colors.map(([c1, c2]) => {
      const s = document.createElement('canvas');
      s.width = 40; s.height = 40;
      const g = s.getContext('2d');
      const grad = g.createLinearGradient(0, 0, 40, 40);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(20, 2);
      g.bezierCurveTo(38, 8, 36, 30, 20, 38);
      g.bezierCurveTo(4, 30, 2, 8, 20, 2);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,.5)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(20, 6);
      g.quadraticCurveTo(22, 20, 20, 34);
      g.stroke();
      return s;
    });

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make(initial) {
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -30,
        size: 8 + Math.random() * 12,
        vy: 0.4 + Math.random() * 0.8,
        sway: 0.6 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.03,
        flip: Math.random() * Math.PI,
        vf: 0.01 + Math.random() * 0.03,
        alpha: 0.55 + Math.random() * 0.35,
        sprite: sprites[(Math.random() * sprites.length) | 0],
      };
    }

    function frame(t) {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      items.forEach((p, i) => {
        p.y += p.vy;
        p.x += Math.sin(t / 1400 + p.phase) * p.sway * 0.5;
        p.rot += p.vr;
        p.flip += p.vf;
        if (p.y > h + 30) items[i] = make(false);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.flip));
        ctx.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      requestAnimationFrame(frame);
    }

    return {
      start() {
        if (running || reduceMotion) return;
        resize();
        const count = w < 768 ? 14 : 26;
        items = Array.from({ length: count }, () => make(true));
        running = true;
        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) running = false;
          else if (!running) { running = true; requestAnimationFrame(frame); }
        });
        requestAnimationFrame(frame);
      },
    };
  })();

  /* ---------- Gold dust drifting over the envelope ---------- */
  const introDust = (() => {
    const canvas = $('#introDust');
    const ctx = canvas.getContext('2d');
    let w, h, parts = [], running = !reduceMotion;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const make = (initial) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.15 + Math.random() * 0.45,
      ph: Math.random() * 6.28,
      a: 0.3 + Math.random() * 0.6,
    });
    function frame(t) {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p, i) => {
        p.y -= p.vy;
        p.x += Math.sin(t / 1800 + p.ph) * 0.25;
        if (p.y < -10) parts[i] = make(false);
        const tw = 0.5 + 0.5 * Math.sin(t / 500 + p.ph);
        ctx.beginPath();
        ctx.fillStyle = `rgba(246, 225, 170, ${p.a * tw})`;
        ctx.shadowColor = 'rgba(255, 230, 170, .9)';
        ctx.shadowBlur = 6;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    if (running) {
      resize();
      parts = Array.from({ length: w < 768 ? 35 : 70 }, () => make(true));
      window.addEventListener('resize', resize);
      requestAnimationFrame(frame);
    }
    return { stop() { running = false; } };
  })();

  /* ---------- Realistic butterflies ----------
     Wing artwork is generated once as SVG symbols for three colour
     species. Each wing flaps in 3D (hindwing trails the forewing),
     darkens as it folds, and the body banks into turns. Butterflies
     wander, glide now and then, and land on flowers to rest.      */
  const rand = (a, b) => a + Math.random() * (b - a);

  // Scalloped wing outlines (right wing, root at x≈3)
  const WING_F = 'M3,50 C8,30 28,8 62,3 C80,0 95,3 97,12 Q99,16 96,19 Q98,24 94,28 Q95,33 90,36 Q89,41 84,43 C70,52 42,59 3,58 Z';
  const WING_H = 'M3,60 C26,59 52,62 69,74 C80,82 82,92 78,100 Q80,105 74,108 Q74,114 67,114 Q63,120 56,118 Q50,122 44,118 Q37,120 33,115 Q26,115 24,109 C12,99 5,81 3,62 Z';

  const BF_SPECIES = {
    rose:  { fore: ['#fff6f8', '#fbd3dd', '#f19ab2', '#d0607f', '#a8405f'], hind: ['#fff2f5', '#f7b9c9', '#e17895', '#b14766', '#8a2f4c'], edge: '#24070f', vein: '#3a0f1c', ring: '#f2c46d', dot: '#fff' },
    peach: { fore: ['#fffaf0', '#fde6bf', '#f7bd84', '#e48f55', '#c46a35'], hind: ['#fff6ea', '#fcd9a8', '#f3a86d', '#d57a42', '#a8552a'], edge: '#2a1206', vein: '#4a230d', ring: '#8fc1e0', dot: '#fff8ec' },
    lilac: { fore: ['#fdf8ff', '#eedff6', '#d6b3e8', '#b689d3', '#8f62b0'], hind: ['#fbf5ff', '#e6d0f2', '#c9a0e0', '#a476c6', '#7d4f9f'], edge: '#1f0d2b', vein: '#2f1740', ring: '#f6c97a', dot: '#fff' },
  };
  const pickSpecies = () => { const r = Math.random(); return r < 0.5 ? 'rose' : r < 0.75 ? 'peach' : 'lilac'; };

  function buildButterflyDefs() {
    const stops = (c) => c.map((col, i) => `<stop offset="${[0, 0.3, 0.58, 0.8, 1][i]}" stop-color="${col}"/>`).join('');
    const circles = (pts, r, fill) => pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${(r * (1 - i * 0.06)).toFixed(2)}" fill="${fill}"/>`).join('');
    let defs = `
      <pattern id="bfScales" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <circle cx="1.3" cy="1.3" r=".42" fill="#fff" fill-opacity=".22"/>
      </pattern>
      <clipPath id="bfClipF"><path d="${WING_F}"/></clipPath>
      <clipPath id="bfClipH"><path d="${WING_H}"/></clipPath>
      <linearGradient id="bfSheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".6"/>
        <stop offset=".35" stop-color="#ffe9f3" stop-opacity=".18"/>
        <stop offset=".55" stop-color="#e8f4ff" stop-opacity=".12"/>
        <stop offset=".7" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bfBodyGrad" x1="0" x2="1">
        <stop offset="0" stop-color="#120407"/><stop offset=".45" stop-color="#4f2c33"/><stop offset="1" stop-color="#100306"/>
      </linearGradient>
      <radialGradient id="bfFuzz"><stop offset="0" stop-color="#d9a3ae" stop-opacity=".95"/><stop offset="1" stop-color="#d9a3ae" stop-opacity="0"/></radialGradient>
      <symbol id="bfBody" viewBox="-10 0 40 120" overflow="visible">
        <g stroke="#1d070d" stroke-width=".7" stroke-linecap="round" fill="none">
          <path d="M7,47 L0,41 L-3,36"/><path d="M7,52 L-2,54 L-5,58"/><path d="M7,56 L0,64 L-2,70"/>
          <path d="M13,47 L20,41 L23,36"/><path d="M13,52 L22,54 L25,58"/><path d="M13,56 L20,64 L22,70"/>
        </g>
        <path d="M8.6,36 Q2,17 -5,3" fill="none" stroke="#1d070d" stroke-width="1" stroke-linecap="round"/>
        <path d="M11.4,36 Q18,17 25,3" fill="none" stroke="#1d070d" stroke-width="1" stroke-linecap="round"/>
        <ellipse cx="-5.2" cy="3" rx="1.7" ry="2.5" fill="#1d070d"/><ellipse cx="25.2" cy="3" rx="1.7" ry="2.5" fill="#1d070d"/>
        <ellipse cx="10" cy="53" rx="9.5" ry="15" fill="url(#bfFuzz)"/>
        <ellipse cx="10" cy="83" rx="3.7" ry="21" fill="url(#bfBodyGrad)"/>
        <g stroke="#f3c6d2" stroke-opacity=".38" stroke-width=".6">
          <path d="M6.8,68 H13.2"/><path d="M6.6,74 H13.4"/><path d="M6.6,80 H13.4"/><path d="M6.8,86 H13.2"/><path d="M7.2,92 H12.8"/><path d="M8,98 H12"/>
        </g>
        <ellipse cx="10" cy="52" rx="5.2" ry="10.5" fill="url(#bfBodyGrad)"/>
        <g stroke="#e7b7c2" stroke-opacity=".55" stroke-width=".5" stroke-linecap="round">
          <path d="M5.4,46 l-1.6,-1.2"/><path d="M5,51 l-1.9,-.2"/><path d="M5.4,56 l-1.6,1.2"/>
          <path d="M14.6,46 l1.6,-1.2"/><path d="M15,51 l1.9,-.2"/><path d="M14.6,56 l1.6,1.2"/>
        </g>
        <circle cx="10" cy="39" r="4.3" fill="url(#bfBodyGrad)"/>
        <circle cx="7.4" cy="38.2" r="2" fill="#2a0d14"/><circle cx="12.6" cy="38.2" r="2" fill="#2a0d14"/>
        <circle cx="6.9" cy="37.6" r=".6" fill="#fff" fill-opacity=".85"/><circle cx="12.1" cy="37.6" r=".6" fill="#fff" fill-opacity=".85"/>
      </symbol>`;

    Object.entries(BF_SPECIES).forEach(([k, s]) => {
      defs += `
      <radialGradient id="bfF-${k}" cx="0" cy=".47" r="1.05">${stops(s.fore)}</radialGradient>
      <radialGradient id="bfH-${k}" cx="0" cy=".08" r="1.1">${stops(s.hind)}</radialGradient>
      <symbol id="bfFore-${k}" viewBox="0 0 100 120" overflow="visible">
        <path d="${WING_F}" fill="url(#bfF-${k})"/>
        <g clip-path="url(#bfClipF)">
          <ellipse cx="3" cy="54" rx="24" ry="26" fill="${s.fore[4]}" fill-opacity=".55"/>
          <ellipse cx="3" cy="54" rx="10" ry="12" fill="${s.edge}" fill-opacity=".3"/>
          <path d="M22,42 Q46,20 74,26 Q70,40 46,52 Z" fill="#fff" fill-opacity=".2"/>
          <path d="${WING_F}" fill="none" stroke="${s.edge}" stroke-width="22" stroke-opacity=".2"/>
          <path d="${WING_F}" fill="none" stroke="${s.edge}" stroke-width="9"/>
          <rect width="100" height="120" fill="url(#bfScales)"/>
        </g>
        <g fill="none" stroke="${s.vein}" stroke-opacity=".55" stroke-width=".75" stroke-linecap="round">
          <path d="M4,52 Q28,24 58,6"/><path d="M4,53 Q40,22 80,5"/><path d="M4,54 Q50,26 94,14"/>
          <path d="M4,55 Q48,40 88,34"/><path d="M4,56 Q38,52 70,49"/><path d="M22,44 Q34,36 48,34 Q40,44 26,50"/>
        </g>
        ${circles([[80, 7], [90, 12], [93, 20], [90, 28], [84, 36], [76, 42]], 1.8, s.dot)}
        <circle cx="72" cy="22" r="4.6" fill="${s.edge}"/><circle cx="72" cy="22" r="3.3" fill="${s.ring}"/><circle cx="72" cy="22" r="1.8" fill="${s.edge}"/><circle cx="71.4" cy="21.4" r=".7" fill="#fff"/>
        <path d="${WING_F}" fill="url(#bfSheen)"/>
        <path d="${WING_F}" fill="none" stroke="${s.edge}" stroke-width=".9"/>
      </symbol>
      <symbol id="bfHind-${k}" viewBox="0 0 100 120" overflow="visible">
        <path d="${WING_H}" fill="url(#bfH-${k})"/>
        <g clip-path="url(#bfClipH)">
          <ellipse cx="3" cy="62" rx="24" ry="26" fill="${s.hind[4]}" fill-opacity=".55"/>
          <ellipse cx="3" cy="62" rx="10" ry="12" fill="${s.edge}" fill-opacity=".3"/>
          <path d="M14,96 Q40,84 72,92" fill="none" stroke="${s.hind[4]}" stroke-width="7" stroke-opacity=".45" stroke-linecap="round"/>
          <path d="${WING_H}" fill="none" stroke="${s.edge}" stroke-width="24" stroke-opacity=".2"/>
          <path d="${WING_H}" fill="none" stroke="${s.edge}" stroke-width="10"/>
          <rect width="100" height="120" fill="url(#bfScales)"/>
        </g>
        <g fill="none" stroke="${s.vein}" stroke-opacity=".55" stroke-width=".75" stroke-linecap="round">
          <path d="M4,62 Q38,66 68,80"/><path d="M4,63 Q40,78 74,99"/><path d="M4,64 Q34,88 56,115"/><path d="M4,65 Q20,90 29,108"/>
        </g>
        ${circles([[75, 99], [70, 108], [61, 113], [50, 116], [39, 113], [29, 106]], 1.7, s.dot)}
        <circle cx="56" cy="96" r="7" fill="${s.edge}"/><circle cx="56" cy="96" r="5.3" fill="${s.ring}"/>
        <circle cx="56" cy="96" r="3.1" fill="${s.edge}"/><circle cx="55" cy="95" r="1.2" fill="#fff"/>
        <circle cx="40" cy="103" r="3.8" fill="${s.edge}"/><circle cx="40" cy="103" r="2.7" fill="${s.ring}"/><circle cx="40" cy="103" r="1" fill="#fff"/>
        <path d="${WING_H}" fill="url(#bfSheen)" opacity=".7"/>
        <path d="${WING_H}" fill="none" stroke="${s.edge}" stroke-width=".9"/>
      </symbol>`;
    });
    document.body.insertAdjacentHTML('afterbegin',
      `<svg class="svg-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>${defs}</defs></svg>`);
  }
  if (!reduceMotion) buildButterflyDefs();

  const wingHTML = (k) => `
    <div class="bf__mirror">
      <svg class="bf__hind" viewBox="0 0 100 120"><use href="#bfHind-${k}"/></svg>
      <svg class="bf__fore" viewBox="0 0 100 120"><use href="#bfFore-${k}"/></svg>
      <svg class="bf__shade" viewBox="0 0 100 120"><path d="${WING_H}"/><path d="${WING_F}"/></svg>
    </div>`;
  const BF_TEMPLATE = (k) => `
    <div class="bf__tilt">
      <div class="bf__wing bf__wing--l">${wingHTML(k)}</div>
      <div class="bf__wing bf__wing--r">${wingHTML(k)}</div>
      <svg class="bf__body" viewBox="-10 0 40 120"><use href="#bfBody"/></svg>
    </div>`;

  class Butterfly {
    constructor(layer, size, spots) {
      this.layer = layer;
      this.size = size;
      this.spots = spots;
      this.el = document.createElement('div');
      this.el.className = 'bf';
      this.el.style.setProperty('--size', size + 'px');
      this.el.style.setProperty('--flap', rand(0.34, 0.46).toFixed(2) + 's');
      this.el.innerHTML = BF_TEMPLATE(pickSpecies());
      this.bank = 0;
      this.pitch = 0;
      layer.appendChild(this.el);

      const w = layer.clientWidth, h = layer.clientHeight;
      // enter from a side, off-screen
      const fromLeft = Math.random() < 0.5;
      this.x = fromLeft ? -size : w + size;
      this.y = rand(h * 0.15, h * 0.85);
      this.vx = fromLeft ? 80 : -80;
      this.vy = 0;
      this.heading = fromLeft ? 90 : -90;
      this.speed = rand(85, 135);
      this.phase = Math.random() * 100;
      this.state = 'fly';
      this.timer = 0;
      this.glide = rand(2, 5);
      this.pickTarget();
    }

    pickTarget() {
      const w = this.layer.clientWidth, h = this.layer.clientHeight;
      const spots = this.spots ? this.spots() : [];
      if (spots.length && Math.random() < 0.35) {
        const s = spots[(Math.random() * spots.length) | 0];
        this.target = { x: s.x, y: s.y, land: true };
      } else {
        this.target = { x: rand(w * 0.06, w * 0.94), y: rand(h * 0.08, h * 0.9), land: false };
      }
    }

    update(dt, t) {
      if (this.state === 'rest') {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.state = 'fly';
          this.el.classList.remove('is-resting');
          this.pickTarget();
        }
        return this.render();
      }

      const dx = this.target.x - this.x, dy = this.target.y - this.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < (this.target.land ? 5 : 45)) {
        if (this.target.land) {
          this.state = 'rest';
          this.timer = rand(2.5, 5.5);
          this.vx = this.vy = 0;
          this.bank = this.pitch = 0;
          this.el.classList.add('is-resting');
          this.el.classList.remove('is-gliding');
          return this.render();
        }
        this.pickTarget();
      }

      // occasional glide with wings held open
      this.glide -= dt;
      if (this.glide <= 0) {
        const gliding = this.el.classList.toggle('is-gliding', !this.el.classList.contains('is-gliding') && !this.target.land);
        this.glide = gliding ? rand(0.4, 0.9) : rand(2, 5);
      }

      const sp = this.target.land ? Math.min(this.speed, d * 1.6 + 12) : this.speed;
      const k = Math.min(1, dt * 2.4);
      this.vx += ((dx / d) * sp - this.vx) * k;
      this.vy += ((dy / d) * sp - this.vy) * k;

      // flutter: erratic sideways + vertical bobbing in time with wing beats
      const v = Math.hypot(this.vx, this.vy) || 1;
      const flutter = (Math.sin(t * 0.0042 + this.phase) * 34 + Math.sin(t * 0.011 + this.phase * 2) * 14) * (this.target.land ? 0.3 : 1);
      const bob = Math.sin(t * 0.024 + this.phase) * (this.target.land ? 6 : 26);
      this.x += (this.vx + (-this.vy / v) * flutter) * dt;
      this.y += (this.vy + (this.vx / v) * flutter + bob) * dt;

      const want = Math.atan2(this.vy, this.vx) * 180 / Math.PI + 90;
      const diff = ((want - this.heading + 540) % 360) - 180;
      const turn = diff * Math.min(1, dt * 3.5);
      this.heading += turn;

      // bank into turns, pitch with the up/down bob
      const clamp = (v, m) => Math.max(-m, Math.min(m, v));
      const kk = Math.min(1, dt * 5);
      this.bank += (clamp(-(turn / (dt || 0.016)) * 0.22, 32) - this.bank) * kk;
      this.pitch += (clamp(bob * 0.35, 12) - this.pitch) * kk;
      this.render();
    }

    render() {
      const s = this.el.style;
      s.transform =
        `translate3d(${(this.x - this.size / 2).toFixed(1)}px, ${(this.y - this.size * 0.3).toFixed(1)}px, 0) rotate(${this.heading.toFixed(1)}deg)`;
      s.setProperty('--bank', this.bank.toFixed(1) + 'deg');
      s.setProperty('--pitch', this.pitch.toFixed(1) + 'deg');
    }
  }

  const flock = [];
  function addButterflies(layer, count, spots) {
    if (!layer || reduceMotion) return;
    const small = window.innerWidth < 768;
    for (let i = 0; i < count; i++) {
      setTimeout(() => flock.push(new Butterfly(layer, small ? rand(46, 62) : rand(62, 88), spots)), i * 1400 + 400);
    }
  }

  // landing spots: the painted flowers on the envelope scene / hero card
  const introStage = $('#introStage');
  const introLayer = $('#introButterflies');
  addButterflies(introLayer, window.innerWidth < 768 ? 2 : 3, () => {
    if (!introStage.isConnected) return [];
    const s = introStage.getBoundingClientRect();
    return [
      { x: s.left + s.width * 0.46, y: s.top + s.height * 0.15 },
      { x: s.left + s.width * 0.58, y: s.top + s.height * 0.12 },
      { x: s.left + s.width * 0.16, y: s.top + s.height * 0.08 },
    ];
  });

  const heroLayer = $('#heroButterflies');
  const heroCard = $('.hero__card');
  addButterflies(heroLayer, window.innerWidth < 768 ? 2 : 3, () => {
    const l = heroLayer.getBoundingClientRect();
    const c = heroCard.getBoundingClientRect();
    return [
      { x: c.left - l.left + c.width * 0.14, y: c.top - l.top + c.height * 0.1 },
      { x: c.left - l.left + c.width * 0.12, y: c.top - l.top + c.height * 0.86 },
      { x: c.left - l.left + c.width * 0.86, y: c.top - l.top + c.height * 0.9 },
    ];
  });

  let lastT = performance.now();
  function flyLoop(t) {
    const dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;
    const vh = window.innerHeight;
    flock.forEach((b) => {
      if (!b.layer.isConnected) return;
      const r = b.layer.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return; // off-screen: skip work
      b.update(dt, t);
    });
    requestAnimationFrame(flyLoop);
  }
  if (!reduceMotion) requestAnimationFrame(flyLoop);
})();
