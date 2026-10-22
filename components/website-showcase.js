import { websiteVideos } from '../data/websites.js';

const uiCopy = {
  en: {
    eyebrow: 'Websites · Motion Architecture',
    title: 'Selected digital experiences',
    lead: 'Editorial web systems, interactive flagships, and spatial motion designed to transform digital presence into an indelible brand experience.',
    counter: '03 Works · 2026',
    status: 'Live Production',
    explore: 'Explore Experience',
    urlLabel: 'Production Domain'
  },
  fr: {
    eyebrow: 'Sites Web · Architecture Cinetique',
    title: 'Expériences digitales choisies',
    lead: 'Systèmes web éditoriaux, flagships interactifs et mouvement spatial conçus pour transformer la présence numérique en une expérience de marque indélébile.',
    counter: '03 Projets · 2026',
    status: 'Production En Ligne',
    explore: 'Découvrir le Projet',
    urlLabel: 'Domaine Officiel'
  },
  it: {
    eyebrow: 'Siti Web · Architettura del Movimento',
    title: 'Esperienze digitali selezionate',
    lead: 'Sistemi web editoriali, flagship interattivi e movimento spaziale pensati per trasformare la presenza digitale in un’esperienza memorabile.',
    counter: '03 Progetti · 2026',
    status: 'Online in Produzione',
    explore: 'Esplora Esperienza',
    urlLabel: 'Dominio Ufficiale'
  },
  ar: {
    eyebrow: 'المواقع الرقمية · هندسة الحركة',
    title: 'تجارب رقمية مختارة',
    lead: 'منظومات رقمية تحريرية، وواجهات رائدة تفاعلية، وحركة مكانية صُممت لتحويل الحضور الرقمي إلى بصمة تجارية استثنائية.',
    counter: '٠٣ أعمال · ٢٠٢٦',
    status: 'منصة مفعلة',
    explore: 'استكشف التجربة',
    urlLabel: 'النطاق الرسمي'
  }
};

export function initWebsiteShowcase({ reduced }) {
  const root = document.querySelector('#websites');
  if (!root) return;

  function getCurrentLang() {
    const fromPath = location.pathname.split('/')[1];
    if (['en', 'fr', 'it', 'ar'].includes(fromPath)) return fromPath;
    return window.ByMouLocale?.language || localStorage.getItem('bymou-language') || 'en';
  }

  let language = getCurrentLang();
  let modalOpen = false;

  root.innerHTML = `
    <div class="web-container">
      <header class="web-editorial-header">
        <div class="web-header-meta">
          <span class="web-eyebrow" data-web-eyebrow></span>
          <span class="web-counter" data-web-counter aria-hidden="true"></span>
        </div>
        <div class="web-header-main">
          <h2 class="web-title" data-web-title></h2>
          <div class="web-header-aside">
            <p class="web-lead" data-web-lead></p>
            <div class="web-header-badges">
              <span class="web-badge-pill"><span class="web-pulse-dot" aria-hidden="true"></span> <span data-web-status></span></span>
            </div>
          </div>
        </div>
      </header>

      <div class="web-editorial-showcase" role="region" aria-label="Selected digital experiences">
        ${websiteVideos.map((item, i) => `
          <article class="web-project-spread ${i % 2 === 1 ? 'is-reversed' : ''}" data-project="${item.slug}">
            <!-- Digital Viewport Window -->
            <div class="web-device-window">
              <div class="web-window-bar">
                <div class="web-window-dots" aria-hidden="true">
                  <span class="web-dot"></span>
                  <span class="web-dot"></span>
                  <span class="web-dot"></span>
                </div>
                <div class="web-url-pill">
                  <svg class="web-lock-icon" viewBox="0 0 12 12" width="10" height="10" fill="currentColor" aria-hidden="true">
                    <path d="M9 4.5V3.5a3 3 0 0 0-6 0v1H2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H9zM4.5 3.5a1.5 1.5 0 0 1 3 0v1h-3v-1z"/>
                  </svg>
                  <span class="web-url-text">${item.url}</span>
                </div>
                <div class="web-window-status">
                  <span class="web-fps-badge">60 FPS</span>
                </div>
              </div>
              <div class="web-screen-viewport" style="--aspect: ${item.aspect};">
                <video
                  muted
                  defaultMuted
                  autoplay
                  loop
                  playsinline
                  preload="none"
                  poster="${item.poster}"
                  width="${item.width}"
                  height="${item.height}"
                  data-src="${item.src}"
                  aria-label="${item.name} website preview recording in motion"
                ></video>
                <div class="web-viewport-glare" aria-hidden="true"></div>
              </div>
            </div>

            <!-- Editorial Spec Sheet Column -->
            <div class="web-spec-sheet">
              <div class="web-spec-top">
                <div class="web-spec-index">
                  <span class="web-num">${String(i + 1).padStart(2, '0')}</span>
                  <span class="web-num-sep">/</span>
                  <span class="web-num-total">03</span>
                </div>
                <span class="web-spec-discipline">${item.discipline}</span>
              </div>

              <div class="web-spec-body">
                <h3 class="web-project-name">${item.name}</h3>
                <p class="web-project-category">${item.category}</p>
                <p class="web-project-narrative" data-desc-slug="${item.slug}">
                  ${item.descriptions[language] || item.descriptions.en}
                </p>
              </div>

              <div class="web-spec-bottom">
                <ul class="web-tags-list" aria-label="Deliverables">
                  ${item.deliverables.map(tag => `<li class="web-tag-item">${tag}</li>`).join('')}
                </ul>
                <div class="web-action-row">
                  <div class="web-domain-spec">
                    <span class="web-domain-label" data-web-urllabel></span>
                    <span class="web-domain-val">${item.url}</span>
                  </div>
                  <span class="web-explore-pill">
                    <span data-web-explore></span>
                    <span class="web-arrow" aria-hidden="true">↗</span>
                  </span>
                </div>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  const videos = [...root.querySelectorAll('video')];
  const visibility = new Map();
  videos.forEach(v => visibility.set(v, false));

  function sync() {
    videos.forEach(v => {
      if (visibility.get(v) && !document.hidden && !modalOpen && !reduced.matches) {
        if (!v.getAttribute('src')) {
          v.src = v.dataset.src;
        }
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => visibility.set(e.target, e.isIntersecting));
    sync();
  }, { threshold: 0.15 });

  videos.forEach(v => observer.observe(v));

  document.addEventListener('visibilitychange', sync);
  document.addEventListener('bymou:vieweropen', () => { modalOpen = true; sync(); });
  document.addEventListener('bymou:viewerclose', () => { modalOpen = false; sync(); });
  reduced.addEventListener('change', sync);

  function applyLanguage() {
    const t = uiCopy[language] || uiCopy.en;
    const eyebrow = root.querySelector('[data-web-eyebrow]');
    if (eyebrow) eyebrow.textContent = t.eyebrow;

    const counter = root.querySelector('[data-web-counter]');
    if (counter) counter.textContent = t.counter;

    const title = root.querySelector('[data-web-title]');
    if (title) title.textContent = t.title;

    const lead = root.querySelector('[data-web-lead]');
    if (lead) lead.textContent = t.lead;

    const status = root.querySelector('[data-web-status]');
    if (status) status.textContent = t.status;

    root.querySelectorAll('[data-web-urllabel]').forEach(el => {
      el.textContent = t.urlLabel;
    });

    root.querySelectorAll('[data-web-explore]').forEach(el => {
      el.textContent = t.explore;
    });

    websiteVideos.forEach(item => {
      const descEl = root.querySelector(`[data-desc-slug="${item.slug}"]`);
      if (descEl) {
        descEl.textContent = item.descriptions[language] || item.descriptions.en;
      }
    });
  }

  document.addEventListener('bymou:languagechange', e => {
    language = e.detail?.language || getCurrentLang();
    applyLanguage();
  });
  document.addEventListener('bymou:localeready', e => {
    language = e.detail?.language || getCurrentLang();
    applyLanguage();
  });

  applyLanguage();
}
