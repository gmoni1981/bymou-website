import {campaignFilms} from '../data/campaign-films.js';

const lex = {
  en: {
    heading: 'Campaign films',
    headingSingle: 'Campaign film',
    play: 'Play film',
    close: 'Close film',
    sound: 'Sound on',
    mute: 'Sound off',
    pause: 'Pause',
    resume: 'Play',
    full: 'Fullscreen',
    format: '9:16 Vertical Film',
    watchHint: 'Click to play with sound',
    concept: 'AI campaign concept',
    more: 'More films',
    error: 'This film could not load. Please try again.'
  },
  fr: {
    heading: 'Films de campagne',
    headingSingle: 'Film de campagne',
    play: 'Voir le film',
    close: 'Fermer le film',
    sound: 'Activer le son',
    mute: 'Couper le son',
    pause: 'Pause',
    resume: 'Lecture',
    full: 'Plein écran',
    format: 'Film vertical 9:16',
    watchHint: 'Cliquez pour voir avec le son',
    concept: 'Concept de campagne IA',
    more: 'Autres films',
    error: 'Le film ne peut pas être chargé. Réessayez.'
  },
  it: {
    heading: 'Film di campagna',
    headingSingle: 'Film di campagna',
    play: 'Guarda il film',
    close: 'Chiudi il film',
    sound: 'Attiva audio',
    mute: 'Disattiva audio',
    pause: 'Pausa',
    resume: 'Riproduci',
    full: 'Schermo intero',
    format: 'Film verticale 9:16',
    watchHint: 'Clicca per guardare con audio',
    concept: 'Concept di campagna IA',
    more: 'Altri film',
    error: 'Impossibile caricare il film. Riprova.'
  },
  ar: {
    heading: 'أفلام الحملات',
    headingSingle: 'فيلم الحملة',
    play: 'شاهد الفيلم',
    close: 'إغلاق الفيلم',
    sound: 'تشغيل الصوت',
    mute: 'كتم الصوت',
    pause: 'إيقاف مؤقت',
    resume: 'تشغيل',
    full: 'ملء الشاشة',
    format: 'فيلم عمودي 9:16',
    watchHint: 'اضغط للمشاهدة مع الصوت',
    concept: 'تصوّر لحملة بالذكاء الاصطناعي',
    more: 'المزيد من الأفلام',
    error: 'تعذّر تحميل الفيلم. يُرجى المحاولة مجددًا.'
  }
};

const tr = s => window.ByMouLocale?.translate(s) || s;

export function mountCampaignFilms(container, slug, {root = null} = {}) {
  const project = campaignFilms[slug];
  if (!project || !project.films || project.films.length === 0) return { destroy() {} };

  if (!document.querySelector('link[data-campaign-style]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/campaign-films.css?v=2';
    css.dataset.campaignStyle = '';
    document.head.append(css);
  }

  const lang = document.documentElement.lang || 'en';
  const words = lex[lang] || lex.en;
  const isSingle = project.films.length === 1;

  const section = document.createElement('section');
  section.className = `campaign-films campaign-${project.theme}` + (isSingle ? ' is-single-film' : '');
  section.setAttribute('aria-label', isSingle ? words.headingSingle : words.heading);

  const head = document.createElement('header');
  head.className = 'campaign-films-heading';
  head.innerHTML = `
    <p class="campaign-kicker">${project.name} / ${words.concept}</p>
    <h2>${isSingle ? words.headingSingle : words.heading}</h2>
    <p class="campaign-deck"></p>
  `;
  head.querySelector('.campaign-deck').textContent = tr(project.description);
  section.append(head);

  const layout = document.createElement('div');
  layout.className = 'campaign-composition';

  const secondary = document.createElement('div');
  secondary.className = 'campaign-secondary';
  secondary.setAttribute('aria-label', words.more);

  let opener = null, visible = new Set(), disposed = false;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');

  const player = document.createElement('dialog');
  player.className = 'campaign-player';
  player.dataset.lenisPrevent = '';
  player.setAttribute('aria-label', `${project.name} — ${isSingle ? words.headingSingle : words.heading}`);
  player.innerHTML = `
    <div class="campaign-player-top">
      <span>${project.name}</span>
      <button data-film-close aria-label="${words.close}">${words.close} ×</button>
    </div>
    <div class="campaign-player-screen">
      <video playsinline preload="none"></video>
      <p role="status" hidden></p>
    </div>
    <div class="campaign-player-tools">
      <button data-film-toggle>${words.pause}</button>
      <button data-film-sound>${words.sound}</button>
      <button data-film-full>${words.full} ↗</button>
      <span data-film-time>00:00</span>
    </div>
  `;
  document.body.append(player);

  const large = player.querySelector('video');
  const sound = player.querySelector('[data-film-sound]');
  const toggle = player.querySelector('[data-film-toggle]');
  const previews = [];

  const pausePreviews = () => previews.forEach(v => v.pause());
  const resume = () => {
    if (disposed || player.open || document.hidden || reduced.matches) return;
    for (const v of visible) {
      if (!v.src) { v.src = v.dataset.src; v.load(); }
      v.play().catch(() => {});
    }
  };

  function open(f, b) {
    opener = b;
    pausePreviews();
    large.src = f.src;
    large.poster = f.poster;
    large.muted = true;
    sound.textContent = words.sound;
    player.querySelector('[role=status]').hidden = true;
    player.showModal();
    document.dispatchEvent(new Event('bymou:vieweropen'));
    large.play().catch(() => {});
    player.querySelector('[data-film-close]').focus();
  }

  function close() {
    if (document.fullscreenElement && player.contains(document.fullscreenElement)) {
      document.exitFullscreen?.().catch(() => {});
    }
    large.pause();
    player.close();
  }

  player.querySelector('[data-film-close]').onclick = close;
  player.addEventListener('cancel', e => { e.preventDefault(); close(); });
  player.addEventListener('close', () => {
    large.pause();
    large.removeAttribute('src');
    large.load();
    if (!document.querySelector('.project-room[open]')) {
      document.dispatchEvent(new Event('bymou:viewerclose'));
    }
    opener?.focus({preventScroll: true});
    resume();
  });

  sound.onclick = () => {
    large.muted = !large.muted;
    sound.textContent = large.muted ? words.sound : words.mute;
  };
  toggle.onclick = () => (large.paused ? large.play().catch(() => {}) : large.pause());
  large.addEventListener('play', () => (toggle.textContent = words.pause));
  large.addEventListener('pause', () => (toggle.textContent = words.resume));
  large.addEventListener('timeupdate', () => {
    const min = Math.floor(large.currentTime / 60).toString().padStart(2, '0');
    const sec = Math.floor(large.currentTime % 60).toString().padStart(2, '0');
    player.querySelector('[data-film-time]').textContent = `${min}:${sec}`;
  });
  large.addEventListener('error', () => {
    const p = player.querySelector('[role=status]');
    p.textContent = words.error;
    p.hidden = false;
  });

  player.querySelector('[data-film-full]').onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (player.requestFullscreen) await player.requestFullscreen();
      else large.webkitEnterFullscreen?.();
    } catch {
      large.controls = true;
    }
  };

  const observer = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) visible.add(e.target);
      else { visible.delete(e.target); e.target.pause(); }
    }
    resume();
  }, {root, threshold: 0.2});

  project.films.forEach((f, i) => {
    const card = document.createElement('figure');
    card.className = 'campaign-film' + (i === 0 ? ' is-featured' : '');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'campaign-film-open';
    button.setAttribute('aria-label', `${words.play} ${String(i + 1).padStart(2, '0')} — ${tr(f.title)}`);

    const v = document.createElement('video');
    Object.assign(v, {
      poster: f.poster,
      muted: true,
      loop: true,
      playsInline: true,
      preload: 'none',
      tabIndex: -1
    });
    v.setAttribute('aria-hidden', 'true');
    v.dataset.src = f.src;
    v.width = f.width;
    v.height = f.height;

    const indicator = document.createElement('span');
    indicator.className = 'campaign-play-mark';
    indicator.textContent = '↗';
    indicator.setAttribute('aria-hidden', 'true');

    button.append(v, indicator);
    button.onclick = () => open(f, button);

    const caption = document.createElement('figcaption');
    const num = document.createElement('span');
    num.textContent = String(i + 1).padStart(2, '0');
    const title = document.createElement('span');
    title.textContent = tr(f.title);
    caption.append(num, title);

    card.append(button, caption);

    if (i === 0) layout.prepend(card);
    else secondary.append(card);

    previews.push(v);
    observer.observe(v);
  });

  if (isSingle) {
    const note = document.createElement('div');
    note.className = 'campaign-single-editorial';
    note.innerHTML = `
      <span class="campaign-editorial-kicker">${project.name} · DIRECTION</span>
      <p class="campaign-editorial-quote">"${tr(project.description)}"</p>
      <div class="campaign-editorial-meta">
        <span class="campaign-format-badge">${words.format}</span>
        <span class="campaign-watch-hint">${words.watchHint} ↗</span>
      </div>
    `;
    layout.append(note);
  } else {
    layout.append(secondary);
  }

  section.append(layout);
  container.append(section);

  const visibility = () => {
    if (document.hidden) { pausePreviews(); large.pause(); }
    else resume();
  };
  document.addEventListener('visibilitychange', visibility);
  window.ByMouLocale?.localize(section);

  return {
    section,
    destroy() {
      disposed = true;
      observer.disconnect();
      pausePreviews();
      large.pause();
      player.remove();
      section.remove();
      document.removeEventListener('visibilitychange', visibility);
    }
  };
}

export function initCaseCampaignFilms() {
  const slug = location.pathname.split('/').pop()?.replace('.html', '');
  if (!campaignFilms[slug] || document.querySelector('.campaign-films')) return;
  const cover = document.querySelector('.case-cover');
  if (!cover) return;
  const target = document.createElement('div');
  cover.after(target);
  mountCampaignFilms(target, slug);
}
