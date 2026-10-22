const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function initViewer({ concepts = [], signaturePath = '' } = {}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const dialog = document.createElement('dialog');
  dialog.className = 'sample-viewer';
  dialog.id = 'sample-viewer';
  dialog.setAttribute('data-lenis-prevent', '');
  dialog.setAttribute('aria-label', 'Concept samples');
  dialog.setAttribute('aria-modal', 'true');
  dialog.innerHTML = `
    <div class="sv-shell">
      <header class="sv-header">
        <div class="sv-heading"><p class="sv-service"></p><h2 class="sv-title"></h2></div>
        <div class="sv-controls"><span class="sv-chip"></span><span class="sv-counter"><span class="sv-counter-visible" aria-hidden="true"></span><span class="sv-sr-only" aria-live="polite" aria-atomic="true"></span></span><button class="sv-close" type="button" aria-label="Close sample viewer"><span aria-hidden="true">×</span></button></div>
      </header>
      <button class="sv-previous" type="button" aria-label="Previous sample">←</button>
      <div class="sv-strip" tabindex="0" aria-label="Concept sample images"></div>
      <button class="sv-next" type="button" aria-label="Next sample">→</button>
      <div class="sv-progress" role="progressbar" aria-label="Sample progress" aria-valuemin="1" aria-valuemax="1" aria-valuenow="1"><span class="sv-progress-fill"></span></div>
      <div class="sv-signature" aria-hidden="true"></div>
      <div class="sv-cursor" aria-hidden="true"></div>
      <div class="sv-expanded" aria-hidden="true"><img alt=""><p class="sv-expanded-message"></p></div>
    </div>`;
  document.body.append(dialog);

  const shell = dialog.querySelector('.sv-shell');
  const strip = dialog.querySelector('.sv-strip');
  const previousButton = dialog.querySelector('.sv-previous');
  const nextButton = dialog.querySelector('.sv-next');
  const progress = dialog.querySelector('.sv-progress');
  const progressFill = dialog.querySelector('.sv-progress-fill');
  const title = dialog.querySelector('.sv-title');
  const service = dialog.querySelector('.sv-service');
  const chip = dialog.querySelector('.sv-chip');
  const counterVisible = dialog.querySelector('.sv-counter-visible');
  const counterLive = dialog.querySelector('.sv-sr-only');
  const closeButton = dialog.querySelector('.sv-close');
  const signature = dialog.querySelector('.sv-signature');
  const cursor = dialog.querySelector('.sv-cursor');
  const expanded = dialog.querySelector('.sv-expanded');
  const expandedImg = expanded.querySelector('img');
  const expandedMessage = expanded.querySelector('.sv-expanded-message');
  let concept = null;
  let opener = null;
  let sampleIndex = 0;
  let raf = 0;
  let open = false;
  let dragging = false;
  let pointerDown = null;
  let moved = false;
  let pointer = { x: -100, y: -100 };
  let closeOffset = { x: 0, y: 0 };
  let scrollRaf = 0;
  let cursorPosition = { x: -100, y: -100 };
  let collapseTimer = 0;

  function currentSamples() { return concept?.samples || []; }
  function announce(index) {
    const samples = currentSamples();
    sampleIndex = clamp(index, 0, Math.max(0, samples.length - 1));
    counterVisible.textContent = `${String(sampleIndex + 1).padStart(2, '0')}/${String(samples.length).padStart(2, '0')}`;
    counterLive.textContent = `${concept?.chip || 'Self-initiated concept study'}. Sample ${sampleIndex + 1} of ${samples.length}, ${concept?.title || ''}`;
    const max = Math.max(1, samples.length);
    progress.setAttribute('aria-valuemax', String(max));
    progress.setAttribute('aria-valuenow', String(Math.min(max, sampleIndex + 1)));
    progressFill.style.transform = `scaleX(${max > 1 ? sampleIndex / (max - 1) : 1})`;
    previousButton.disabled = sampleIndex <= 0;
    nextButton.disabled = sampleIndex >= samples.length - 1;
  }
  function nearestSample() {
    const mid = strip.scrollLeft + strip.clientWidth / 2;
    const frames = [...strip.querySelectorAll('.sv-frame')];
    let best = 0, distance = Infinity;
    frames.forEach((frame, index) => {
      const center = frame.offsetLeft + frame.offsetWidth / 2;
      const d = Math.abs(center - mid);
      if (d < distance) { distance = d; best = index; }
    });
    announce(best);
  }
  function loadSignature() {
    signature.replaceChildren();
    if (!signaturePath) return;
    const draw = pathData => {
      if (!pathData || !open) return;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 600 180');
      svg.setAttribute('focusable', 'false');
      const path = document.createElementNS(svg.namespaceURI, 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('pathLength', '1');
      path.classList.add('sv-signature-path');
      svg.append(path);
      signature.append(svg);
      if (!reduced.matches && finePointer.matches) requestAnimationFrame(() => path.classList.add('sv-draw'));
      else path.classList.add('sv-static');
    };
    if (/^[Mm]/.test(signaturePath.trim())) { draw(signaturePath); return; }
    fetch(signaturePath).then(response => response.ok ? response.text() : '').then(markup => {
      const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
      draw(doc.querySelector('path')?.getAttribute('d'));
    }).catch(() => {});
  }
  function setExpanded(index) {
    const samples = currentSamples();
    const next = samples[index];
    if (!next) return;
    clearTimeout(collapseTimer);
    if (next.available === false || !next.src) {
      expandedImg.removeAttribute('src');
      expandedImg.alt = next.description || next.alt || next.title || 'This concept sample is not available.';
      expandedMessage.textContent = expandedImg.alt;
      expanded.classList.add('is-unavailable');
    } else {
      expanded.classList.remove('is-unavailable');
      expandedMessage.textContent = '';
      expandedImg.src = next.src;
      expandedImg.alt = next.alt || next.title || `Sample ${index + 1}`;
    }
    expanded.setAttribute('aria-label', `Expanded ${expandedImg.alt}`);
    expanded.classList.add('is-expanded');
    expanded.setAttribute('aria-hidden', 'false');
    expanded.dataset.sourceIndex = String(index);
  }
  function collapse() {
    expanded.classList.remove('is-expanded');
    expanded.setAttribute('aria-hidden', 'true');
    const clearImage = () => {
      if (!expanded.classList.contains('is-expanded')) {
        expandedImg.removeAttribute('src');
        expandedImg.alt = '';
        expandedMessage.textContent = '';
        expanded.classList.remove('is-unavailable');
      }
    };
    clearTimeout(collapseTimer);
    if (reduced.matches) clearImage();
    else {
      expanded.addEventListener('transitionend', event => {
        if (event.target === expanded && event.propertyName === 'clip-path') clearImage();
      }, { once: true });
      collapseTimer = setTimeout(clearImage, 450);
    }
  }
  function close() {
    if (!dialog.open) return;
    dialog.close();
  }
  function closeNow() {
    open = false;
    cancelAnimationFrame(raf); raf = 0;
    collapse();
    dialog.dispatchEvent(new CustomEvent('bymou:viewerclose', { bubbles: true }));
    opener?.focus?.({ preventScroll: true });
    opener?.setAttribute?.('aria-expanded', 'false');
    opener = null;
  }
  function openViewer(conceptId, trigger, startIndex = 0) {
    concept = concepts.find(item => item.id === conceptId);
    if (!concept) return;
    opener = trigger instanceof HTMLElement ? trigger : document.activeElement;
    opener?.setAttribute?.('aria-controls', 'sample-viewer');
    title.textContent = concept.title || '';
    service.textContent = concept.service || '';
    chip.textContent = concept.chip || '';
    strip.replaceChildren();
    (concept.samples || []).forEach((sample, index) => {
      const frame = document.createElement('button');
      frame.type = 'button';
      frame.className = 'sv-frame';
      frame.setAttribute('aria-label', `Expand sample ${index + 1} of ${concept.samples.length}: ${sample.alt || sample.title || concept.title}`);
      let img;
      if (sample.available === false || !sample.src) {
        img = document.createElement('span');
        img.className = 'sv-image-missing';
        img.textContent = sample.description || sample.alt || sample.title || 'This concept sample is not available.';
        img.setAttribute('role', 'img');
      } else {
        img = document.createElement('img');
        img.src = sample.src;
        img.alt = sample.alt || sample.title || `${concept.title}, sample ${index + 1}`;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', () => {
          const message = document.createElement('span');
          message.className = 'sv-image-missing';
          message.setAttribute('role', 'img');
          message.textContent = sample.description || sample.alt || sample.title || 'This concept sample could not be loaded.';
          img.replaceWith(message);
          frame.dataset.missing = 'true';
        }, { once: true });
      }
      const caption = document.createElement('span');
      caption.className = 'sv-caption';
      caption.textContent = sample.title || `Sample ${index + 1}`;
      frame.append(img, caption);
      strip.append(frame);
    });
    announce(startIndex);
    opener?.setAttribute?.('aria-expanded', 'true');
    expanded.classList.remove('is-expanded');
    dialog.showModal();
    open = true;
    dialog.dispatchEvent(new CustomEvent('bymou:vieweropen', { bubbles: true }));
    loadSignature();
    requestAnimationFrame(() => {
      const frame = strip.children[sampleIndex];
      frame?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced.matches ? 'auto' : 'smooth' });
      closeButton.focus({ preventScroll: true });
    });
    runLoop();
  }
  function runLoop() {
    if (!open || !finePointer.matches || reduced.matches) { raf = 0; return; }
    const frames = strip.querySelectorAll('.sv-frame');
    const rect = dialog.getBoundingClientRect();
    cursorPosition.x += (pointer.x - cursorPosition.x) * .22;
    cursorPosition.y += (pointer.y - cursorPosition.y) * .22;
    cursor.style.transform = `translate3d(${cursorPosition.x}px,${cursorPosition.y}px,0)`;
    cursor.classList.toggle('is-visible', pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= rect.bottom && !dragging);
    const closeRect = closeButton.getBoundingClientRect();
    const cx = closeRect.left + closeRect.width / 2, cy = closeRect.top + closeRect.height / 2;
    const distance = Math.hypot(pointer.x - cx, pointer.y - cy);
    const near = distance < 60 && !dragging;
    closeOffset = near ? { x: clamp((pointer.x - cx) * .07, -4, 4), y: clamp((pointer.y - cy) * .07, -4, 4) } : { x: 0, y: 0 };
    closeButton.style.setProperty('--sv-mx', `${closeOffset.x}px`);
    closeButton.style.setProperty('--sv-my', `${closeOffset.y}px`);
    closeButton.classList.toggle('is-magnetic', near);
    frames.forEach(frame => {
      const r = frame.getBoundingClientRect();
      const nx = clamp((pointer.x - (r.left + r.width / 2)) / Math.max(1, r.width / 2), -1, 1);
      const ny = clamp((pointer.y - (r.top + r.height / 2)) / Math.max(1, r.height / 2), -1, 1);
      const inside = pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom;
      frame.style.setProperty('--sv-tilt-x', inside && !dragging ? `${-ny * 6}deg` : '0deg');
      frame.style.setProperty('--sv-tilt-y', inside && !dragging ? `${nx * 6}deg` : '0deg');
      frame.style.setProperty('--sv-lift', inside && !dragging ? '-5px' : '0px');
    });
    raf = requestAnimationFrame(runLoop);
  }
  dialog.addEventListener('close', closeNow);
  dialog.addEventListener('cancel', event => {
    if (expanded.classList.contains('is-expanded')) { event.preventDefault(); collapse(); }
  });
  closeButton.addEventListener('click', close);
  expanded.addEventListener('click', collapse);
  strip.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; nearestSample(); });
  }, { passive: true });
  function navigate(direction) {
    const samples = currentSamples();
    if (!samples.length) return;
    const index = clamp(sampleIndex + direction, 0, samples.length - 1);
    strip.children[index]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced.matches ? 'auto' : 'smooth' });
    announce(index);
  }
  previousButton.addEventListener('click', () => navigate(-1));
  nextButton.addEventListener('click', () => navigate(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape' && expanded.classList.contains('is-expanded')) { event.preventDefault(); collapse(); return; }
    const target = event.target instanceof Element ? event.target : null;
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !target?.closest('input, textarea, select, [contenteditable="true"]') && !target?.isContentEditable) {
      event.preventDefault();
      navigate(event.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not([disabled]), [tabindex="0"]')].filter(el => !el.hidden && el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  dialog.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      strip.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  }, { passive: false });
  dialog.addEventListener('pointermove', event => {
    pointer = { x: event.clientX, y: event.clientY };
    if (pointerDown && event.pointerId === pointerDown.id && Math.abs(event.clientX - pointerDown.x) > 5) {
      moved = true;
      dragging = true;
      strip.scrollLeft = pointerDown.scroll + pointerDown.x - event.clientX;
    }
  });
  dialog.addEventListener('pointerdown', event => {
    const frame = event.target.closest('.sv-frame');
    if (frame && finePointer.matches && event.button === 0) {
      pointerDown = { id: event.pointerId, x: event.clientX, scroll: strip.scrollLeft, frame };
      frame.setPointerCapture?.(event.pointerId);
      moved = false;
    }
  });
  dialog.addEventListener('pointerup', event => {
    if (!pointerDown || event.pointerId !== pointerDown.id) return;
    if (moved) {
      const frame = pointerDown.frame;
      if (frame) frame.dataset.dragged = 'true';
      setTimeout(() => { frame?.removeAttribute('data-dragged'); }, 0);
    }
    pointerDown = null;
    dragging = false;
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) { close(); return; }
    const frame = event.target.closest('.sv-frame');
    if (frame && frame.dataset.dragged !== 'true') setExpanded([...strip.children].indexOf(frame));
  });
  finePointer.addEventListener?.('change', runLoop);

  return { open: openViewer, close, element: dialog };
}
