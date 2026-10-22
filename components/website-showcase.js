import { websiteVideos } from '../data/websites.js';

const uiCopy = {
  en: {
    eyebrow: 'Selected Work · Digital Architecture',
    title: 'Selected digital experiences',
    lead: 'Interactive flagships, kinetic storefronts, and brand worlds engineered for deep immersion and seamless motion.',
    counter: 'Index [ 01 — 03 ]',
    status: 'All Platforms Active · 2026',
    viewSite: 'Launch Experience',
    productionUrl: 'Production URL'
  },
  fr: {
    eyebrow: 'Projets Choisis · Architecture Digitale',
    title: 'Expériences digitales choisies',
    lead: 'Flagships interactifs, boutiques cinétiques et univers de marque conçus pour une immersion totale et un mouvement fluide.',
    counter: 'Index [ 01 — 03 ]',
    status: 'Plateformes Actives · 2026',
    viewSite: 'Découvrir le Projet',
    productionUrl: 'URL de Production'
  },
  it: {
    eyebrow: 'Lavori Selezionati · Architettura Digitale',
    title: 'Esperienze digitali selezionate',
    lead: 'Flagship interattivi, store cinetici e mondi di marca progettati per un’immersione profonda e un movimento fluido.',
    counter: 'Indice [ 01 — 03 ]',
    status: 'Piattaforme Attive · 2026',
    viewSite: 'Esplora Esperienza',
    productionUrl: 'URL di Produzione'
  },
  ar: {
    eyebrow: 'أعمال مختارة · العمارة الرقمية',
    title: 'تجارب رقمية مختارة',
    lead: 'واجهات رائدة تفاعلية، ومتاجر رقمية حركية، وعوالم علامات تجارية صُممت لانغماس عميق وحركة انسيابية.',
    counter: 'الفهرس [ ٠١ — ٠٣ ]',
    status: 'جميع المنصات مفعلة · ٢٠٢٦',
    viewSite: 'استكشف التجربة',
    productionUrl: 'رابط الإنتاج'
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
    <div class="web-editorial-wrap">
      <header class="web-monograph-masthead">
        <div class="web-meta-bar">
          <span class="web-eyebrow" data-web-eyebrow></span>
          <span class="web-index-label" data-web-counter aria-hidden="true"></span>
        </div>
        <div class="web-headline-row">
          <h2 class="web-headline" data-web-title></h2>
          <div class="web-headline-sub">
            <p class="web-synopsis" data-web-lead></p>
            <div class="web-status-pill">
              <span class="web-status-glow" aria-hidden="true"></span>
              <span data-web-status></span>
            </div>
          </div>
        </div>
      </header>

      <div class="web-asymmetric-monograph" role="region" aria-label="Selected digital experiences">
        ${websiteVideos.map((item, i) => `
          <article class="web-entry ${i % 2 === 1 ? 'is-alternate' : ''}" data-slug="${item.slug}">
            <!-- Immersive Media Frame (No fake browser chrome) -->
            <div class="web-stage-cell">
              <div class="web-media-canvas" style="--ratio: ${item.aspect};">
                <video
                  src="${item.src}"
                  poster="${item.poster}"
                  muted
                  defaultMuted
                  autoplay
                  loop
                  playsinline
                  preload="auto"
                  width="${item.width}"
                  height="${item.height}"
                  aria-label="${item.name} website preview in motion"
                ></video>
              </div>
            </div>

            <!-- Asymmetric Editorial Content Column -->
            <div class="web-info-cell">
              <div class="web-specimen-header">
                <span class="web-serial-digit">${String(i + 1).padStart(2, '0')}</span>
                <div class="web-serial-meta">
                  <span class="web-serial-total">/ 03</span>
                  <span class="web-discipline-tag">${item.discipline}</span>
                </div>
              </div>

              <div class="web-specimen-body">
                <h3 class="web-project-title">${item.name}</h3>
                <p class="web-category-subtitle">${item.category}</p>
                <p class="web-narrative-copy" data-desc-slug="${item.slug}">
                  ${item.descriptions[language] || item.descriptions.en}
                </p>
              </div>

              <div class="web-specimen-meta">
                <div class="web-disciplines-row" aria-label="Key deliverables">
                  ${item.deliverables.map(d => `<span class="web-chip">${d}</span>`).join('')}
                </div>
                <div class="web-action-footer">
                  <div class="web-domain-lockup">
                    <span class="web-url-caption" data-web-urllabel></span>
                    <a class="web-domain-link" href="https://${item.url}" target="_blank" rel="noopener noreferrer">
                      <span>${item.url}</span>
                      <span class="web-arrow" aria-hidden="true">↗</span>
                    </a>
                  </div>
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
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => visibility.set(e.target, e.isIntersecting));
    sync();
  }, { threshold: 0.1 });

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
      el.textContent = t.productionUrl;
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
