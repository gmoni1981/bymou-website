import {mountCampaignFilms} from './campaign-films.js';

// Curate images into an editorial fashion & design publication rhythm
function groupIntoEditorialSpreads(images) {
  const spreads = [];
  let i = 0;

  // 1. Lead Opening Hero
  if (images.length > 0) {
    spreads.push({ type: 'lead', items: [images[0]], startIndex: 0 });
    i = 1;
  }

  while (i < images.length) {
    const cur = images[i];
    const next = images[i + 1];
    const next2 = images[i + 2];

    const isCurPortrait = cur.height > cur.width * 1.1;
    const isNextPortrait = next && (next.height > next.width * 1.1);
    const isNext2Portrait = next2 && (next2.height > next2.width * 1.1);

    // 3 portraits in a row -> Triptych
    if (cur && next && next2 && isCurPortrait && isNextPortrait && isNext2Portrait) {
      spreads.push({ type: 'triptych', items: [cur, next, next2], startIndex: i });
      i += 3;
    }
    // 2 portraits or 2 square-ish -> Side by Side Pair
    else if (next && isCurPortrait && isNextPortrait) {
      spreads.push({ type: 'pair', items: [cur, next], startIndex: i });
      i += 2;
    }
    // Portrait + Landscape or Landscape + Portrait -> Asymmetric pairing
    else if (next && (isCurPortrait !== isNextPortrait)) {
      spreads.push({ type: 'asymmetric', items: [cur, next], startIndex: i });
      i += 2;
    }
    // Strong landscape panorama
    else if (cur.width >= cur.height * 1.25) {
      spreads.push({ type: 'landscape', items: [cur], startIndex: i });
      i += 1;
    }
    // Solo portrait feature
    else if (isCurPortrait) {
      spreads.push({ type: 'portrait-solo', items: [cur], startIndex: i });
      i += 1;
    }
    // Fallback: Pair if 2 available, otherwise single
    else if (next) {
      spreads.push({ type: 'pair', items: [cur, next], startIndex: i });
      i += 2;
    } else {
      spreads.push({ type: 'lead', items: [cur], startIndex: i });
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
        <span class="project-room-num" data-room-number>01 / 04</span>
        <span class="project-room-divider" aria-hidden="true">·</span>
        <span class="project-room-category" data-room-category>Category</span>
      </div>
      <div class="project-bar-center">
        <span class="project-room-name" data-room-name>Project</span>
      </div>
      <div class="project-bar-right">
        <span class="project-room-counter" data-room-count aria-live="polite">01 / 01</span>
        <button type="button" class="project-room-close" aria-label="Close project window">×</button>
      </div>
    </header>

    <div class="project-filmstrip" aria-label="Project images index">
      <div class="project-filmstrip-track"></div>
    </div>

    <div class="project-room-scroll" tabindex="0">
      <header class="project-editorial-header">
        <div class="proj-header-meta">
          <span class="proj-kicker" data-meta-kicker></span>
          <span class="proj-year" data-meta-year>2026</span>
        </div>
        <h1 id="project-room-title" class="proj-main-title"></h1>
        <p class="proj-narrative" data-meta-intro></p>
        <div class="proj-tags" data-meta-tags></div>
      </header>

      <div class="project-films-slot"></div>

      <div class="project-room-sequence"></div>

      <footer class="project-room-footer">
        <div class="proj-footer-info">
          <span class="proj-footer-sign">BYMOU / MOU GRASSO</span>
          <p class="proj-footer-note">All images, direction and visual design © 2026 Mou Grasso.</p>
        </div>
        <button type="button" class="proj-return-btn" data-room-return>
          <span>Back to selected work</span>
          <span aria-hidden="true">↗</span>
        </button>
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
  const filmsSlot = dialog.querySelector('.project-films-slot');
  const closeButton = dialog.querySelector('.project-room-close');
  const filmstripTrack = dialog.querySelector('.project-filmstrip-track');
  const counter = dialog.querySelector('[data-room-count]');
  const returnBtn = dialog.querySelector('[data-room-return]');

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
  let savedScrollY = 0;
  let campaign = null;

  function close() {
    if (!dialog.open || closing) return;
    closing = true;
    animation?.kill();
    const finish = () => {
      dialog.close();
      // Restore scroll position cleanly without any page jump
      window.scrollTo({top: savedScrollY, behavior: 'instant'});
    };
    if (reduced.matches || !window.gsap) finish();
    else {
      animation = gsap.to(dialog, {
        opacity: 0,
        scale: 0.96,
        y: 16,
        duration: 0.28,
        ease: 'power3.in',
        onComplete: finish
      });
    }
  }

  // Backdrop click closes dialog (when clicking outside the window on the backdrop)
  dialog.addEventListener('click', e => {
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) close();
  });

  dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
  closeButton.addEventListener('click', close);
  returnBtn.addEventListener('click', close);

  dialog.addEventListener('close', () => {
    observer?.disconnect();
    campaign?.destroy();
    campaign = null;
    if (lightbox.open) lightbox.close();
    document.body.style.overflow = '';
    document.body.classList.remove('project-window-open');
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

  // Global arrow keys when window is focused
  dialog.addEventListener('keydown', e => {
    if (lightbox.open) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      const nextIdx = Math.min(totalImages - 1, currentImageIdx + 1);
      const target = sequence.querySelector(`figure[data-frame="${nextIdx + 1}"]`);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior: reduced.matches ? 'auto' : 'smooth', block: 'center'});
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      const prevIdx = Math.max(0, currentImageIdx - 1);
      const target = sequence.querySelector(`figure[data-frame="${prevIdx + 1}"]`);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior: reduced.matches ? 'auto' : 'smooth', block: 'center'});
      }
    }
  });

  return {
    get isOpen() { return dialog.open; },
    open(project, trigger) {
      if (dialog.open) return;
      currentProject = project;
      opener = trigger instanceof HTMLElement ? trigger : document.activeElement;
      closing = false;
      savedScrollY = window.scrollY;

      const lang = document.documentElement.lang || 'en';
      const words = {
        en: ['Project', 'Close window', 'Back to selected work', 'Explore film'],
        fr: ['Projet', 'Fermer la fenêtre', 'Retour aux projets', 'Voir le film'],
        it: ['Progetto', 'Chiudi finestra', 'Torna ai progetti', 'Guarda il film'],
        ar: ['المشروع', 'إغلاق النافذة', 'العودة إلى المشاريع', 'مشاهدة الفيلم']
      }[lang] || ['Project', 'Close window', 'Back to selected work', 'Explore film'];

      // Apply Individual Art Direction theme
      dialog.dataset.theme = project.theme || 'casa';

      // Bar information
      const projNum = project.number || '01';
      dialog.querySelector('[data-room-number]').textContent = `${projNum} / 04`;
      dialog.querySelector('[data-room-category]').textContent = project.category || project.title || 'Creative Direction';
      dialog.querySelector('[data-room-name]').textContent = project.name || project.title;
      closeButton.setAttribute('aria-label', words[1]);
      returnBtn.querySelector('span:first-child').textContent = words[2];

      // Editorial Intro Block
      dialog.querySelector('[data-meta-kicker]').textContent = (project.category || project.title || '').toUpperCase();
      dialog.querySelector('[data-meta-year]').textContent = project.year || '2026';
      dialog.querySelector('#project-room-title').textContent = project.name || project.title;
      dialog.querySelector('[data-meta-intro]').textContent = project.intro || (project.title + ' — A curated creative monograph by Mou Grasso.');

      // Deliverables Pills
      const tagsContainer = dialog.querySelector('[data-meta-tags]');
      tagsContainer.replaceChildren();
      const deliverables = project.deliverables || [project.title || 'Creative Direction'];
      deliverables.forEach(tag => {
        const pill = document.createElement('span');
        pill.className = 'proj-pill';
        pill.textContent = tag;
        tagsContainer.append(pill);
      });

      // Clear previous content
      sequence.replaceChildren();
      filmstripTrack.replaceChildren();
      filmsSlot.replaceChildren();

      // Mount Campaign Films if project has any
      campaign?.destroy();
      campaign = mountCampaignFilms(filmsSlot, project.slug, {root: scroll});

      totalImages = project.images.length;
      const totalStr = String(totalImages).padStart(2, '0');
      counter.textContent = `01 / ${totalStr}`;

      // Build Always-Visible Filmstrip Thumbnail Track
      project.images.forEach((im, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.type = 'button';
        thumbBtn.className = 'thumb-btn' + (idx === 0 ? ' is-active' : '');
        thumbBtn.setAttribute('aria-label', `Frame ${idx + 1}`);

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
          }
        });
        filmstripTrack.append(thumbBtn);
      });

      // Build Curated Magazine Spreads
      const spreads = groupIntoEditorialSpreads(project.images);

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
            loading: globalIdx < 4 ? 'eager' : 'lazy',
            decoding: 'async'
          });
          if (im.preview) img.srcset = `${im.preview} 640w, ${im.src} ${im.width}w`;
          img.sizes = spread.type === 'lead' || spread.type === 'landscape'
            ? '(max-width: 768px) 94vw, 1200px'
            : '(max-width: 768px) 94vw, 620px';

          const zoomHint = document.createElement('span');
          zoomHint.className = 'gallery-zoom-badge';
          zoomHint.setAttribute('aria-hidden', 'true');
          zoomHint.textContent = '⤢';

          imgWrap.append(img, zoomHint);

          // Click to expand in fullscreen lightbox
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

      // Prevent underlying page scrolling
      document.body.style.overflow = 'hidden';
      document.body.classList.add('project-window-open');
      document.dispatchEvent(new CustomEvent('bymou:vieweropen'));

      dialog.showModal();
      window.ByMouLocale?.localize(dialog);
      scroll.scrollTop = 0;
      closeButton.focus({preventScroll: true});

      // Active image tracking as user scrolls inside window
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const frameNum = Number(entry.target.dataset.frame);
            currentImageIdx = frameNum - 1;
            counter.textContent = `${String(frameNum).padStart(2, '0')} / ${totalStr}`;
            filmstripTrack.querySelectorAll('.thumb-btn').forEach((b, i) => {
              const isActive = (i === currentImageIdx);
              b.classList.toggle('is-active', isActive);
              if (isActive) {
                b.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
              }
            });
          }
        }
      }, {
        root: scroll,
        rootMargin: '-20% 0px -40% 0px',
        threshold: 0
      });

      sequence.querySelectorAll('figure[data-frame]').forEach(f => observer.observe(f));

      // Sophisticated entrance motion
      if (!reduced.matches && window.gsap) {
        animation = gsap.fromTo(dialog,
          {opacity: 0, scale: 0.95, y: 24},
          {opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out'}
        );
      } else {
        dialog.style.opacity = '1';
        dialog.style.transform = 'none';
      }
    }
  };
}
