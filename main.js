/* ============================================
   PORTFOLIO CV – SCRIPT PRINCIPAL
   Todos los módulos funcionales en una IIFE
   ============================================ */

(function () {
  'use strict';

  /* ===== UTILIDADES ===== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ===== 1. PRELOADER ===== */
  function initPreloader() {
    const pre = $('#preloader');
    if (!pre) return;

    const minDuration = 1500;
    let startTime = Date.now();

    function hidePreloader() {
      pre.setAttribute('aria-hidden', 'true');
      setTimeout(() => (pre.style.display = 'none'), 400);
    }

    window.addEventListener('load', () => {
      const elapsed = Date.now() - startTime;
      const remaining = minDuration - elapsed;
      if (remaining > 0) {
        setTimeout(hidePreloader, remaining);
      } else {
        hidePreloader();
      }
    });

    setTimeout(() => {
      if (pre.getAttribute('aria-hidden') !== 'true') {
        hidePreloader();
      }
    }, minDuration);
  }

  /* ===== 2. YEAR ===== */
  function setYear() {
    const y = new Date().getFullYear();
    const el = $('#year');
    if (el) el.textContent = y;
  }

  /* ===== 3. WATERMARK PARALLAX ===== */
  function initWatermark() {
    const mark = $('#watermark');
    if (!mark) return;

    const strength = 0.06;
    let rect = null;

    function onMove(e) {
      const x = e.clientX || (e.touches?.[0]?.clientX) || 0;
      const y = e.clientY || (e.touches?.[0]?.clientY) || 0;

      if (!rect) rect = document.documentElement.getBoundingClientRect();

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (x - cx) * strength;
      const dy = (y - cy) * strength;

      mark.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }

    function onLeave() {
      mark.style.transform = '';
    }

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', () => (rect = null));
  }

  /* ===== 4. SHOWCASE CAROUSEL ===== */
  function initShowcase() {
    const showcase = $('#showcase');
    if (!showcase) return;

    const slidesWrap = $('.slides', showcase);
    const slides = $$('.slide', slidesWrap);
    const prevBtn = $('.showcase-prev', showcase);
    const nextBtn = $('.showcase-next', showcase);
    const indicators = $$('.showcase-indicators button', showcase);

    let index = 0;
    let timer = null;
    const interval = 4500;
    let isPaused = false;

    /* Navegar a slide específico */
    function goTo(i, animate = true) {
      index = (i + slides.length) % slides.length;

      if (!animate) slidesWrap.style.transition = 'none';
      slidesWrap.style.transform = `translateX(${index * -100}%)`;

      if (!animate) {
        requestAnimationFrame(
          () => (slidesWrap.style.transition = 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)')
        );
      }

      indicators.forEach((b) => b.classList.remove('active'));
      if (indicators[index]) indicators[index].classList.add('active');

      lazyLoadSlide(index);
    }

    function next() {
      goTo(index + 1);
    }

    function prev() {
      goTo(index - 1);
    }

    function start() {
      stop();
      timer = setInterval(() => {
        if (!isPaused) next();
      }, interval);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    /* Carga perezosa de imágenes */
    function lazyLoadSlide(i) {
      const s = slides[i];
      if (!s || s.dataset.loaded === 'true') return;

      const bg = s.dataset.bg;
      if (!bg) return;

      const img = new Image();
      img.src = bg;
      img.onload = () => {
        s.style.backgroundImage = `url('${bg}')`;
        s.dataset.loaded = 'true';
      };
      img.onerror = () => (s.dataset.loaded = 'true');
    }

    lazyLoadSlide(0);

    /* Event listeners */
    nextBtn?.addEventListener('click', () => {
      next();
      start();
    });

    prevBtn?.addEventListener('click', () => {
      prev();
      start();
    });

    indicators.forEach((btn) => {
      btn.addEventListener('click', () => {
        const to = Number(btn.dataset.slide) || 0;
        goTo(to);
        start();
      });
    });

    showcase.addEventListener('pointerenter', () => (isPaused = true));
    showcase.addEventListener('pointerleave', () => (isPaused = false));
    showcase.addEventListener('focusin', () => (isPaused = true));
    showcase.addEventListener('focusout', () => (isPaused = false));

    /* Navegación por teclado */
    showcase.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        next();
        start();
      }
      if (e.key === 'ArrowLeft') {
        prev();
        start();
      }
    });

    /* Navegación por touch */
    let startX = 0;
    showcase.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
    showcase.addEventListener('touchend', (e) => {
      const endX = e.changedTouches?.[0]?.clientX || 0;
      const dx = endX - startX;

      if (Math.abs(dx) > 40) {
        if (dx < 0) next();
        else prev();
        start();
        e.preventDefault();
      }
    });

    start();
    return { goTo, next, prev, start, stop };
  }

  /* ===== 5. JOB FIGURES + VIEW TRANSITION ===== */
  function initJobFigures() {
    const container = $('.job-figure-carousel');
    if (!container) return;

    const buttons = Array.from(container.querySelectorAll('.job-figure'));
    const jobIds = buttons.map((b) => b.getAttribute('aria-controls') || `job-${b.dataset.target}`);

    function showJob(idx) {
      const doTransition = 'startViewTransition' in document;

      const run = () => {
        buttons.forEach((b, i) => b.setAttribute('aria-selected', i === idx ? 'true' : 'false'));

        jobIds.forEach((id, i) => {
          const job = document.getElementById(id);
          if (!job) return;

          const visible = i === idx;
          job.setAttribute('aria-hidden', visible ? 'false' : 'true');
          job.setAttribute('data-visible', visible ? 'true' : 'false');
        });

        window.dispatchEvent(new CustomEvent('jobfigure:change'));
      };

      if (doTransition) document.startViewTransition(() => run());
      else run();
    }

    jobIds.forEach((id) => {
      const job = document.getElementById(id);
      if (job) job.setAttribute('data-visible', 'false');
    });

    showJob(0);

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => showJob(i));

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          const nx = (i + 1) % buttons.length;
          buttons[nx].click();
        }
        if (e.key === 'ArrowLeft') {
          const px = (i - 1 + buttons.length) % buttons.length;
          buttons[px].click();
        }
      });
    });

    const articlesContainer = $('.job-articles');

    function recomputeHeight() {
      if (!articlesContainer) return;

      const ids = jobIds.filter(Boolean);
      let maxH = 0;

      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;

        const prevDisplay = el.style.display;
        el.style.display = '';
        const h = el.getBoundingClientRect().height;
        if (h > maxH) maxH = h;
        el.style.display = prevDisplay;
      });

      if (maxH > 0) articlesContainer.style.minHeight = `${Math.ceil(maxH)}px`;
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        recomputeHeight();
        resizeTimer = null;
      }, 150);
    });

    setTimeout(recomputeHeight, 80);
  }

  /* ===== 6. THEME SWITCHER ===== */
  function initThemeSwitcher() {
    const btn = document.createElement('button');
    btn.className = 'theme-switcher';
    btn.setAttribute('aria-label', 'Cambiar tema');
    btn.innerHTML = `
      <span class="theme-icon">
        <span class="sun" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" fill="#f59e0b"/>
            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" fill="#f59e0b"/>
          </svg>
        </span>
        <span class="moon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="var(--text-main)"/>
          </svg>
        </span>
      </span>`;

    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });

    document.body.appendChild(btn);
  }

  /* ===== 7. INIT ALL ===== */
  function ready() {
    setYear();
    initPreloader();
    initWatermark();
    initShowcase();
    initJobFigures();
    initThemeSwitcher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();