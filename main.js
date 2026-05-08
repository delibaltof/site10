console.log('main.js loaded');

/* ============================================================
   NAV OFFSET
   Keeps anchor scrolling aligned with the real fixed navbar height.
   ============================================================ */

(function initNavOffset() {
  function start() {
    const navbar = document.getElementById('navbar');

    if (!navbar) return;

    function updateNavOffset() {
      const navbarHeight = Math.ceil(navbar.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--nav-offset', `${navbarHeight}px`);
    }

    updateNavOffset();

    window.addEventListener('resize', updateNavOffset);
    window.addEventListener('orientationchange', updateNavOffset);

    if ('ResizeObserver' in window) {
      new ResizeObserver(updateNavOffset).observe(navbar);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

/* ============================================================
   MOBILE MENU
   ============================================================ */

(function initMobileMenu() {
  function start() {
    console.log('mobile menu init');

    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu__link');

    if (!menuToggle || !mobileMenu) return;

    function setMenuOpen(isOpen) {
      document.body.classList.toggle('menu-open', isOpen);

      mobileMenu.classList.toggle('is-open', isOpen);
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));

      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute(
        'aria-label',
        isOpen ? 'Close navigation menu' : 'Open navigation menu'
      );

      mobileMenuLinks.forEach(link => {
        link.tabIndex = isOpen ? 0 : -1;
      });
    }

    setMenuOpen(false);

    menuToggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      console.log('mobile menu clicked');

      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!isOpen);
    });

    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        setMenuOpen(false);
      });
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 951px)').matches) {
        setMenuOpen(false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();










/* ============================================================
   REVIEWS CAROUSEL
   ============================================================ */

(function initReviewsCarousel() {
  function start() {
    const viewport = document.querySelector('.reviews__viewport');
    const track = document.querySelector('.reviews__track');
    const cards = Array.from(document.querySelectorAll('.review-card'));

    if (!viewport || !track || cards.length === 0) return;

    const AUTOPLAY_DELAY = 1250;
    const TRANSITION_DURATION = 650;
    const MOBILE_QUERY = window.matchMedia('(max-width: 768px)');
const DESKTOP_QUERY = window.matchMedia('(min-width: 769px)');
const DESKTOP_SCROLL_SPEED = 70;
    let currentIndex = 0;
    let autoplayTimer = null;
    let isAnimating = false;
    let scrollTimer = null;
    let autoplayDisabled = false;
    let isDesktopDragging = false;
let dragStartX = 0;
let dragStartScrollLeft = 0;
let desktopFrame = null;
let desktopLastTime = null;
let desktopScrollPosition = 0;
let reviewsInView = false;
let touchStartX = 0;
let touchStartY = 0;

    function getGap() {
      const styles = window.getComputedStyle(track);
      return parseFloat(styles.columnGap || styles.gap || 0) || 0;
    }

    function getStep() {
      return cards[0].offsetWidth + getGap();
    }

    function getMaxIndex() {
      return cards.length - 1;
    }

    function updateCurrentIndex() {
      const step = getStep();

      if (!step) return;

      currentIndex = Math.round(viewport.scrollLeft / step);
      currentIndex = Math.max(0, Math.min(currentIndex, getMaxIndex()));
    }

    function animateScrollTo(targetLeft, duration) {
  const startLeft = viewport.scrollLeft;
  const distance = targetLeft - startLeft;
  const startTime = performance.now();

  isAnimating = true;
  viewport.classList.add('is-auto-scrolling');

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
const eased = 1 - Math.pow(1 - progress, 3);

    viewport.scrollLeft = startLeft + distance * eased;

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    viewport.scrollLeft = targetLeft;
    viewport.classList.remove('is-auto-scrolling');

    isAnimating = false;
    updateCurrentIndex();

    if (currentIndex < getMaxIndex()) {
      startAutoplay();
    }
  }

  requestAnimationFrame(tick);
}

    function goTo(index) {
      const nextIndex = Math.max(0, Math.min(index, getMaxIndex()));

      currentIndex = nextIndex;
      animateScrollTo(currentIndex * getStep(), TRANSITION_DURATION);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
        autoplayTimer = null;
      }
    }

function startAutoplay() {
  stopAutoplay();

  if (!reviewsInView) return;
  if (autoplayDisabled) return;
  if (!MOBILE_QUERY.matches) return;
  if (currentIndex >= getMaxIndex()) return;

  autoplayTimer = setTimeout(function () {
    goTo(currentIndex + 1);
  }, AUTOPLAY_DELAY);
}

    function restartAutoplay() {
      stopAutoplay();
      updateCurrentIndex();

      if (currentIndex < getMaxIndex()) {
        startAutoplay();
      }
    }

viewport.addEventListener('touchstart', function (event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}, { passive: true });

viewport.addEventListener('touchmove', function (event) {
  if (autoplayDisabled) return;

  const touchX = event.touches[0].clientX;
  const touchY = event.touches[0].clientY;

  const deltaX = Math.abs(touchX - touchStartX);
  const deltaY = Math.abs(touchY - touchStartY);

  if (deltaX > 8 && deltaX > deltaY) {
    autoplayDisabled = true;
    stopAutoplay();
  }
}, { passive: true });

viewport.addEventListener('touchend', function () {
  updateCurrentIndex();
}, { passive: true });



function getMaxScrollLeft() {
  return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
}

function startDesktopAutoScroll() {
  if (desktopFrame) return;

  desktopScrollPosition = viewport.scrollLeft;

  function tick(now) {
    if (!DESKTOP_QUERY.matches) {
      desktopLastTime = now;
      desktopFrame = requestAnimationFrame(tick);
      return;
    }

    if (desktopLastTime === null) {
      desktopLastTime = now;
    }

    const delta = now - desktopLastTime;
    desktopLastTime = now;

if (reviewsInView && !isDesktopDragging && desktopScrollPosition < getMaxScrollLeft()) {
      desktopScrollPosition += (DESKTOP_SCROLL_SPEED * delta) / 1000;
      viewport.scrollLeft = desktopScrollPosition;
    }

    desktopFrame = requestAnimationFrame(tick);
  }

  desktopFrame = requestAnimationFrame(tick);
}

viewport.addEventListener('mousedown', function (event) {
  if (!DESKTOP_QUERY.matches) return;
  if (event.button !== 0) return;

  isDesktopDragging = true;
  dragStartX = event.clientX;
  dragStartScrollLeft = viewport.scrollLeft;
  desktopScrollPosition = viewport.scrollLeft;
  viewport.classList.add('is-dragging');
});

window.addEventListener('mousemove', function (event) {
  if (!isDesktopDragging) return;

  const distance = event.clientX - dragStartX;
desktopScrollPosition = dragStartScrollLeft - distance;
viewport.scrollLeft = desktopScrollPosition;
});

window.addEventListener('mouseup', function () {
  if (!isDesktopDragging) return;

  isDesktopDragging = false;
  viewport.classList.remove('is-dragging');
  desktopScrollPosition = viewport.scrollLeft;
});




const reviewsObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    reviewsInView = entry.isIntersecting;

    if (reviewsInView) {
  desktopScrollPosition = viewport.scrollLeft;
  startDesktopAutoScroll();
  startAutoplay();
} else {
  stopAutoplay();
}
  });
}, {
  threshold: 0.2
});

reviewsObserver.observe(viewport);
window.addEventListener('resize', function () {
  updateCurrentIndex();
  viewport.scrollLeft = currentIndex * getStep();
  restartAutoplay();
});

updateCurrentIndex();
startAutoplay();
MOBILE_QUERY.addEventListener('change', restartAutoplay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

/* ============================================================
   CONTACT FORM
   ============================================================ */

(function initContactForm() {
  'use strict';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xzdoakrj';

const FIELDS = [
  {
    id: 'ce-name',
    errId: 'ce-name-err',
    check: value =>
      value.trim().length >= 2 ? '' : 'Please enter your full name.',
  },
  {
  id: 'ce-age',
  errId: 'ce-age-err',
  check: value => {
    const trimmed = value.trim();

    if (!/^\d+$/.test(trimmed)) {
      return 'Please enter a valid age (16-100).';
    }

    const number = parseInt(trimmed, 10);

    return number < 16 || number > 100
      ? 'Please enter a valid age (16-100).'
      : '';
  },
},
  {
    id: 'ce-email',
    errId: 'ce-email-err',
    check: value =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        ? ''
        : 'Please enter a valid email address.',
  },
  {
    id: 'ce-phone',
    errId: 'ce-phone-err',
    check: value =>
      /^[+\d][\d\s().-]{6,}$/.test(value.trim())
        ? ''
        : 'Please enter a valid phone number.',
  },
];

  function byId(id) {
    return document.getElementById(id);
  }

  function clearErrors() {
    FIELDS.forEach(field => {
      const element = byId(field.id);
      const error = byId(field.errId);

      if (element) element.classList.remove('err');
      if (error) error.textContent = '';
    });
  }

  function validate() {
    clearErrors();

    let isValid = true;

    FIELDS.forEach(field => {
      const element = byId(field.id);
      const error = byId(field.errId);

      if (!element) return;

      const message = field.check(element.value);

      if (message) {
        element.classList.add('err');
        if (error) error.textContent = message;
        isValid = false;
      }
    });

    return isValid;
  }

  function start() {
    const form = byId('ce-form');
    const button = byId('ce-submit');
    const okElement = byId('ce-ok');
    const failElement = byId('ce-fail');

    if (!form || !button || !okElement || !failElement) return;

    FIELDS.forEach(field => {
      const element = byId(field.id);

      if (!element) return;

      element.addEventListener('input', () => {
        element.classList.remove('err');

        const error = byId(field.errId);
        if (error) error.textContent = '';
      });
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();

      if (!validate()) return;

      button.classList.add('loading');
      button.disabled = true;

      okElement.style.display = 'none';
      failElement.style.display = 'none';

      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          body: new FormData(form),
          headers: {
            Accept: 'application/json',
          },
        });

        if (response.ok) {
          okElement.textContent =
            "Message sent! I'll get back to you within 24 hours.";
          okElement.style.display = 'block';

          form.reset();
          clearErrors();
        } else {
          const json = await response.json().catch(() => ({}));
          throw new Error(json.error || 'Something went wrong. Please try again.');
        }
      } catch (error) {
        failElement.textContent =
          error.message || 'Something went wrong. Please email me directly.';
        failElement.style.display = 'block';
      } finally {
        button.classList.remove('loading');
        button.disabled = false;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

/* ============================================================
   CERTIFICATES
   ============================================================ */

(function initCertificates() {
  'use strict';

  function animateCounter(textNode, target, duration) {
    const start = performance.now();
    const isFloat = target % 1 !== 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      textNode.textContent = isFloat
        ? current.toFixed(1)
        : Math.round(current).toString();

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        textNode.textContent = target.toString();
      }
    }

    requestAnimationFrame(tick);
  }

  function initCounters() {
    const items = document.querySelectorAll('.cert-stats .stat-item');

    items.forEach(item => {
      const numberElement = item.querySelector('.stat-num');

      if (!numberElement) return;

      const textNode = Array.from(numberElement.childNodes).find(
        node => node.nodeType === Node.TEXT_NODE
      );

      if (!textNode) return;

      const target = parseFloat(textNode.textContent.trim());

      if (Number.isNaN(target)) return;

      textNode.textContent = '0';

      item._textNode = textNode;
      item._target = target;
    });

    return items;
  }

  function initCards() {
    const cards = document.querySelectorAll('.cert-card');

    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(24px)';
      card.style.transition =
        `opacity .5s ease ${index * 80}ms, ` +
        `transform .5s cubic-bezier(.22,1,.36,1) ${index * 80}ms`;
    });

    return cards;
  }

  function observe(statsItems, cards) {
    let statsAnimated = false;
    let cardsAnimated = false;

    const statsBlock = document.querySelector('.cert-stats');
    const cardsBlock = document.querySelector('.cert-grid');

    if (!statsBlock || !cardsBlock) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.target === statsBlock && !statsAnimated && entry.isIntersecting) {
            statsAnimated = true;

            statsItems.forEach(item => {
              if (item._textNode && item._target !== undefined) {
                animateCounter(item._textNode, item._target, 1200);
              }
            });
          }

          if (entry.target === cardsBlock && !cardsAnimated && entry.isIntersecting) {
            cardsAnimated = true;

            cards.forEach(card => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(statsBlock);
    observer.observe(cardsBlock);
  }

  function start() {
    if (!document.querySelector('.cert-section')) return;

    const statsItems = initCounters();
    const cards = initCards();

    if ('IntersectionObserver' in window) {
      observe(statsItems, cards);
    } else {
      statsItems.forEach(item => {
        if (item._textNode && item._target !== undefined) {
          item._textNode.textContent = item._target.toString();
        }
      });

      cards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

/* ============================================================
   LOGO FALLBACK
   ============================================================ */

(function initLogoFallback() {
  function start() {
    const logoImage = document.querySelector('.logo-icon');

    if (!logoImage) return;

    logoImage.addEventListener('error', () => {
      logoImage.style.display = 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

/* ============================================================
   FONTS
   Only controls font-loaded animations. Nothing important waits for this.
   ============================================================ */

(function initFontsLoadedClass() {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      document.body.classList.add('fonts-loaded');
    });
  } else {
    document.body.classList.add('fonts-loaded');
  }

 (function initScrollReveal() {
  const sections = document.querySelectorAll('#about, #certificates, #services, #contact, #reviews');
  const DESKTOP_QUERY = window.matchMedia('(min-width: 769px)');

  if (!sections.length) return;

  let hasUserScrolled = false;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      if (DESKTOP_QUERY.matches && !hasUserScrolled) return;

      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.15
  });

  sections.forEach(function (section) {
    observer.observe(section);
  });

  window.addEventListener('scroll', function () {
    if (hasUserScrolled) return;

    if (window.scrollY > 40) {
      hasUserScrolled = true;

      sections.forEach(function (section) {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
          section.classList.add('is-visible');
          observer.unobserve(section);
        }
      });
    }
  }, { passive: true });
})();



})();
