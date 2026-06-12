/* ============================================
   LOADER
   ============================================ */
const loader = document.getElementById('loader');
const body = document.body;

// Exit once the progress bar animation completes
setTimeout(exitLoader, 2900);

function exitLoader() {
  loader.classList.add('exit');
  body.classList.remove('loading');

  setTimeout(() => {
    loader.style.display = 'none';
    initReveal();
    startTyping();
  }, 600);
}

/* ============================================
   CUSTOM CURSOR
   ============================================ */
const cDot = document.getElementById('cDot');
const cRing = document.getElementById('cRing');

let mx = 0,
  my = 0;
let rx = 0,
  ry = 0;

document.addEventListener(
  'mousemove',
  (e) => {
    mx = e.clientX;
    my = e.clientY;
    cDot.style.left = mx + 'px';
    cDot.style.top = my + 'px';
  },
  { passive: true }
);

(function ringLoop() {
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
  cRing.style.left = rx + 'px';
  cRing.style.top = ry + 'px';
  requestAnimationFrame(ringLoop);
})();

const hovTargets =
  'a, button, .photo-item, .proj-card, .info-card, .f-btn, .filter-btn';
document.querySelectorAll(hovTargets).forEach((el) => {
  el.addEventListener('mouseenter', () => cRing.classList.add('hov'));
  el.addEventListener('mouseleave', () => cRing.classList.remove('hov'));
});

/* ============================================
   SCROLL PROGRESS
   ============================================ */
const scrollBar = document.getElementById('scrollProgress');

window.addEventListener(
  'scroll',
  () => {
    const pct =
      (window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight)) *
      100;
    scrollBar.style.width = pct + '%';
  },
  { passive: true }
);

/* ============================================
   NAVIGATION
   ============================================ */
const nav = document.getElementById('nav');
const navLogo = document.getElementById('navLogo');
const burger = document.getElementById('burgerBtn');
const mobileNav = document.getElementById('mobileNav');

window.addEventListener(
  'scroll',
  () => {
    nav.classList.toggle('solid', window.scrollY > 40);
    highlightNav();
  },
  { passive: true }
);

burger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mn-link').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    burger.classList.remove('open');
    body.style.overflow = '';
  });
});

function highlightNav() {
  const sections = ['about', 'photography', 'projects', 'contact'];
  const links = document.querySelectorAll('.nav-links a');
  let current = '';

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) current = id;
  });

  links.forEach((l) => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
}

/* ============================================
   TYPING EFFECT
   ============================================ */
const phrases = [
  'photographer.',
  'engineer-in-training.',
  "UIUC class of '30.",
  'perpetual jaywalker.',
  'hyperfocuser.',
  'light chaser.',
];

function startTyping() {
  const el = document.getElementById('typedText');
  let pi = 0;
  let ci = 0;
  let deleting = false;

  function tick() {
    const word = phrases[pi];

    if (deleting) {
      ci--;
      el.textContent = word.slice(0, ci);
    } else {
      ci++;
      el.textContent = word.slice(0, ci);
    }

    let delay = deleting ? 55 : 95;
    if (!deleting && ci === word.length) {
      delay = 2000;
      deleting = true;
    }
    if (deleting && ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      delay = 300;
    }

    setTimeout(tick, delay);
  }
  tick();
}

/* ============================================
   PHOTO GRID
   ============================================ */

// Use photos from photos.js if any are defined; otherwise show placeholders.
const placeholders = [
  { title: 'Downtown Dusk', cat: 'urban', bg: '#111418' },
  { title: 'Golden Rooftop', cat: 'urban', bg: '#1a1510' },
  { title: 'Forest Light', cat: 'nature', bg: '#0e1510' },
  { title: 'Street Portrait', cat: 'portrait', bg: '#121416' },
  { title: 'Concrete Geometry', cat: 'abstract', bg: '#131313' },
  { title: 'Morning Fog', cat: 'nature', bg: '#161718' },
  { title: 'Neon Reflection', cat: 'urban', bg: '#150f18' },
  { title: 'Quiet Corner', cat: 'portrait', bg: '#181412' },
  { title: 'Texture Study', cat: 'abstract', bg: '#101616' },
  { title: 'Empty Boulevard', cat: 'urban', bg: '#0f1217' },
  { title: 'Autumn Path', cat: 'nature', bg: '#171410' },
  { title: 'Light & Shadow', cat: 'abstract', bg: '#0f0f12' },
];

// PHOTOS comes from photos.js — fall back to placeholders when empty
const photoData =
  typeof PHOTOS !== 'undefined' && PHOTOS.length > 0 ? PHOTOS : placeholders;

// Build filter tabs dynamically from whatever categories are in use
const filterBar = document.querySelector('.filters');

function buildFilters(data) {
  const cats = ['all', ...new Set(data.map((p) => p.cat))];
  filterBar.innerHTML = cats
    .map(
      (c) =>
        `<button class="f-btn${
          c === 'all' ? ' active' : ''
        }" data-filter="${c}">${c}</button>`
    )
    .join('');
  filterBar.querySelectorAll('.f-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBar
        .querySelectorAll('.f-btn')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      buildGrid(btn.dataset.filter);
    });
  });
}

const grid = document.getElementById('photoGrid');
const PAGE_SIZE = 15;
const MASONRY_GAP = 10;

function masonryCols() {
  const w = window.innerWidth;
  if (w <= 520) return 1;
  if (w <= 900) return 2;
  return 3;
}

function runMasonry() {
  const cols = masonryCols();
  const gridW = grid.offsetWidth;
  const colW = (gridW - MASONRY_GAP * (cols - 1)) / cols;
  const heights = new Array(cols).fill(0);

  grid.querySelectorAll('.photo-item').forEach(item => {
    if (item.offsetHeight === 0) return; // skip images not yet loaded
    const col = heights.indexOf(Math.min(...heights));
    item.style.width = colW + 'px';
    item.style.left = col * (colW + MASONRY_GAP) + 'px';
    item.style.top = heights[col] + 'px';
    heights[col] += item.offsetHeight + MASONRY_GAP;
  });

  const max = Math.max(...heights);
  if (max > 0) grid.style.height = (max - MASONRY_GAP) + 'px';
}

window.addEventListener('resize', runMasonry, { passive: true });

function buildGrid(filter) {
  grid.innerHTML = '';
  grid.style.height = '0';

  const old = document.getElementById('loadMoreBtn');
  if (old) old.remove();

  const items = filter === 'all' ? photoData : photoData.filter((p) => p.cat === filter);
  let shown = 0;
  let scrollHandler = null;

  function watchForBottom() {
    if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
    if (shown >= items.length) return;

    scrollHandler = () => {
      if (grid.offsetHeight < 100) return; // grid not rendered yet
      const distFromBottom = grid.getBoundingClientRect().bottom - window.innerHeight;
      if (distFromBottom < 400) {
        window.removeEventListener('scroll', scrollHandler);
        scrollHandler = null;
        renderBatch();
      }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
  }

  function renderBatch() {
    const batch = items.slice(shown, shown + PAGE_SIZE).filter(p => p.file);
    if (batch.length === 0) return;

    batch.forEach(photo => {
      const wrap = document.createElement('div');
      wrap.className = 'photo-item';
      wrap.style.opacity = '0';
      wrap.innerHTML = `
        <img class="photo-thumb photo-real" src="${photo.file}" alt="${photo.title}">
        <div class="photo-overlay">
          <div class="photo-info">
            <h4>${photo.title}</h4>
            <span>${photo.cat}</span>
          </div>
        </div>
      `;

      const img = wrap.querySelector('img');
      img.addEventListener('load', () => {
        runMasonry();
        wrap.style.opacity = '1';
      }, { once: true });
      img.addEventListener('error', () => { wrap.remove(); runMasonry(); }, { once: true });

      wrap.addEventListener('click', () => openLightbox(photo));
      grid.appendChild(wrap);
    });

    shown += batch.length;
    watchForBottom();
  }

  renderBatch();
}

buildFilters(photoData);
buildGrid('all');

/* ============================================
   LIGHTBOX
   ============================================ */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbInfo = document.getElementById('lbInfo');
const lbClose = document.getElementById('lbClose');

function openLightbox(photo) {
  if (photo.file) {
    lbImg.innerHTML = `<img src="${photo.file}" alt="${photo.title}" style="width:100%;height:100%;object-fit:contain;border-radius:6px;">`;
    lbImg.style.cssText = 'background:none;';
  } else {
    lbImg.innerHTML = '';
    lbImg.style.cssText = `background:${photo.bg || '#111'};border-radius:6px;`;
  }
  lbInfo.textContent = `${photo.title} — ${photo.cat}`;
  lightbox.classList.add('open');
  document.addEventListener('keydown', onLbKey);
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.removeEventListener('keydown', onLbKey);
}

function onLbKey(e) {
  if (e.key === 'Escape') closeLightbox();
}

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

/* ============================================
   SCROLL REVEAL (Intersection Observer)
   ============================================ */
function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

/* ============================================
   CONTACT FORM
   ============================================ */
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('formSubmit');
  const form = e.target;

  btn.textContent = 'sending…';
  btn.style.pointerEvents = 'none';

  try {
    const res = await fetch('https://formspree.io/f/mlgkpbyz', {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      btn.textContent = 'sent ✓';
      btn.style.background = '#4ade80';
      form.reset();
      setTimeout(() => {
        btn.textContent = 'send it ↗';
        btn.style.background = '';
        btn.style.pointerEvents = '';
      }, 3000);
    } else {
      throw new Error('server error');
    }
  } catch {
    btn.textContent = 'failed — try again';
    btn.style.background = '#ef4444';
    setTimeout(() => {
      btn.textContent = 'send it ↗';
      btn.style.background = '';
      btn.style.pointerEvents = '';
    }, 3000);
  }
});

/* ============================================
   NAV LOGO — hover swaps text, click reloads
   ============================================ */
navLogo.addEventListener('mouseenter', () => { navLogo.textContent = 'jaywalking'; });
navLogo.addEventListener('mouseleave', () => { navLogo.textContent = 'jwalk'; });
navLogo.addEventListener('click', (e) => { e.preventDefault(); location.reload(); });
