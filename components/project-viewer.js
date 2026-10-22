import {campaignFilms} from '../data/campaign-films.js';

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
        <span class="project-room-counter" data-room-count aria-live="polite">01–06 / 21</span>
        <button type="button" class="project-room-close" aria-label="Close project window">×</button>
      </div>
    </header>

    <div class="project-room-scroll" tabindex="0">
      <header class="project-editorial-header">
        <div class="proj-header-main">
          <div class="proj-header-meta">
            <span class="proj-kicker" data-meta-kicker></span>
            <span class="proj-year" data-meta-year>2026</span>
          </div>
          <div class="proj-brand-logo-slot" data-brand-logo-slot></div>
          <h1 id="project-room-title" class="proj-main-title"></h1>
          <p class="proj-narrative" data-meta-intro></p>
          <div class="proj-tags" data-meta-tags></div>
        </div>

        <nav class="proj-jump-nav" data-jump-nav aria-label="Project sections navigation">
          <button type="button" class="jump-pill is-active" data-jump-target="stills">
            <span data-label-stills>Visual Studies</span>
            <span class="jump-badge" data-stills-count></span>
          </button>
          <button type="button" class="jump-pill" data-jump-target="films" data-jump-films hidden>
            <span data-label-films>Campaign Films</span>
            <span class="jump-badge" data-films-count></span>
          </button>
        </nav>
      </header>

      <!-- Section 1: Visual Studies (Stills Contact Sheet) -->
      <section class="proj-section" id="section-stills" data-section="stills">
        <div class="proj-section-header">
          <div class="proj-section-title-wrap">
            <span class="proj-section-kicker">01 / Photographic Studies</span>
            <h2 class="proj-section-title">Visual Studies</h2>
          </div>
          <span class="proj-section-meta" data-stills-meta>3-Column Contact Sheet · Click to inspect</span>
        </div>

        <div class="project-grid" data-images-grid></div>

        <nav class="project-pagination" data-pagination aria-label="Project images pagination">
          <button type="button" class="page-arrow prev" data-page-prev aria-label="Previous page">←</button>
          <div class="page-numbers" data-page-numbers></div>
          <button type="button" class="page-arrow next" data-page-next aria-label="Next page">→</button>
        </nav>
      </section>

      <!-- Section 2: Campaign Films (Compact & Editorial) -->
      <section class="proj-section" id="section-films" data-section="films" hidden>
        <div class="proj-section-header">
          <div class="proj-section-title-wrap">
            <span class="proj-section-kicker">02 / Motion & Commercial Direction</span>
            <h2 class="proj-section-title">Campaign Films</h2>
          </div>
          <span class="proj-section-meta">Compact editorial motion · Click to open cinematic player</span>
        </div>

        <div class="project-films-slot" data-films-slot></div>
      </section>

      <footer class="project-room-footer">
        <span class="proj-footer-sign">BYMOU / MOU GRASSO</span>
        <button type="button" class="proj-return-btn" data-room-return>
          <span>Back to selected work</span>
          <span aria-hidden="true">↗</span>
        </button>
      </footer>
    </div>

    <!-- Fullscreen Lightbox Zoom Modal (Only the lightbox shows large images) -->
    <dialog class="project-lightbox" aria-label="Fullscreen image inspection" data-lenis-prevent>
      <div class="lightbox-bar">
        <span class="lightbox-index" data-lb-index>01 / 21</span>
        <span class="lightbox-caption" data-lb-caption></span>
        <button type="button" class="lightbox-close" data-lb-close aria-label="Close fullscreen">×</button>
      </div>
      <div class="lightbox-stage">
        <button type="button" class="lightbox-nav-prev" data-lb-prev aria-label="Previous image">‹</button>
        <div class="lightbox-image-wrap">
          <img class="lightbox-image" data-lb-img src="" alt="">
        </div>
        <button type="button" class="lightbox-nav-next" data-lb-next aria-label="Next image">›</button>
      </div>
    </dialog>

    <!-- Luxury Cinematic Video Player Modal -->
    <dialog class="campaign-player" data-film-player data-lenis-prevent aria-label="Cinematic Film Player">
      <div class="campaign-player-top">
        <div class="campaign-player-info">
          <span class="player-kicker">BYMOU · MOTION DIRECTION</span>
          <span class="player-title" data-player-title>Film Title</span>
        </div>
        <button type="button" class="player-close-btn" data-film-player-close aria-label="Close cinematic player">Close ×</button>
      </div>
      <div class="campaign-player-screen">
        <video playsinline preload="none"></video>
        <p role="status" hidden></p>
      </div>
      <div class="campaign-player-tools">
        <button type="button" data-film-toggle>Pause</button>
        <button type="button" data-film-sound>Sound on</button>
        <span class="player-time" data-film-time>00:00</span>
        <button type="button" data-film-full>Fullscreen ↗</button>
      </div>
    </dialog>
  `;

  document.body.append(dialog);

  const scroll = dialog.querySelector('.project-room-scroll');
  const closeButton = dialog.querySelector('.project-room-close');
  const returnBtn = dialog.querySelector('[data-room-return]');
  const counter = dialog.querySelector('[data-room-count]');
  const imagesGrid = dialog.querySelector('[data-images-grid]');
  const paginationNav = dialog.querySelector('[data-pagination]');
  const pagePrev = dialog.querySelector('[data-page-prev]');
  const pageNext = dialog.querySelector('[data-page-next]');
  const pageNumbers = dialog.querySelector('[data-page-numbers]');
  const filmsSection = dialog.querySelector('#section-films');
  const filmsSlot = dialog.querySelector('[data-films-slot]');
  const jumpFilmsBtn = dialog.querySelector('[data-jump-films]');
  const jumpPills = dialog.querySelectorAll('.jump-pill');

  // Lightbox elements
  const lightbox = dialog.querySelector('.project-lightbox');
  const lbImg = dialog.querySelector('[data-lb-img]');
  const lbIndex = dialog.querySelector('[data-lb-index]');
  const lbCaption = dialog.querySelector('[data-lb-caption]');
  const lbClose = dialog.querySelector('[data-lb-close]');
  const lbPrev = dialog.querySelector('[data-lb-prev]');
  const lbNext = dialog.querySelector('[data-lb-next]');

  // Film player elements
  const filmPlayer = dialog.querySelector('[data-film-player]');
  const playerVideo = filmPlayer.querySelector('video');
  const playerTitle = filmPlayer.querySelector('[data-player-title]');
  const playerClose = filmPlayer.querySelector('[data-film-player-close]');
  const playerToggle = filmPlayer.querySelector('[data-film-toggle]');
  const playerSound = filmPlayer.querySelector('[data-film-sound]');
  const playerFull = filmPlayer.querySelector('[data-film-full]');
  const playerTime = filmPlayer.querySelector('[data-film-time]');

  const IMAGES_PER_PAGE = 6;
  let currentProject = null;
  let currentImages = [];
  let currentFilms = [];
  let currentPage = 0;
  let totalPages = 1;
  let currentLightboxIdx = 0;
  let opener = null;
  let closing = false;
  let animation = null;
  let savedScrollY = 0;

  function close() {
    if (!dialog.open || closing) return;
    closing = true;
    animation?.kill();

    if (lightbox.open) lightbox.close();
    closeFilmPlayer();

    const finish = () => {
      dialog.close();
      window.scrollTo({ top: savedScrollY, behavior: 'instant' });
    };

    if (reduced.matches || !window.gsap) {
      finish();
    } else {
      animation = gsap.to(dialog, {
        opacity: 0,
        scale: 0.96,
        y: 16,
        duration: 0.26,
        ease: 'power2.in',
        onComplete: finish
      });
    }
  }

  // Backdrop click on floating dialog window
  dialog.addEventListener('click', e => {
    if (e.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) close();
    }
  });

  dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
  closeButton.addEventListener('click', close);
  returnBtn.addEventListener('click', close);

  dialog.addEventListener('close', () => {
    playerVideo.pause();
    playerVideo.removeAttribute('src');
    playerVideo.load();
    document.body.style.overflow = '';
    document.body.classList.remove('project-window-open');
    document.dispatchEvent(new CustomEvent('bymou:viewerclose'));
    opener?.focus({preventScroll: true});
    closing = false;
  });

  // Jump navigation between sections
  jumpPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const target = pill.dataset.jumpTarget;
      jumpPills.forEach(p => p.classList.toggle('is-active', p === pill));
      const sectionEl = target === 'films' ? filmsSection : dialog.querySelector('#section-stills');
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Lightbox handlers
  function openLightbox(index) {
    if (!currentImages[index]) return;
    currentLightboxIdx = index;
    const im = currentImages[index];
    lbImg.src = im.src;
    lbImg.alt = im.alt || '';
    lbIndex.textContent = `${String(index + 1).padStart(2, '0')} / ${String(currentImages.length).padStart(2, '0')}`;
    lbCaption.textContent = im.alt || currentProject.title || '';
    if (!lightbox.open) lightbox.showModal();
    lbClose.focus({preventScroll: true});
  }

  function nextLightbox() {
    if (currentImages.length <= 1) return;
    openLightbox((currentLightboxIdx + 1) % currentImages.length);
  }

  function prevLightbox() {
    if (currentImages.length <= 1) return;
    openLightbox((currentLightboxIdx - 1 + currentImages.length) % currentImages.length);
  }

  lbClose.addEventListener('click', () => lightbox.close());
  lbNext.addEventListener('click', nextLightbox);
  lbPrev.addEventListener('click', prevLightbox);
  lightbox.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); nextLightbox(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prevLightbox(); }
  });
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) lightbox.close();
  });

  // Cinematic Film player handlers
  function openFilmPlayer(film) {
    playerTitle.textContent = `${currentProject.name} — ${film.title}`;
    playerVideo.src = film.src;
    playerVideo.poster = film.poster;
    playerVideo.muted = true;
    playerSound.textContent = 'Sound on';
    playerToggle.textContent = 'Pause';
    filmPlayer.showModal();
    playerVideo.play().catch(() => {});
    playerClose.focus();
  }

  function closeFilmPlayer() {
    if (!filmPlayer.open) return;
    if (document.fullscreenElement && filmPlayer.contains(document.fullscreenElement)) {
      document.exitFullscreen?.().catch(() => {});
    }
    playerVideo.pause();
    filmPlayer.close();
  }

  playerClose.addEventListener('click', closeFilmPlayer);
  filmPlayer.addEventListener('cancel', e => { e.preventDefault(); closeFilmPlayer(); });
  filmPlayer.addEventListener('click', e => {
    if (e.target === filmPlayer) closeFilmPlayer();
  });

  playerToggle.addEventListener('click', () => {
    if (playerVideo.paused) {
      playerVideo.play();
      playerToggle.textContent = 'Pause';
    } else {
      playerVideo.pause();
      playerToggle.textContent = 'Play';
    }
  });

  playerSound.addEventListener('click', () => {
    playerVideo.muted = !playerVideo.muted;
    playerSound.textContent = playerVideo.muted ? 'Sound on' : 'Sound off';
  });

  playerFull.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (filmPlayer.requestFullscreen) await filmPlayer.requestFullscreen();
      else playerVideo.webkitEnterFullscreen?.();
    } catch {
      playerVideo.controls = true;
    }
  });

  playerVideo.addEventListener('timeupdate', () => {
    const min = Math.floor(playerVideo.currentTime / 60).toString().padStart(2, '0');
    const sec = Math.floor(playerVideo.currentTime % 60).toString().padStart(2, '0');
    playerTime.textContent = `${min}:${sec}`;
  });

  // Render 6-image contact sheet page
  function renderImagesPage(page) {
    currentPage = page;
    imagesGrid.replaceChildren();

    const start = page * IMAGES_PER_PAGE;
    const end = Math.min(start + IMAGES_PER_PAGE, currentImages.length);
    const pageItems = currentImages.slice(start, end);

    const startStr = String(start + 1).padStart(2, '0');
    const endStr = String(end).padStart(2, '0');
    const totalStr = String(currentImages.length).padStart(2, '0');
    counter.textContent = `${startStr}–${endStr} / ${totalStr}`;

    pageItems.forEach((im, localIdx) => {
      const globalIdx = start + localIdx;
      const card = document.createElement('article');
      card.className = 'gallery-card';
      card.dataset.index = globalIdx;

      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'gallery-card-thumb';
      thumb.setAttribute('aria-label', `Enlarge image ${globalIdx + 1}: ${im.alt || currentProject.title}`);

      const img = document.createElement('img');
      img.src = im.preview || im.src;
      img.alt = im.alt || '';
      img.width = im.width || 800;
      img.height = im.height || 1000;
      img.loading = localIdx < 3 ? 'eager' : 'lazy';
      img.decoding = 'async';

      const zoomBadge = document.createElement('span');
      zoomBadge.className = 'gallery-zoom-badge';
      zoomBadge.innerHTML = '⤢';
      zoomBadge.setAttribute('aria-hidden', 'true');

      thumb.append(img, zoomBadge);
      thumb.addEventListener('click', () => openLightbox(globalIdx));

      const caption = document.createElement('div');
      caption.className = 'gallery-card-caption';

      const num = document.createElement('span');
      num.className = 'gallery-card-num';
      num.textContent = String(globalIdx + 1).padStart(2, '0');

      const title = document.createElement('span');
      title.className = 'gallery-card-title';
      title.textContent = im.alt || `${currentProject.title} — Frame ${globalIdx + 1}`;

      caption.append(num, title);
      card.append(thumb, caption);
      imagesGrid.append(card);
    });

    renderPagination();
  }

  function renderPagination() {
    pageNumbers.replaceChildren();

    if (totalPages <= 1) {
      paginationNav.hidden = true;
      return;
    }

    paginationNav.hidden = false;
    pagePrev.disabled = (currentPage === 0);
    pageNext.disabled = (currentPage === totalPages - 1);

    for (let p = 0; p < totalPages; p++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'page-num-btn' + (p === currentPage ? ' is-active' : '');
      btn.textContent = String(p + 1).padStart(2, '0');
      btn.setAttribute('aria-label', `Go to page ${p + 1}`);
      btn.addEventListener('click', () => {
        renderImagesPage(p);
      });
      pageNumbers.append(btn);
    }
  }

  pagePrev.addEventListener('click', () => {
    if (currentPage > 0) renderImagesPage(currentPage - 1);
  });
  pageNext.addEventListener('click', () => {
    if (currentPage < totalPages - 1) renderImagesPage(currentPage + 1);
  });

  // Render compact, refined campaign films
  function renderFilms(films) {
    filmsSlot.replaceChildren();
    if (!films || films.length === 0) {
      filmsSection.hidden = true;
      jumpFilmsBtn.hidden = true;
      return;
    }

    filmsSection.hidden = false;
    jumpFilmsBtn.hidden = false;

    // Single-Film Editorial Composition (e.g. Casa Mirador, Sable, Salt & Silk)
    if (films.length === 1) {
      const f = films[0];
      const wrap = document.createElement('div');
      wrap.className = 'project-films-single';

      // Left: Compact vertical preview card
      const filmCard = document.createElement('div');
      filmCard.className = 'film-card';

      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'film-card-thumb';
      thumb.setAttribute('aria-label', `Watch film: ${f.title}`);

      const poster = document.createElement('img');
      poster.src = f.poster;
      poster.alt = f.title || '';
      poster.loading = 'lazy';

      const formatTag = document.createElement('span');
      formatTag.className = 'film-format-tag';
      formatTag.textContent = '9:16 FILM';

      const playBadge = document.createElement('span');
      playBadge.className = 'film-play-badge';
      playBadge.innerHTML = '<span class="play-arrow">▶</span><span>Play</span>';

      thumb.append(poster, formatTag, playBadge);
      thumb.addEventListener('click', () => openFilmPlayer(f));
      filmCard.append(thumb);

      // Right: Editorial description & action
      const narrativeBox = document.createElement('div');
      narrativeBox.className = 'film-single-editorial';

      const kicker = document.createElement('span');
      kicker.className = 'film-single-kicker';
      kicker.textContent = '01 / FEATURED CAMPAIGN FILM';

      const heading = document.createElement('h3');
      heading.className = 'film-single-title';
      heading.textContent = f.title;

      const desc = document.createElement('p');
      desc.className = 'film-single-narrative';
      const filmsEntry = campaignFilms[currentProject.slug];
      desc.textContent = (filmsEntry && filmsEntry.description)
        ? `${filmsEntry.description} Art-directed commercial motion and visual storytelling.`
        : 'Editorial advertising motion designed to capture mood, texture and movement.';

      const specs = document.createElement('div');
      specs.className = 'film-single-specs';
      specs.innerHTML = `
        <span class="film-spec-item">4K UHD</span>
        <span class="film-spec-item">9:16 Vertical</span>
        <span class="film-spec-item">Commercial Direction</span>
        <span class="film-spec-item">Stereo Master</span>
      `;

      const actionWrap = document.createElement('div');
      actionWrap.className = 'film-single-action';
      const watchBtn = document.createElement('button');
      watchBtn.type = 'button';
      watchBtn.className = 'film-watch-btn';
      watchBtn.innerHTML = '<span>▶ Watch in Cinematic Player</span><span>↗</span>';
      watchBtn.addEventListener('click', () => openFilmPlayer(f));
      actionWrap.append(watchBtn);

      narrativeBox.append(kicker, heading, desc, specs, actionWrap);
      wrap.append(filmCard, narrativeBox);
      filmsSlot.append(wrap);
    } 
    // Multi-Film Compact Grid (e.g. Élan Pâtisserie with 3 films)
    else {
      const grid = document.createElement('div');
      grid.className = 'project-films-collection';

      films.forEach((f, idx) => {
        const card = document.createElement('article');
        card.className = 'film-card';

        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = 'film-card-thumb';
        thumb.setAttribute('aria-label', `Play film ${idx + 1}: ${f.title}`);

        const poster = document.createElement('img');
        poster.src = f.poster;
        poster.alt = f.title || '';
        poster.loading = 'lazy';

        const formatTag = document.createElement('span');
        formatTag.className = 'film-format-tag';
        formatTag.textContent = '9:16 FILM';

        const playBadge = document.createElement('span');
        playBadge.className = 'film-play-badge';
        playBadge.innerHTML = '<span class="play-arrow">▶</span><span>Play</span>';

        thumb.append(poster, formatTag, playBadge);
        thumb.addEventListener('click', () => openFilmPlayer(f));

        const caption = document.createElement('div');
        caption.className = 'film-card-caption';

        const num = document.createElement('span');
        num.className = 'film-card-num';
        num.textContent = String(idx + 1).padStart(2, '0');

        const title = document.createElement('span');
        title.className = 'film-card-title';
        title.textContent = f.title;

        caption.append(num, title);
        card.append(thumb, caption);
        grid.append(card);
      });

      filmsSlot.append(grid);
    }
  }

  // Keyboard navigation for image pagination
  dialog.addEventListener('keydown', e => {
    if (lightbox.open || filmPlayer.open) return;
    if (e.key === 'ArrowRight' && currentPage < totalPages - 1) {
      e.preventDefault();
      renderImagesPage(currentPage + 1);
    } else if (e.key === 'ArrowLeft' && currentPage > 0) {
      e.preventDefault();
      renderImagesPage(currentPage - 1);
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
        en: ['Close window', 'Back to selected work', 'Visual Studies', 'Campaign Films'],
        fr: ['Fermer la fenêtre', 'Retour aux projets', 'Études visuelles', 'Films de campagne'],
        it: ['Chiudi finestra', 'Torna ai progetti', 'Studi visivi', 'Film di campagna'],
        ar: ['إغلاق النافذة', 'العودة إلى المشاريع', 'الدراسات البصرية', 'أفلام الحملة']
      }[lang] || ['Close window', 'Back to selected work', 'Visual Studies', 'Campaign Films'];

      // Apply Individual Art Direction theme
      dialog.dataset.theme = project.theme || 'casa';

      // Top Bar information
      const projNum = project.number || '01';
      dialog.querySelector('[data-room-number]').textContent = `${projNum} / 04`;
      dialog.querySelector('[data-room-category]').textContent = project.category || project.title || 'Creative Direction';
      dialog.querySelector('[data-room-name]').textContent = project.name || project.title;
      closeButton.setAttribute('aria-label', words[0]);
      returnBtn.querySelector('span:first-child').textContent = words[1];

      // Editorial Intro Block
      const isElan = project.slug === 'elan-bakery';
      const logoSlot = dialog.querySelector('[data-brand-logo-slot]');
      const titleEl = dialog.querySelector('#project-room-title');

      if (isElan) {
        logoSlot.innerHTML = `
          <div class="elan-brand-header">
            <div class="elan-logo-lockup">
              <span class="elan-tagline-top">BAKERY · CAFÉ · GOOD DAYS</span>
              <img src="/public/projects/elan-bakery/elan-logo.svg" alt="élan PÂTISSERIE" class="elan-brand-logo-svg" width="270" height="172">
              <span class="elan-tagline-bottom">A SWEETER BRIGHTER DAY</span>
            </div>
          </div>
        `;
        titleEl.style.display = 'none';
        dialog.querySelector('[data-room-name]').textContent = 'élan Pâtisserie';
      } else {
        logoSlot.innerHTML = '';
        titleEl.style.display = '';
        titleEl.textContent = project.name || project.title;
        dialog.querySelector('[data-room-name]').textContent = project.name || project.title;
      }

      dialog.querySelector('[data-meta-kicker]').textContent = (project.category || project.title || '').toUpperCase();
      dialog.querySelector('[data-meta-year]').textContent = project.year || '2026';
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

      // Prepare images & pagination
      currentImages = project.images || [];
      totalPages = Math.ceil(currentImages.length / IMAGES_PER_PAGE) || 1;

      // Prepare films
      const filmsEntry = campaignFilms[project.slug];
      currentFilms = (filmsEntry && filmsEntry.films) ? filmsEntry.films : [];

      // Configure Jump Navigation counts
      dialog.querySelector('[data-stills-count]').textContent = String(currentImages.length);
      dialog.querySelector('[data-label-stills]').textContent = words[2];
      
      if (currentFilms.length > 0) {
        jumpFilmsBtn.hidden = false;
        dialog.querySelector('[data-films-count]').textContent = String(currentFilms.length);
        dialog.querySelector('[data-label-films]').textContent = words[3];
      } else {
        jumpFilmsBtn.hidden = true;
      }

      renderImagesPage(0);
      renderFilms(currentFilms);

      // Prevent underlying page scrolling
      document.body.style.overflow = 'hidden';
      document.body.classList.add('project-window-open');
      document.dispatchEvent(new CustomEvent('bymou:vieweropen'));

      dialog.showModal();
      window.ByMouLocale?.localize(dialog);
      scroll.scrollTop = 0;
      closeButton.focus({preventScroll: true});

      // Sophisticated entrance motion
      if (!reduced.matches && window.gsap) {
        animation = gsap.fromTo(dialog,
          {opacity: 0, scale: 0.95, y: 20},
          {opacity: 1, scale: 1, y: 0, duration: 0.38, ease: 'power3.out'}
        );
      } else {
        dialog.style.opacity = '1';
        dialog.style.transform = 'none';
      }
    }
  };
}
