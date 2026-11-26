(() => {
  const slider = document.querySelector('#toss-brand-slider');
  if (!slider) return;
  const viewport = slider.querySelector('.cult-window');
  const slides = [...slider.querySelectorAll('.cult-slide')];
  const count = slider.querySelector('.cult-count');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let drag;

  function select(index) {
    active = (index + slides.length) % slides.length;
    slider.dataset.slide = active;
    slider.style.setProperty('--cult-index', active);
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== active)));
    count.textContent = [active + 1, slides.length].map(n => String(n).padStart(2, '0')).join(' / ');
  }

  slider.querySelectorAll('[data-toss-step]').forEach(button => {
    button.addEventListener('click', () => select(active + Number(button.dataset.tossStep)));
  });
  viewport.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    select(active + (event.key === 'ArrowLeft' ? -1 : 1));
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
      if (next >= 0 && next < slides.length) select(next);
    }
  }
  viewport.addEventListener('pointerup', finish);
  viewport.addEventListener('pointercancel', finish);
  viewport.addEventListener('lostpointercapture', finish);
})();
