import { websiteVideos } from '../data/websites.js';

const labels = {
  en: ['Websites · Selected Works', 'Selected digital experiences', '03 Works · In Motion'],
  fr: ['Sites Web · Projets Choisis', 'Expériences digitales choisies', '03 Projets · En Mouvement'],
  it: ['Siti Web · Lavori Selezionati', 'Esperienze digitali selezionate', '03 Progetti · In Movimento'],
  ar: ['المواقع الرقمية · أعمال مختارة', 'تجارب رقمية مختارة', '٠٣ أعمال · في حركة']
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
    <div class="web-showcase-wrap">
      <header class="web-section-header">
        <div class="web-header-left">
          <p class="web-eyebrow" data-web-eyebrow></p>
          <h2 class="web-title" data-web-title></h2>
        </div>
        <span class="web-count-tag" data-web-note></span>
      </header>

      <div class="web-horizontal-row" tabindex="0" role="region" aria-label="Selected digital experiences">
        ${websiteVideos.map((item, i) => `
          <figure class="web-item" data-project="${item.slug}">
            <div class="web-preview-frame">
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
                aria-label="${item.name} website preview"
              ></video>
            </div>
            <figcaption class="web-caption">
              <div class="web-caption-main">
                <span class="web-item-num">${String(i + 1).padStart(2, '0')}</span>
                <span class="web-item-name">${item.name}</span>
              </div>
              <span class="web-item-category">${item.category}</span>
            </figcaption>
          </figure>
        `).join('')}
      </div>
    </div>
  `;

  const strip = root.querySelector('.web-horizontal-row');
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
  }, { threshold: 0.15 });

  videos.forEach(v => observer.observe(v));

  document.addEventListener('visibilitychange', sync);
  document.addEventListener('bymou:vieweropen', () => { modalOpen = true; sync(); });
  document.addEventListener('bymou:viewerclose', () => { modalOpen = false; sync(); });
  reduced.addEventListener('change', sync);

  // Keyboard navigation for carousel
  if (strip) {
    strip.addEventListener('keydown', e => {
      if (e.target !== strip || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      strip.scrollBy({
        left: strip.clientWidth * 0.85 * (e.key === 'ArrowRight' ? 1 : -1),
        behavior: reduced.matches ? 'instant' : 'smooth'
      });
    });
  }

  function translate() {
    const t = labels[language] || labels.en;
    const eyebrow = root.querySelector('[data-web-eyebrow]');
    if (eyebrow) eyebrow.textContent = t[0];
    const title = root.querySelector('[data-web-title]');
    if (title) title.textContent = t[1];
    const note = root.querySelector('[data-web-note]');
    if (note) note.textContent = t[2];
  }

  document.addEventListener('bymou:languagechange', e => {
    language = e.detail?.language || getCurrentLang();
    translate();
  });
  document.addEventListener('bymou:localeready', e => {
    language = e.detail?.language || getCurrentLang();
    translate();
  });

  translate();
}
