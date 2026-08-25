/**
 * ==========================================================================
 * File: /assets/js/homepage-shelf-carousel.js
 * Description: Premium 3D "supermarket shelf" category carousel for the
 * AYT Mart homepage hero. Categories and products are NOT hardcoded here —
 * they are supplied by the caller (index.html), which pulls them straight
 * from the existing ProductService (i.e. whatever the backend returns).
 * This module only owns layout/interaction; it never invents categories,
 * products, or copy that the backend didn't provide.
 * ==========================================================================
 */
window.AYTShelfCarousel = (function () {
  'use strict';

  const CONFIG = {
    visibleRadius: 2,        // how many shelves are shown on each side of center
    autoplayDelay: 5200,
    swipeThreshold: 42,
    productsPerShelf: 4,
    transitionLockMs: 620,
  };

  const state = {
    categories: [],
    activeIndex: 0,
    isTransitioning: false,
    autoplayTimer: null,
    reducedMotion: false,
    touch: { startX: 0, startY: 0, dx: 0, deciding: true, horizontal: false },
  };

  const els = {};
  const FALLBACK_IMG = 'https://placehold.co/200x200/eee7d4/756f62?text=AYT';

  function init(categories, opts = {}) {
    els.section = document.getElementById('hero-shelf');
    els.stage = document.getElementById('shelfStage');
    if (!els.section || !els.stage) return;

    els.prev = els.section.querySelector('.hs-prev');
    els.next = els.section.querySelector('.hs-next');

    state.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    state.categories = Array.isArray(categories) ? categories.filter(Boolean) : [];

    if (!state.categories.length) {
      els.section.style.display = 'none';
      return;
    }

    state.activeIndex = 0;
    buildShelves();
    layout();
    bindEvents();
    if (!state.reducedMotion) startAutoplay();
  }

  /* ---------------------------------------------------------------------
     Build DOM (once) — one .hs-shelf per category, positioned absolutely
     and re-laid-out purely via transforms afterwards.
     --------------------------------------------------------------------- */
  function buildShelves() {
    els.stage.innerHTML = '';
    els.stage.setAttribute('role', 'listbox');
    els.stage.setAttribute('aria-label', 'ক্যাটাগরি শেলফ, বাঁয়ে/ডানে সোয়াইপ বা তীর চিহ্নে চাপুন');

    const frag = document.createDocumentFragment();
    state.categories.forEach((cat, i) => {
      frag.appendChild(buildShelfEl(cat, i));
    });
    els.stage.appendChild(frag);
    els.shelfEls = Array.from(els.stage.querySelectorAll('.hs-shelf'));
  }

  function buildShelfEl(cat, index) {
    const a = document.createElement('a');
    a.className = 'hs-shelf';
    a.href = `products.html?category=${encodeURIComponent(cat.id)}`;
    a.dataset.index = String(index);
    a.setAttribute('role', 'option');
    a.setAttribute('aria-selected', 'false');

    const products = Array.isArray(cat._products) ? cat._products.slice(0, CONFIG.productsPerShelf) : [];

    const tilesHtml = products.length
      ? `<div class="hs-shelf-rows">${products.map(p => `
          <div class="hs-prod-tile">
            <img src="${escapeAttr(p.image || FALLBACK_IMG)}" alt="${escapeAttr(p.name || '')}"
                 loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">
          </div>`).join('')}</div>`
      : `<div class="hs-shelf-empty">শীঘ্রই পণ্য যুক্ত হচ্ছে</div>`;

    a.innerHTML = `
      <div class="hs-shelf-inner">
        <div class="hs-shelf-glow" aria-hidden="true"></div>
        <div class="hs-shelf-header">
          <span class="hs-shelf-icon" aria-hidden="true">${escapeHtml(cat.icon || '🛍️')}</span>
          <h3 class="hs-shelf-title">${escapeHtml(cat.name || '')}</h3>
        </div>
        ${tilesHtml}
        <span class="hs-shelf-cta">
          <span class="hs-cta-full">এই ক্যাটাগরি&nbsp;</span>দেখুন
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
        </span>
      </div>`;
    return a;
  }

  /* ---------------------------------------------------------------------
     Layout — positions every shelf relative to the active (center) index
     using pure CSS transforms (translate3d + rotateY + scale).
     --------------------------------------------------------------------- */
  function layout() {
    if (!els.shelfEls) return;
    const n = els.shelfEls.length;
    const cs = getComputedStyle(els.stage);
    const stepX = parseFloat(cs.getPropertyValue('--hs-step-x')) || 250;
    const stepZ = parseFloat(cs.getPropertyValue('--hs-step-z')) || -160;
    const scaleStep = parseFloat(cs.getPropertyValue('--hs-scale-step')) || .16;
    const rotStep = parseFloat(cs.getPropertyValue('--hs-rot-step')) || 18;

    els.shelfEls.forEach((el, i) => {
      const offset = circularOffset(i, state.activeIndex, n);
      const absOff = Math.abs(offset);
      const hidden = absOff > CONFIG.visibleRadius;

      const tx = offset * stepX;
      const tz = offset === 0 ? 34 : stepZ * absOff;
      const scale = offset === 0 ? 1.12 : Math.max(.42, 1 - absOff * scaleStep);
      const rotY = offset === 0 ? 0 : (offset < 0 ? rotStep : -rotStep) * Math.min(absOff, 1.5);
      const opacity = hidden ? 0 : (offset === 0 ? 1 : Math.max(.32, 1 - absOff * .32));
      const brightness = offset === 0 ? 1.06 : Math.max(.6, 1 - absOff * .18);

      el.style.transform = `translate(-50%, -50%) translate3d(${tx}px, 0, ${tz}px) rotateY(${rotY}deg) scale(${scale})`;
      el.style.opacity = String(opacity);
      el.style.zIndex = String(200 - absOff * 10 + (offset === 0 ? 5 : 0));
      el.style.filter = `brightness(${brightness})${absOff >= 2 ? ' blur(.5px)' : ''}`;
      el.style.pointerEvents = hidden ? 'none' : '';
      el.tabIndex = hidden ? -1 : 0;
      el.setAttribute('aria-hidden', hidden ? 'true' : 'false');
      el.setAttribute('aria-selected', offset === 0 ? 'true' : 'false');
      el.classList.toggle('is-active', offset === 0);
    });
  }

  function circularOffset(i, active, n) {
    let diff = i - active;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    return diff;
  }

  /* ---------------------------------------------------------------------
     Navigation
     --------------------------------------------------------------------- */
  function goTo(index, { restartAutoplay = true } = {}) {
    if (state.isTransitioning || !els.shelfEls || !els.shelfEls.length) return;
    const n = els.shelfEls.length;
    state.activeIndex = ((index % n) + n) % n;
    state.isTransitioning = true;
    layout();
    window.setTimeout(() => { state.isTransitioning = false; }, CONFIG.transitionLockMs);
    if (restartAutoplay) restartAutoplayTimer();
  }
  function goNext(opts) { goTo(state.activeIndex + 1, opts); }
  function goPrev(opts) { goTo(state.activeIndex - 1, opts); }

  /* ---------------------------------------------------------------------
     Autoplay — slow, pauses on any interaction
     --------------------------------------------------------------------- */
  function startAutoplay() {
    stopAutoplay();
    if (els.shelfEls && els.shelfEls.length > 1) {
      state.autoplayTimer = window.setInterval(() => goNext({ restartAutoplay: false }), CONFIG.autoplayDelay);
    }
  }
  function stopAutoplay() {
    if (state.autoplayTimer) { window.clearInterval(state.autoplayTimer); state.autoplayTimer = null; }
  }
  function restartAutoplayTimer() {
    if (!state.reducedMotion) startAutoplay();
  }

  /* ---------------------------------------------------------------------
     Events — arrows, keyboard, hover-pause, touch swipe, resize
     --------------------------------------------------------------------- */
  function bindEvents() {
    els.prev?.addEventListener('click', () => goPrev());
    els.next?.addEventListener('click', () => goNext());

    els.section.addEventListener('mouseenter', stopAutoplay);
    els.section.addEventListener('mouseleave', restartAutoplayTimer);
    els.section.addEventListener('focusin', stopAutoplay);
    els.section.addEventListener('focusout', restartAutoplayTimer);

    els.stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    });

    // Touch / pointer swipe — horizontal-only, doesn't block vertical page scroll.
    els.stage.addEventListener('touchstart', onTouchStart, { passive: true });
    els.stage.addEventListener('touchmove', onTouchMove, { passive: false });
    els.stage.addEventListener('touchend', onTouchEnd, { passive: true });

    let resizeRaf = null;
    window.addEventListener('resize', () => {
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(layout);
    });

    if (window.matchMedia) {
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', (e) => {
        state.reducedMotion = e.matches;
        if (e.matches) stopAutoplay(); else startAutoplay();
      });
    }
  }

  function onTouchStart(e) {
    const t = e.touches[0];
    state.touch = { startX: t.clientX, startY: t.clientY, dx: 0, deciding: true, horizontal: false };
    stopAutoplay();
  }
  function onTouchMove(e) {
    const t = e.touches[0];
    const dx = t.clientX - state.touch.startX;
    const dy = t.clientY - state.touch.startY;
    state.touch.dx = dx;
    if (state.touch.deciding && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      state.touch.horizontal = Math.abs(dx) > Math.abs(dy);
      state.touch.deciding = false;
    }
    if (state.touch.horizontal) e.preventDefault(); // stop page from scrolling sideways
  }
  function onTouchEnd() {
    if (state.touch.horizontal && Math.abs(state.touch.dx) > CONFIG.swipeThreshold) {
      if (state.touch.dx < 0) goNext({ restartAutoplay: false });
      else goPrev({ restartAutoplay: false });
    }
    restartAutoplayTimer();
  }

  /* ---------------------------------------------------------------------
     Utils
     --------------------------------------------------------------------- */
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function escapeAttr(str) { return escapeHtml(str); }

  return { init };
})();
