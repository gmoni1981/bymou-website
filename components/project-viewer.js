import {mountCampaignFilms} from './campaign-films.js';

// Curate images into an editorial fashion/design magazine spread rhythm while strictly preserving order
function groupIntoSpreads(images) {
  const spreads = [];
  let i = 0;

  // First image is always the Lead Opening Feature
  if (images.length > 0) {
    spreads.push({ type: 'lead', items: [images[0]], startIndex: 0 });
    i = 1;
  }

  while (i < images.length) {
    const cur = images[i];
    const isCurPortrait = cur.height > cur.width;
    const next = images[i + 1];
    const isNextPortrait = next ? (next.height > next.width) : false;
    const third = images[i + 2];
    const isThirdPortrait = third ? (third.height > third.width) : false;

    // 3 consecutive portraits -> Triptych rhythm
    if (next && third && isCurPortrait && isNextPortrait && isThirdPortrait && (i % 4 === 1)) {
      spreads.push({ type: 'triptych', items: [cur, next, third], startIndex: i });
      i += 3;
    }
    // 2 consecutive portraits -> Classic Diptyque (pair)
    else if (next && isCurPortrait && isNextPortrait) {
      spreads.push({ type: 'pair', items: [cur, next], startIndex: i });
      i += 2;
    }
    // Portrait + Landscape or Landscape + Portrait -> Dynamic Asymmetric Pairing
    else if (next && (isCurPortrait !== isNextPortrait)) {
      spreads.push({ type: 'asymmetric', items: [cur, next], startIndex: i });
      i += 2;
    }
    // Solo Landscape Panorama
    else if (!isCurPortrait) {
      spreads.push({ type: 'landscape', items: [cur], startIndex: i });
      i += 1;
    }
    // Solo Portrait Focus
    else {
      spreads.push({ type: 'portrait-solo', items: [cur], startIndex: i });
      i += 1;
    }
  }
  return spreads;
}

export function createProjectViewer({reduced}) {
  const dialog = document.createElement('dialog');
  dialog.className = 'project-room';
  dialog.setAttribute('aria-labelledby', 'project-room-title');
  dialog.dataset.lenisPrevent = '';

  dialog.innerHTML = `
    <header class="project-room-bar">
      <div class="project-bar-left">
        <span class="project-room-num" data-room-number></span>
        <span class="project-room-divider" aria-hidden="true">/</span>
        <h2 id="project-room-title" class="project-bar-title"></h2>
      </div>
      <div class="project-bar-center">
        <span class="project-room-counter" data-room-count aria-live="polite">01 / 01</span>
        <button type="button" class="project-thumbs-toggle" aria-expanded="false" data-thumbs-btn>
          <span class="thumbs-icon" aria-hidden="true">▦</span>
          <span data-thumbs-label>Thumbnails</span>
        </button>
      </div>
      <div class="project-bar-right">
        <div class="project-bar-arrows" aria-label="Navigate images">
          <button type="button" class="project-bar-prev" aria-label="Previous frame">←</button>
          <button type="button" class="project-bar-next" aria-label="Next frame">→</button>
        </div>
        <button type="button" class="project-room-close" aria-label="Close gallery">×</button>
      </div>
    </header>
    <div class="project-thumbs-drawer" hidden aria-label="Image thumbnail index">
      <div class="project-thumbs-track"></div>
    </div>
    <div class="project-room-scroll" tabindex="0">
      <div class="project-room-intro">
        <p class="project-intro-kicker" data-room-label></p>
        <div class="project-intro-title-wrap">
          <span class="project-intro-statement" data-room-heading></span>
          <span class="project-intro-instruction" data-room-instruction></span>
        </div>
      </div>
      <div class="project-room-sequence"></div>
      <footer class="project-room-end">
        <button type="button" data-room-return>Back to selected work ↗</button>
      </footer>
    </div>
    <dialog class="project-lightbox" aria-label="Fullscreen image inspection" data-lenis-prevent>
      <div class="lightbox-bar">
        <span class="lightbox-index"></span>
        <span class="lightbox-caption"></span>
        <button type="button" class="lightbox-close" aria-label="Close fullscreen">×</button>
      </div>
      <div class="lightbox-stage">
        <button type="button" class="lightbox-nav-prev" aria-label="Previous image">‹</button>
        <div class="lightbox-image-wrap">
          <img class="lightbox-image" src="" alt="">
        </div>
        <button type="button" class="lightbox-nav-next" aria-label="Next image">›</button>
      </div>
    </dialog>
  `;

  document.body.append(dialog);

  const scroll = dialog.querySelector('.project-room-scroll');
  const sequence = dialog.querySelector('.project-room-sequence');
  const closeButton = dialog.querySelector('.project-room-close');
  const thumbsToggle = dialog.querySelector('[data-thumbs-btn]');
  const thumbsDrawer = dialog.querySelector('.project-thumbs-drawer');
  const thumbsTrack = dialog.querySelector('.project-thumbs-track');
  const barPrev = dialog.querySelector('.project-bar-prev');
  const barNext = dialog.querySelector('.project-bar-next');
  const counter = dialog.querySelector('[data-room-count]');

  // Lightbox elements
  const lightbox = dialog.querySelector('.project-lightbox');
  const lbImg = lightbox.querySelector('.lightbox-image');
  const lbIndex = lightbox.querySelector('.lightbox-index');
  const lbCaption = lightbox.querySelector('.lightbox-caption');
  const lbClose = lightbox.querySelector('.lightbox-close');
  const lbPrev = lightbox.querySelector('.lightbox-nav-prev');
  const lbNext = lightbox.querySelector('.lightbox-nav-next');

  let currentProject = null;
  let currentImageIdx = 0;
  let totalImages = 0;
  let opener = null;
  let observer = null;
  let animation = null;
  let closing = false;
  let overflow = '';
  let campaign = null;

  function close() {
    if (!dialog.open || closing) return;
    closing = true;
    animation?.kill();
    const finish = () => dialog.close();
    if (reduced.matches || !window.gsap) finish();
    else animation = gsap.to(dialog, {opacity: 0, y: 20, duration: 0.3, ease: 'power2.in', onComplete: finish});
  }

  dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
  closeButton.addEventListener('click', close);
  dialog.querySelector('[data-room-return]').addEventListener('click', close);

  dialog.addEventListener('close', () => {
    observer?.disconnect();
    campaign?.destroy();
    campaign = null;
    thumbsDrawer.hidden = true;
    thumbsToggle.setAttribute('aria-expanded', 'false');
    if (lightbox.open) lightbox.close();
    document.body.style.overflow = overflow;
    document.dispatchEvent(new CustomEvent('bymou:viewerclose'));
    opener?.focus({preventScroll: true});
    closing = false;
  });

  // Lightbox handlers
  function openLightbox(index) {
    if (!currentProject || !currentProject.images[index]) return;
    currentImageIdx = index;
    const im = currentProject.images[index];
    lbImg.src = im.src;
    lbImg.alt = im.alt || '';
    lbIndex.textContent = `${String(index + 1).padStart(2, '0')} / ${String(totalImages).padStart(2, '0')}`;
    lbCaption.textContent = im.alt || currentProject.title || '';
    if (!lightbox.open) lightbox.showModal();
    lbClose.focus({preventScroll: true});
  }

  function nextLightbox() {
    if (totalImages <= 1) return;
    const next = (currentImageIdx + 1) % totalImages;
    openLightbox(next);
  }

  function prevLightbox() {
    if (totalImages <= 1) return;
    const prev = (currentImageIdx - 1 + totalImages) % totalImages;
    openLightbox(prev);
  }

  lbClose.addEventListener('click', () => lightbox.close());
  lbNext.addEventListener('click', nextLightbox);
  lbPrev.addEventListener('click', prevLightbox);
  lightbox.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); nextLightbox(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prevLightbox(); }
  });

  // Thumbnails toggle
  thumbsToggle.addEventListener('click', () => {
    const isHidden = thumbsDrawer.hidden;
    thumbsDrawer.hidden = !isHidden;
    thumbsToggle.setAttribute('aria-expanded', String(isHidden));
  });

  // Previous / Next buttons in top bar (scroll by image)
  barPrev.addEventListener('click', () => {
    const figures = sequence.querySelectorAll('figure[data-frame]');
    if (!figures.length) return;
    const targetIdx = Math.max(0, currentImageIdx - 1);
    const targetFig = sequence.querySelector(`figure[data-frame="${targetIdx + 1}"]`);
    if (targetFig) targetFig.scrollIntoView({behavior: reduced.matches ? 'auto' : 'smooth', block: 'center'});
  });

  barNext.addEventListener('click', () => {
    const figures = sequence.querySelectorAll('figure[data-frame]');
    if (!figures.length) return;
    const targetIdx = Math.min(totalImages - 1, currentImageIdx + 1);
    const targetFig = sequence.querySelector(`figure[data-frame="${targetIdx + 1}"]`);
    if (targetFig) targetFig.scrollIntoView({behavior: reduced.matches ? 'auto' : 'smooth', block: 'center'});
  });

  return {
    get isOpen() { return dialog.open; },
    open(project, trigger) {
      if (dialog.open) return;
      currentProject = project;
      opener = trigger instanceof HTMLElement ? trigger : document.activeElement;
      closing = false;

      const lang = document.documentElement.lang || 'en';
      const words = {
        en: ['Project', 'Curated visual study', 'Explore the monograph', 'Close gallery', 'Back to selected work ↗', 'Thumbnails'],
        fr: ['Projet', 'Étude visuelle choisie', 'Découvrir la monographie', 'Fermer la galerie', 'Retour aux projets ↗', 'Miniatures'],
        it: ['Progetto', 'Studio visivo selezionato', 'Esplora la monografia', 'Chiudi galleria', 'Torna ai progetti ↗', 'Miniature'],
        ar: ['المشروع', 'دراسة بصرية مختارة', 'استكشف الملف', 'إغلاق المعرض', 'العودة إلى الأعمال المختارة ↗', 'الصور المصغرة']
      }[lang] || ['Project', 'Curated visual study', 'Explore the monograph', 'Close gallery', 'Back to selected work ↗', 'Thumbnails'];

      dialog.querySelector('[data-room-number]').textContent = `${words[0]} ${String(project.number || 1).padStart(2, '0')}`;
      dialog.querySelector('#project-room-title').textContent = project.title || project.name;
      dialog.querySelector('[data-room-label]').textContent = words[1];
      dialog.querySelector('[data-room-heading]').textContent = project.title || project.name;
      dialog.querySelector('[data-room-instruction]').textContent = words[2] + ' ↓';
      dialog.querySelector('[data-thumbs-label]').textContent = words[5];
      closeButton.setAttribute('aria-label', words[3]);
      dialog.querySelector('[data-room-return]').textContent = words[4];

      sequence.replaceChildren();
      thumbsTrack.replaceChildren();

      // Mount campaign films (with missing slots hidden)
      campaign = mountCampaignFilms(sequence, project.slug, {root: scroll});

      totalImages = project.images.length;
      const totalStr = String(totalImages).padStart(2, '0');
      counter.textContent = `01 / ${totalStr}`;

      // Build thumbnail strip
      project.images.forEach((im, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.type = 'button';
        thumbBtn.className = 'thumb-btn';
        thumbBtn.dataset.index = idx;
        thumbBtn.setAttribute('aria-label', `Jump to image ${idx + 1}`);

        const thumbImg = document.createElement('img');
        thumbImg.src = im.preview || im.src;
        thumbImg.alt = '';
        thumbImg.loading = 'lazy';

        const thumbNum = document.createElement('span');
        thumbNum.className = 'thumb-num';
        thumbNum.textContent = String(idx + 1).padStart(2, '0');

        thumbBtn.append(thumbImg, thumbNum);
        thumbBtn.addEventListener('click', () => {
          const targetFig = sequence.querySelector(`figure[data-frame="${idx + 1}"]`);
          if (targetFig) {
            targetFig.scrollIntoView({behavior: reduced.matches ? 'auto' : 'smooth', block: 'center'});
            thumbsDrawer.hidden = true;
            thumbsToggle.setAttribute('aria-expanded', 'false');
          }
        });
        thumbsTrack.append(thumbBtn);
      });

      // Build Curated Magazine Spreads
      const spreads = groupIntoSpreads(project.images);

      spreads.forEach(spread => {
        const spreadEl = document.createElement('div');
        spreadEl.className = `editorial-spread spread-${spread.type}`;

        spread.items.forEach((im, subIdx) => {
          const globalIdx = spread.startIndex + subIdx;
          const figure = document.createElement('figure');
          figure.className = 'gallery-figure';
          figure.dataset.frame = globalIdx + 1;

          const imgWrap = document.createElement('div');
          imgWrap.className = 'gallery-img-wrap';

          const img = document.createElement('img');
          Object.assign(img, {
            src: im.src,
            alt: im.alt || '',
            width: im.width,
            height: im.height,
            loading: globalIdx < 3 ? 'eager' : 'lazy',
            decoding: 'async'
          });
          if (im.preview) img.srcset = `${im.preview} 640w, ${im.src} ${im.width}w`;
          img.sizes = spread.type === 'lead' || spread.type === 'landscape'
            ? '(max-width: 768px) 94vw, 1120px'
            : '(max-width: 768px) 94vw, 560px';

          const zoomHint = document.createElement('span');
          zoomHint.className = 'gallery-zoom-badge';
          zoomHint.setAttribute('aria-hidden', 'true');
          zoomHint.textContent = '⤢';

          imgWrap.append(img, zoomHint);

          // Click image to explore fullscreen in Lightbox
          imgWrap.addEventListener('click', () => openLightbox(globalIdx));

          const caption = document.createElement('figcaption');
          caption.className = 'gallery-caption';

          const n = document.createElement('span');
          n.className = 'caption-num';
          n.textContent = `${String(globalIdx + 1).padStart(2, '0')} / ${totalStr}`;

          const text = document.createElement('span');
          text.className = 'caption-text';
          text.textContent = im.alt || '';

          caption.append(n, text);
          figure.append(imgWrap, caption);
          spreadEl.append(figure);
        });

        sequence.append(spreadEl);
      });

      overflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.dispatchEvent(new CustomEvent('bymou:vieweropen'));

      dialog.style.opacity = '1';
      dialog.style.transform = 'none';
      dialog.showModal();
      window.ByMouLocale?.localize(dialog);
      scroll.scrollTop = 0;
      closeButton.focus({preventScroll: true});

      // Update counter as visitor scrolls through frames
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const frameNum = Number(entry.target.dataset.frame);
            currentImageIdx = frameNum - 1;
            counter.textContent = `${String(frameNum).padStart(2, '0')} / ${totalStr}`;
            // Mark active thumb
            thumbsTrack.querySelectorAll('.thumb-btn').forEach((b, i) => {
              b.classList.toggle('is-active', i === currentImageIdx);
            });
          }
        }
      }, {
        root: scroll,
        rootMargin: '-20% 0px -40% 0px',
        threshold: 0
      });

      sequence.querySelectorAll('figure[data-frame]').forEach(f => observer.observe(f));

      if (!reduced.matches && window.gsap) {
        animation = gsap.fromTo(dialog,
          {clipPath: 'inset(8% 5% 8% 5%)', opacity: 0},
          {clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.5, ease: 'power3.inOut'}
        );
      } else {
        dialog.style.clipPath = 'none';
      }
    }
  };
}
