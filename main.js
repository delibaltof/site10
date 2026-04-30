document.fonts.ready.then(() => {
    document.body.classList.add('fonts-loaded');

/* ================================================
   REVIEWS CAROUSEL — вставить в конец main.js
   ================================================ */
 
(function initReviews() {
 
  const track    = document.getElementById('reviewsTrack');
  const viewport = track?.parentElement;
  const prevBtn  = document.getElementById('reviewsPrev');
  const nextBtn  = document.getElementById('reviewsNext');
 
  if (!track) return;
 
  const VISIBLE = 3;
  const GAP     = 16;
  const cards   = track.querySelectorAll('.review-card');
  const steps   = cards.length - VISIBLE + 1;
  let current   = 0;
 
  function cardWidth() {
    return (viewport.offsetWidth - GAP * (VISIBLE - 1)) / VISIBLE;
  }
 
  function goTo(i) {
    current = Math.max(0, Math.min(i, steps - 1));
    track.style.transform = `translateX(-${current * (cardWidth() + GAP)}px)`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === steps - 1;
  }
 
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
 
  window.addEventListener('resize', () => goTo(current));
 
  goTo(0);
 
})();


/* ============================================================
   mariiaeats — contact-script.js
   Подключи перед </body>:
   <script src="js/contact-script.js"></script>

   !! ВАЖНО: замени FORMSPREE_ENDPOINT на свой реальный адрес.
   Получить на formspree.io → New Form → скопировать endpoint.
============================================================ */

(function () {
  'use strict';

  /* ── Настройки ──────────────────────────────────────────── */
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/XXXXXXXX'; // <-- замени

  /* ── Поля с правилами валидации ─────────────────────────── */
  const FIELDS = [
    {
      id:    'ce-name',
      errId: 'ce-name-err',
      check: v => v.trim().length >= 2
        ? ''
        : 'Please enter your full name.',
    },
    {
      id:    'ce-age',
      errId: 'ce-age-err',
      check: v => {
        const n = parseInt(v, 10);
        return (!n || n < 16 || n > 100)
          ? 'Please enter a valid age (16–100).'
          : '';
      },
    },
    {
      id:    'ce-email',
      errId: 'ce-email-err',
      check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        ? ''
        : 'Please enter a valid email address.',
    },
    {
      id:    'ce-goal',
      errId: 'ce-goal-err',
      check: v => v ? '' : 'Please select your goal.',
    },
    {
      id:    'ce-service',
      errId: 'ce-service-err',
      check: v => v ? '' : 'Please select a service.',
    },
    {
      id:    'ce-message',
      errId: 'ce-message-err',
      check: v => v.trim().length >= 10
        ? ''
        : 'Please tell me a bit more about your goals.',
    },
  ];

  /* ── DOM helpers ─────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }

  /* ── Сброс всех ошибок ───────────────────────────────────── */
  function clearErrors() {
    FIELDS.forEach(f => {
      const el  = $(f.id);
      const err = $(f.errId);
      if (el)  el.classList.remove('err');
      if (err) err.textContent = '';
    });
  }

  /* ── Валидация всех полей ────────────────────────────────── */
  function validate() {
    clearErrors();
    let ok = true;
    FIELDS.forEach(f => {
      const el  = $(f.id);
      const err = $(f.errId);
      if (!el) return;
      const msg = f.check(el.value);
      if (msg) {
        el.classList.add('err');
        if (err) err.textContent = msg;
        ok = false;
      }
    });
    return ok;
  }

  /* ── Инициализация ───────────────────────────────────────── */
  function init() {
    const form   = $('ce-form');
    const btn    = $('ce-submit');
    const okEl   = $('ce-ok');
    const failEl = $('ce-fail');
    if (!form) return;

    /* Сброс ошибки поля при вводе */
    FIELDS.forEach(f => {
      const el = $(f.id);
      if (!el) return;
      el.addEventListener('input', () => {
        el.classList.remove('err');
        const err = $(f.errId);
        if (err) err.textContent = '';
      });
    });

    /* Отправка формы */
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!validate()) return;

      btn.classList.add('loading');
      btn.disabled = true;
      okEl.style.display   = 'none';
      failEl.style.display = 'none';

      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method:  'POST',
          body:    new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          okEl.textContent   = "✓ Message sent! I'll get back to you within 24 hours.";
          okEl.style.display = 'block';
          form.reset();
          clearErrors();
        } else {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || 'Something went wrong. Please try again.');
        }
      } catch (err) {
        failEl.textContent   = err.message || 'Something went wrong. Please email me directly.';
        failEl.style.display = 'block';
      } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    });
  }

  /* ── Запуск после загрузки DOM ───────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ============================================================
   certificates.js — Certificates section behaviour
   - Анимация счётчика цифр в stats при появлении в viewport
   - Staggered fade-in для карточек
   ============================================================ */

(function () {
  'use strict';

  /* ── Утилита: анимация числа от 0 до target ─────────────── */
  function animateCounter(el, target, duration, suffix) {
    const start = performance.now();
    const isFloat = target % 1 !== 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* ease-out cubic */
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      el.textContent = isFloat
        ? current.toFixed(1)
        : Math.round(current).toString();

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toString();
      }
    }

    requestAnimationFrame(tick);
  }

  /* ── Конфиг счётчиков ────────────────────────────────────── */
  /* Каждый .stat-num содержит число + опционально <sup>.
     Мы анимируем только текстовый узел, <sup> не трогаем.      */
  function initCounters() {
    const items = document.querySelectorAll('.cert-stats .stat-item');

    items.forEach(function (item) {
      const numEl = item.querySelector('.stat-num');
      if (!numEl) return;

      /* Читаем только первый текстовый узел (само число) */
      const textNode = Array.from(numEl.childNodes).find(
        function (n) { return n.nodeType === Node.TEXT_NODE; }
      );
      if (!textNode) return;

      const raw = parseFloat(textNode.textContent.trim());
      if (isNaN(raw)) return;

      /* Сохраняем оригинал, ставим 0 до анимации */
      numEl.dataset.target = raw;
      textNode.textContent = '0';

      item._textNode = textNode;
      item._target   = raw;
    });

    return items;
  }

  /* ── Stagger-анимация карточек ───────────────────────────── */
  function initCards() {
    const cards = document.querySelectorAll('.cert-card');

    cards.forEach(function (card, i) {
      card.style.opacity    = '0';
      card.style.transform  = 'translateY(24px)';
      card.style.transition =
        'opacity .5s ease ' + (i * 80) + 'ms, ' +
        'transform .5s cubic-bezier(.22,1,.36,1) ' + (i * 80) + 'ms';
    });

    return cards;
  }

  /* ── IntersectionObserver ────────────────────────────────── */
  function observe(statsItems, cards) {
    var statsAnimated = false;
    var cardsAnimated = false;

    const statsBlock = document.querySelector('.cert-stats');
    const cardsBlock = document.querySelector('.cert-grid');

    if (!statsBlock || !cardsBlock) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {

          /* Stats */
          if (entry.target === statsBlock && !statsAnimated && entry.isIntersecting) {
            statsAnimated = true;
            statsItems.forEach(function (item) {
              if (item._textNode && item._target !== undefined) {
                animateCounter(item._textNode, item._target, 1200);
              }
            });
          }

          /* Cards */
          if (entry.target === cardsBlock && !cardsAnimated && entry.isIntersecting) {
            cardsAnimated = true;
            cards.forEach(function (card) {
              card.style.opacity   = '1';
              card.style.transform = 'translateY(0)';
            });
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(statsBlock);
    observer.observe(cardsBlock);
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    /* Проверяем, что секция есть на странице */
    if (!document.querySelector('.cert-section')) return;

    const statsItems = initCounters();
    const cards      = initCards();

    if ('IntersectionObserver' in window) {
      observe(statsItems, cards);
    } else {
      /* Fallback: показать всё сразу без анимации */
      statsItems.forEach(function (item) {
        if (item._textNode && item._target !== undefined) {
          item._textNode.textContent = item._target.toString();
        }
      });
      cards.forEach(function (card) {
        card.style.opacity   = '1';
        card.style.transform = 'translateY(0)';
      });
    }
  }

  /* Запуск после загрузки DOM */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();


});
