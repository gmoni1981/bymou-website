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
          <h1 id="project-room-title" class="proj-main-title"></h1>
          <p class="proj-narrative" data-meta-intro></p>
          <div class="proj-tags" data-meta-tags></div>
        </div>

        <div class="proj-view-tabs" data-view-tabs hidden>
          <button type="button" class="view-tab is-active" data-view-target="stills">
            <span data-label-stills>Photography</span>
            <span class="tab-badge" data-stills-count></span>
          </button>
          <button type="button" class="view-tab" data-view-target="films">
            <span data-label-films>Films</span>
            <span class="tab-badge" data-films-count></span>
          </button>
        </div>
      </header>

      <!-- 1. Stills Contact Sheet Grid -->
      <section class="project-view-panel" data-panel="stills">
        <div class="project-grid" data-images-grid></div>

        <nav class="project-pagination" data-pagination aria-label="Project images pagination">
          <button type="button" class="page-arrow prev" data-page-prev aria-label="Previous page">←</button>
          <div class="page-numbers" data-page-numbers></div>
          <button type="button" class="page-arrow next" data-page-next aria-label="Next page">→</button>
        </nav>
      </section>

      <!-- 2. Films Compact Collection -->
      <section class="project-view-panel" data-panel="films" hidden>
        <div class="project-films-grid" data-films-grid></div>
      </section>

      <footer class="project-room-footer">
        <span class="proj-footer-sign">BYMOU / MOU GRASSO</span>
        <button type="button" class="proj-return-btn" data-room-return>
          <span>Back to selected work</span>
          <span aria-hidden="true">↗</span>
        </button>
      </footer>
    </div>

    <!-- Fullscreen Lightbox Zoom Modal (Only the lightbox shows huge images) -->
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

    <!-- Cinematic Video Player Modal -->
    <dialog class="campaign-player" data-film-player data-lenis-prevent aria-label="Film Player">
      <div class="campaign-player-top">
        <span data-player-title></span>
        <button type="button" data-film-player-close aria-label="Close player">Close ×</button>
      </div>
      <div class="campaign-player-screen">
        <video playsinline preload="none"></video>
        <p role="status" hidden></p>
      </div>
      <div class="campaign-player-tools">
        <button type="button" data-film-toggle>Play</button>
        <button type="button" data-film-sound>Sound on</button>
        <button type="button" data-film-full>Fullscreen ↗</button>
        <span data-film-time>00:00</span>
      </div>
    </dialog>
  `;

  document.body.append(dialog);

  const scroll = dialog.querySelector('.project-room-scroll');
  const closeButton = dialog.querySelector('.project-room-close');
  const counter = dialog.querySelector('[data-room-count]');
  const returnBtn = dialog.querySelector('[data-room-return]');

  const tabsContainer = dialog.querySelector('[data-view-tabs]');
  const stillsTab = dialog.querySelector('[data-view-target="stills"]');
  const filmsTab = dialog.querySelector('[data-view-target="films"]');
  const stillsPanel = dialog.querySelector('[data-panel="stills"]');
  const filmsPanel = dialog.querySelector('[data-panel="films"]');

  const imagesGrid = dialog.querySelector('[data-images-grid]');
  const paginationNav = dialog.querySelector('[data-pagination]');
  const pagePrev = dialog.querySelector('[data-page-prev]');
  const pageNext = dialog.querySelector('[data-page-next]');
  const pageNumbers = dialog.querySelector('[data-page-numbers]');
  const filmsGrid = dialog.querySelector('[data-films-grid]');

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
  let activeView = 'stills';
  let opener = null;
  let closing = false;
  let savedScrollY = 0;
  let animation = null;

  function close() {
    if (!dialog.open || closing) return;
    closing = true;
    animation?.kill();
    playerVideo.pause();
    if (filmPlayer.open) filmPlayer.close();
    if (lightbox.open) lightbox.close();

    const finish = () => {
      dialog.close();
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

  // Backdrop click closes dialog (only when clicking the backdrop outside the dialog)
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

  // Switch between Photography and Films tabs
  function setView(view) {
    activeView = view;
    stillsTab.classList.toggle('is-active', view === 'stills');
    filmsTab.classList.toggle('is-active', view === 'films');
    stillsPanel.hidden = (view !== 'stills');
    filmsPanel.hidden = (view !== 'films');
    scroll.scrollTop = 0;
  }

  stillsTab.addEventListener('click', () => setView('stills'));
  filmsTab.addEventListener('click', () => setView('films'));

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

  // Film player handlers
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
    if (document.fullscreenElement && filmPlayer.contains(document.fullscreenElement)) {
      document.exitFullscreen?.().catch(() => {});
    }
    playerVideo.pause();
    filmPlayer.close();
  }

  playerClose.addEventListener('click', closeFilmPlayer);
  filmPlayer.addEventListener('cancel', e => { e.preventDefault(); closeFilmPlayer(); });
  playerToggle.addEventListener('click', () => {
    if (playerVideo.paused) { playerVideo.play(); playerToggle.textContent = 'Pause'; }
    else { playerVideo.pause(); playerToggle.textContent = 'Play'; }
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

    // Update counter
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
      img.width = im.width;
      img.height = im.height;
      img.loading = localIdx < 3 ? 'eager' : 'lazy';
      img.decoding = 'async';

      const zoomBadge = document.createElement('span');
      zoomBadge.className = 'card-zoom-badge';
      zoomBadge.setAttribute('aria-hidden', 'true');
      zoomBadge.textContent = '⤢';

      thumb.append(img, zoomBadge);
      thumb.addEventListener('click', () => openLightbox(globalIdx));

      const caption = document.createElement('div');
      caption.className = 'gallery-card-caption';

      const num = document.createElement('span');
      num.className = 'gallery-card-num';
      num.textContent = String(globalIdx + 1).padStart(2, '0');

      const title = document.createElement('span');
      title.className = 'gallery-card-title';
      title.textContent = im.alt || currentProject.title;

      caption.append(num, title);
      card.append(thumb, caption);
      imagesGrid.append(card);
    });

    renderPagination();
  }

  // Render pagination buttons
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

  // Render compact films collection
  function renderFilms(films) {
    filmsGrid.replaceChildren();
    if (!films || films.length === 0) return;

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

      const playMark = document.createElement('span');
      playMark.className = 'film-card-play';
      playMark.textContent = '↗';
      playMark.setAttribute('aria-hidden', 'true');

      thumb.append(poster, playMark);
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
      filmsGrid.append(card);
    });
  }

  // Keyboard navigation
  dialog.addEventListener('keydown', e => {
    if (lightbox.open || filmPlayer.open) return;
    if (e.key === 'ArrowRight') {
      if (activeView === 'stills' && currentPage < totalPages - 1) {
        e.preventDefault();
        renderImagesPage(currentPage + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (activeView === 'stills' && currentPage > 0) {
        e.preventDefault();
        renderImagesPage(currentPage - 1);
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
        en: ['Close window', 'Back to selected work', 'Photography', 'Films'],
        fr: ['Fermer la fenêtre', 'Retour aux projets', 'Photographie', 'Films'],
        it: ['Chiudi finestra', 'Torna ai progetti', 'Fotografia', 'Film'],
        ar: ['إغلاق النافذة', 'العودة إلى المشاريع', 'التصوير', 'أفلام']
      }[lang] || ['Close window', 'Back to selected work', 'Photography', 'Films'];

      // Apply Individual Art Direction theme
      dialog.dataset.theme = project.theme || 'casa';

      // Bar information
      const projNum = project.number || '01';
      dialog.querySelector('[data-room-number]').textContent = `${projNum} / 04`;
      dialog.querySelector('[data-room-category]').textContent = project.category || project.title || 'Creative Direction';
      dialog.querySelector('[data-room-name]').textContent = project.name || project.title;
      closeButton.setAttribute('aria-label', words[0]);
      returnBtn.querySelector('span:first-child').textContent = words[1];

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

      // Prepare images & pagination
      currentImages = project.images || [];
      totalPages = Math.ceil(currentImages.length / IMAGES_PER_PAGE) || 1;

      // Prepare films
      const filmsEntry = campaignFilms[project.slug];
      currentFilms = (filmsEntry && filmsEntry.films) ? filmsEntry.films : [];

      // Configure View Tabs
      if (currentFilms.length > 0) {
        tabsContainer.hidden = false;
        dialog.querySelector('[data-stills-count]').textContent = String(currentImages.length);
        dialog.querySelector('[data-films-count]').textContent = String(currentFilms.length);
        dialog.querySelector('[data-label-stills]').textContent = words[2];
        dialog.querySelector('[data-label-films]').textContent = words[3];
      } else {
        tabsContainer.hidden = true;
      }

      setView('stills');
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
