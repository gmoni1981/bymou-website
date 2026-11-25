(() => {
  const section = document.querySelector('.cult');
  if (!section) return;
  const windowEl = section.querySelector('.cult-window');
  const slides = [...section.querySelectorAll('.cult-slide')];
  const count = section.querySelector('.cult-count');
  const caption = section.querySelector('.cult-caption');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const defaultLabels = [
    ['THE PRODUCT', 'Packaging System / Flavor Identity'],
    ['THE LANGUAGE', 'Typography / Color / Visual Identity'],
    ['THE CHARACTERS', 'The Cult / Character Universe'],
  ];
  const labels = slides.map((slide, index) => slide.dataset.title
    ? [slide.dataset.title, slide.dataset.caption]
    : defaultLabels[index]);
  const last = slides.length - 1;
  const total = String(slides.length).padStart(2, '0');
  let captionMotion;
  const desktop = matchMedia('(min-width:761px) and (min-height:570px) and (prefers-reduced-motion:no-preference)');
  let active = 0;
  let frame = 0;
  let touch;
  let previousStep = -1;

  function select(index) {
    const next = (index + slides.length) % slides.length;
    if (active === next) return;
    active = next;
    const number = String(active + 1).padStart(2, '0');
    section.dataset.slide = active;
    section.style.setProperty('--cult-index', active);
    section.style.setProperty('--cult-progress', (active + 1) / slides.length);
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== active)));
    count.textContent = number + ' / ' + total;
    caption.querySelector('.cult-ghost').textContent = number;
    caption.querySelector('h3').textContent = number + ' — ' + labels[active][0];
    caption.querySelector('p').textContent = labels[active][1];
    captionMotion?.cancel();
    if (!reduced.matches) captionMotion = caption.animate(
      [{ opacity: .25, transform: 'translateY(7px)' }, { opacity: 1, transform: 'none' }],
      { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' }
    );
  }

  const stride = () => Math.min(230, innerHeight * .28);
  function update() {
    frame = 0;
    if (!desktop.matches) return;
    const distance = -section.getBoundingClientRect().top;
    if (distance < 0 || distance > stride() * last + 1) {
      previousStep = -1;
      return;
    }
    const step = Math.min(last, Math.floor(distance / stride() + .5));
    if (previousStep !== step) {
      previousStep = step;
      select(step);
    }
  }

  function move(direction) {
    select(active + direction);
    if (!desktop.matches) return;
    const top = section.getBoundingClientRect().top;
    if (top <= 1 && top >= -stride() * last - 1) {
      previousStep = active;
      window.scrollTo({ top: scrollY + top + active * stride(), behavior: 'instant' });
    }
  }

  function resize() {
    section.style.setProperty('--cult-run', stride() * last + 'px');
    previousStep = -1;
    update();
  }

  section.querySelectorAll('[data-cult-step]').forEach(button => {
    button.addEventListener('click', () => move(Number(button.dataset.cultStep)));
  });
  windowEl.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  windowEl.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touch = { id:event.pointerId, x:event.clientX, y:event.clientY };
  });
  windowEl.addEventListener('pointerup', event => {
    if (touch?.id !== event.pointerId) return;
    const dx = event.clientX - touch.x;
    const dy = event.clientY - touch.y;
    if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy) * 1.2) move(dx < 0 ? 1 : -1);
    touch = undefined;
  });
  windowEl.addEventListener('pointercancel', () => { touch = undefined; });
  window.addEventListener('scroll', () => {
    if (desktop.matches && !frame) frame = requestAnimationFrame(update);
  }, { passive:true });
  window.addEventListener('resize', resize, { passive:true });
  desktop.addEventListener('change', resize);
  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
    section.setAttribute('data-prepare', '');
    const reveal = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      section.setAttribute('data-visible', '');
      reveal.disconnect();
    }, { threshold:.06 });
    reveal.observe(section);
  }
  section.setAttribute('data-ready', '');
  resize();
})();
