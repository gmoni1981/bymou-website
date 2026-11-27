(() => {
  const slider = document.querySelector('#toss-brand-slider');
  if (!slider) return;
  const viewport = slider.querySelector('.cult-window');
  const slides = [...slider.querySelectorAll('.cult-slide')];
  const count = slider.querySelector('.cult-count');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let drag;
  let scrollFrame = 0;
  let previousStep = -1;
  let targetStep = 0;
  let advanceTimer;
  let snapTimer;
  let nextAdvance = 0;
  const dwell = 1050;
  const stride = () => Math.min(460, window.innerHeight * .55);

  function select(index) {
    const next = (index + slides.length) % slides.length;
    if (next !== active) viewport.scrollTop = 0;
    active = next;
    slider.dataset.slide = active;
    slider.style.setProperty('--cult-index', active);
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== active)));
    count.textContent = [active + 1, slides.length].map(n => String(n).padStart(2, '0')).join(' / ');
  }

  function advance() {
    clearTimeout(advanceTimer);
    if (reduced.matches || active === targetStep) return;
    const delay = nextAdvance - performance.now();
    if (delay > 0) {
      advanceTimer = setTimeout(advance, delay);
      return;
    }
    select(active + Math.sign(targetStep - active));
    nextAdvance = performance.now() + dwell;
    if (active !== targetStep) advanceTimer = setTimeout(advance, dwell);
  }

  function updateFromScroll() {
    scrollFrame = 0;
    if (reduced.matches) return;
    const distance = -slider.getBoundingClientRect().top;
    const step = Math.max(0, Math.min(slides.length - 1, Math.round(distance / stride())));
    if (step !== previousStep) {
      previousStep = targetStep = step;
      advance();
    }
    clearTimeout(snapTimer);
    if (distance >= 0 && distance <= stride() * (slides.length - 1)) {
      snapTimer = setTimeout(() => {
        const offset = slider.getBoundingClientRect().top + step * stride();
        if (!drag && Math.abs(offset) > 2) window.scrollBy({ top:offset, behavior:'smooth' });
      }, 180);
    }
  }

  function queueScrollUpdate() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateFromScroll);
  }

  function resize() {
    slider.style.setProperty('--toss-run', `${stride() * (slides.length - 1)}px`);
    queueScrollUpdate();
  }

  function manual(index) {
    clearTimeout(advanceTimer);
    clearTimeout(snapTimer);
    select(index);
    targetStep = active;
    nextAdvance = performance.now() + dwell;
  }

  window.addEventListener('scroll', queueScrollUpdate, { passive:true });
  window.addEventListener('resize', resize, { passive:true });
  reduced.addEventListener('change', () => {
    clearTimeout(advanceTimer);
    clearTimeout(snapTimer);
    previousStep = -1;
    resize();
  });
  slider.dataset.scrollReady = '';
  resize();

  slider.querySelectorAll('[data-toss-step]').forEach(button => {
    button.addEventListener('click', () => manual(active + Number(button.dataset.tossStep)));
  });
  viewport.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    manual(active + (event.key === 'ArrowLeft' ? -1 : 1));
  });

  viewport.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { id:event.pointerId, x:event.clientX, y:event.clientY };
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId || reduced.matches) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
    viewport.classList.add('is-dragging');
    const edge = (active === 0 && dx > 0) || (active === slides.length - 1 && dx < 0);
    slider.style.setProperty('--toss-drag', `${dx * (edge ? .15 : .72)}px`);
  });
  function finish(event) {
    if (drag?.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag = undefined;
    viewport.classList.remove('is-dragging');
    slider.style.removeProperty('--toss-drag');
    if (event.type === 'pointerup' && Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      const next = active + (dx < 0 ? 1 : -1);
      if (next >= 0 && next < slides.length) manual(next);
    }
  }
  viewport.addEventListener('pointerup', finish);
  viewport.addEventListener('pointercancel', finish);
  viewport.addEventListener('lostpointercapture', finish);
})();
