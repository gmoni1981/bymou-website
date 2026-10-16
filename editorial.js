/* BYMOU editorial portfolio. Static, local-first content; no build step. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const slowConnection = navigator.connection?.saveData;
  let content = null;
  let language = 'en';
  let userPaused = false;
  let dialogOpener = null;
  let preparedInquiry = '';
  const isPaused = () => userPaused || reduced.matches;
  const translate = key => content?.locales?.[language]?.[key] ?? content?.locales?.en?.[key] ?? key;
  try {
    const saved = localStorage.getItem('bymou-language');
    if (['en','fr','it'].includes(saved)) language = saved;
    userPaused = localStorage.getItem('bymou-motion-paused') === 'true';
  } catch (_) { /* Portfolio works with storage blocked. */ }

  const languageInput = $('#language');
  if (languageInput) languageInput.value = language;

  function applyLanguage() {
    document.documentElement.lang = language;
    document.dispatchEvent(new CustomEvent('bymou:languagechange'));
    $$('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      const value = translate(key);
      if (value !== key) element.textContent = value;
    });
    const attributes = [
      ['.main-nav','aria-label','nav.label'],
      ['#language','aria-label','nav.language'],
      ['[data-comparison]','aria-label','lab.slider'],
      ['[data-notebook-prev]','aria-label','ui.prev'],
      ['[data-notebook-next]','aria-label','ui.next']
    ];
    attributes.forEach(([selector,attribute,key]) => { if ($(selector)) $(selector).setAttribute(attribute,translate(key)); });
    $$('[data-close]').forEach(button => button.setAttribute('aria-label',translate('ui.close')));
    if ($('.menu-toggle')?.getAttribute('aria-expanded') === 'true') $('.menu-toggle [data-i18n]').textContent = translate('nav.close');
    $$('[data-i18n-label]').forEach(element => element.setAttribute('aria-label',translate(element.dataset.i18nLabel)));
    updateMotionButton();
    renderResources();
    $$('[data-work-preview]').forEach(updatePreviewButton);
    if ($('#inquiry-result') && !$('#inquiry-result').hidden) $('[data-inquiry-status]').textContent = translate('contact.ready');
  }
  languageInput?.addEventListener('change', () => {
    language = languageInput.value;
    try { localStorage.setItem('bymou-language',language); } catch (_) {}
    if (content) applyLanguage();
  });

  // Small-screen navigation supports keyboard, Escape and outside clicks.
  const menu = $('.menu-toggle');
  const nav = $('#main-nav');
  function closeMenu(returnFocus = false) {
    nav?.classList.remove('is-open');
    menu?.setAttribute('aria-expanded','false');
    const label = $('[data-i18n]',menu || document);
    if (menu && label) label.textContent = content ? translate('nav.menu') : 'Menu';
    if (returnFocus) menu?.focus();
  }
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open',open);
    menu.setAttribute('aria-expanded',String(open));
    $('[data-i18n]',menu).textContent = content ? translate(open ? 'nav.close' : 'nav.menu') : (open ? 'Close' : 'Menu');
  });
  $$('.main-nav a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') closeMenu(true); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });

  // Native dialogs provide focus trapping and Escape handling.
  function openDialog(dialog, opener) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    dialogOpener = opener;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
  $$('dialog').forEach(dialog => {
    $('[data-close]',dialog)?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      dialogOpener?.focus();
      dialogOpener = null;
    });
  });
  $('[data-privacy]')?.addEventListener('click', event => openDialog($('#privacy-dialog'),event.currentTarget));
  $$('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
    const dialog = $('#image-dialog');
    const original = $('img',button);
    $('img',dialog).src = button.dataset.lightbox;
    $('img',dialog).alt = original.alt;
    $('#image-caption').textContent = `BYMOU / ${translate('ui.image')} ${button.dataset.imageNumber} — ${original.alt}`;
    openDialog(dialog,button);
  }));

  // Filter the selected films without replacing their real, crawlable links.
  const projects = $$('.work-grid .project');
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    $$('[data-filter]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
    const filter = button.dataset.filter;
    projects.forEach(project => {
      project.hidden = filter !== 'all' && project.dataset.category !== filter;
      if (project.hidden) $$('video',project).forEach(pauseVideo);
    });
    const count = projects.filter(project => !project.hidden).length;
    if ($('.work-count')) $('.work-count').textContent = `${String(count).padStart(2,'0')} / ${projects.length.toString().padStart(2,'0')}`;
    if ($('.filter-empty')) $('.filter-empty').hidden = count !== 0;
    window.ScrollTrigger?.refresh();
  }));

  // The comparison uses two presentations of the same real image.
  $('[data-comparison]')?.addEventListener('input', event => {
    event.target.closest('.comparison').style.setProperty('--split',`${event.target.value}%`);
  });
  const notebook = $('.image-notebook');
  function moveNotebook(direction) {
    notebook?.scrollBy({left:direction * notebook.clientWidth * .7,behavior:isPaused()?'instant':'smooth'});
  }
  $('[data-notebook-prev]')?.addEventListener('click', () => moveNotebook(-1));
  $('[data-notebook-next]')?.addEventListener('click', () => moveNotebook(1));
  notebook?.addEventListener('keydown', event => {
    if (event.target !== notebook) return;
    if (['ArrowRight','ArrowLeft'].includes(event.key)) { event.preventDefault(); moveNotebook(event.key === 'ArrowRight'?1:-1); }
  });

  // Social campaign sequences keep native swipe, with keyboard support.
  $$('.campaign-carousel').forEach(track => track.addEventListener('keydown',event=>{if(event.target!==track||!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();track.scrollBy({left:(event.key==='ArrowRight'?1:-1)*track.clientWidth*.8,behavior:isPaused()?'instant':'smooth'});}));

  // No video is requested until needed; offscreen and background videos pause.
  function loadVideo(video) {
    if (video.dataset.src && !video.getAttribute('src')) { video.src = video.dataset.src; video.load(); }
  }
  function playVideo(video) {
    if (isPaused() || slowConnection || document.hidden) return;
    loadVideo(video);
    video.play().then(() => video.parentElement.classList.add('is-playing')).catch(() => {});
  }
  function pauseVideo(video) { video.pause(); video.parentElement?.classList.remove('is-playing'); }
  $$('[data-hover-video]').forEach(video => {
    const parent = video.parentElement;
    parent.addEventListener('pointerenter', () => { if (finePointer.matches) playVideo(video); });
    parent.addEventListener('pointerleave', () => pauseVideo(video));
    parent.addEventListener('focusin', () => playVideo(video));
    parent.addEventListener('focusout', () => pauseVideo(video));
  });
  function updatePreviewButton(button) {
    const video=$('video',button.closest('.project'));
    if(!video)return;
    const playing=!video.paused&&!video.ended;
    button.setAttribute('aria-pressed',String(playing));
    const key=playing?'work.previewPause':'work.preview';
    const copy=translate(key);
    button.textContent=copy===key?(playing?'Pause preview':'Play preview'):copy;
  }
  $$('[data-work-preview]').forEach(button=>{
    const video=$('video',button.closest('.project'));
    if(!video)return;
    button.addEventListener('click',()=>{
      if(!video.paused&&!video.ended){video.pause();return;}
      loadVideo(video);
      if(video.ended)video.currentTime=0;
      video.play().then(()=>video.parentElement.classList.add('is-playing')).catch(()=>{});
    });
    ['play','pause','ended'].forEach(event=>video.addEventListener(event,()=>updatePreviewButton(button)));
  });
  const ambient = $$('[data-ambient-video]');
  const videoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && video.hasAttribute('data-ambient-video') && window.innerWidth > 700) playVideo(video);
      else if (!entry.isIntersecting) pauseVideo(video);
    });
  },{threshold:.15}) : null;
  $$('[data-hover-video],[data-ambient-video]').forEach(video => videoObserver?.observe(video));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) $$('video').forEach(pauseVideo);
    else ambient.forEach(video => { const r=video.getBoundingClientRect(); if(r.bottom>0 && r.top<innerHeight && innerWidth>700) playVideo(video); });
  });

  // The spatial module owns the signature timeline; this control is shared by the site.
  function buildMotion() {
    document.body.classList.toggle('motion-paused',isPaused());
    document.documentElement.classList.toggle('motion-paused',isPaused());
    if (isPaused()) $$('video').forEach(pauseVideo);
    updateMotionButton();
    document.dispatchEvent(new CustomEvent('bymou:motionchange'));
  }
  function updateMotionButton() {
    const button=$('#motion-toggle'); if(!button)return;
    button.setAttribute('aria-pressed',String(isPaused()));
    button.disabled = reduced.matches;
    const label=$('[data-motion-label]',button);
    const key=reduced.matches?'work.reduced':isPaused()?'work.resume':'work.pause';
    label.dataset.i18n=key;
    label.textContent=content?translate(key):(reduced.matches?'Reduced motion':isPaused()?'Enable motion':'Pause motion');
  }
  $('#motion-toggle')?.addEventListener('click',()=>{
    userPaused=!userPaused;
    try{localStorage.setItem('bymou-motion-paused',String(userPaused));}catch(_){}
    buildMotion();
  });
  reduced.addEventListener('change',buildMotion);
  buildMotion();

  // Config-driven resources. No HTML from content files is executed.
  function safeUrl(value) {
    if(typeof value!=='string')return null;
    try{const url=new URL(value,location.origin);if(url.protocol!=='https:' && url.origin!==location.origin)return null;if(url.username||url.password)return null;return url;}catch(_){return null;}
  }
  function renderResources() {
    const list=$('#resource-list');if(!list||!content)return;
    list.replaceChildren();
    (content.resources||[]).forEach((resource,index)=>{
      const url=safeUrl(resource.url);if(!url)return;
      const row=document.createElement('a');row.className='resource-row';row.href=url.href;
      if(url.origin!==location.origin){row.target='_blank';row.rel=resource.affiliate?'noopener noreferrer sponsored':'noopener noreferrer';}
      const n=document.createElement('span');n.className='eyebrow';n.textContent=String(index+1).padStart(2,'0');
      const title=document.createElement('h3');title.textContent=resource.titleKey?translate(resource.titleKey):resource.title;
      const kind=document.createElement('span');kind.className='eyebrow';kind.textContent=resource.kind?translate(resource.kind):(resource.category||'');
      const description=document.createElement('p');description.textContent=resource.descriptionKey?translate(resource.descriptionKey):resource.description?.startsWith('resources.')?translate(resource.description):resource.description;
      const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
      if(resource.affiliate){const disclosure=document.createElement('span');disclosure.textContent=' · Affiliate link';description.append(disclosure);}
      row.append(n,title,kind,description,arrow);list.append(row);
    });
    const hasAffiliate=content.resources?.some(resource=>resource.affiliate);
    const disclosure=$('.resource-disclosure');if(disclosure)disclosure.textContent=translate(hasAffiliate?'resources.affiliateNote':'resources.note');
  }

  // Contact never posts private details to an unconfigured or invented service.
  $('#inquiry-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const form=event.currentTarget;
    if(!form.reportValidity())return;
    const fields=new FormData(form);if(fields.get('website'))return;
    const type=String(fields.get('type')||'Collaboration');
    const subject=`BYMOU — ${type}`;
    const text=`Name: ${fields.get('name')}\nEmail: ${fields.get('email')}\nBrand / company: ${fields.get('company')||'—'}\nCollaboration: ${type}\nBudget: ${fields.get('budget')||'To be discussed'}\n\n${fields.get('message')}`;
    preparedInquiry=`To: mou@bymou.space\nSubject: ${subject}\n\n${text}`;
    $('#inquiry-result').hidden=false;
    $('[data-inquiry-status]').textContent=translate('contact.ready');
    $('#inquiry-copy').value=preparedInquiry;
    window.location.href=`mailto:mou@bymou.space?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  });
  $('[data-copy-inquiry]')?.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(preparedInquiry);$('[data-inquiry-status]').textContent=translate('contact.copied');}
    catch(_){$('#inquiry-copy').focus();$('#inquiry-copy').select();$('[data-inquiry-status]').textContent=translate('contact.copyFailed');}
  });

  $$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  fetch('/data/site.json').then(response=>{if(!response.ok)throw new Error('Content HTTP '+response.status);return response.json();}).then(data=>{
    content=data;applyLanguage();
  }).catch(()=>{
    if($('#resource-list')){
      $('#resource-list').replaceChildren();
      const note=document.createElement('p');note.textContent='The toolkit could not load. Please refresh, or email mou@bymou.space.';$('#resource-list').append(note);
    }
  });

  // Preserve the existing GA4 integration, without tracking local previews.
  if(['bymou.space','www.bymou.space'].includes(location.hostname)){
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    gtag('js',new Date());gtag('config','G-Q428VQGBG2');
    const analytics=document.createElement('script');analytics.async=true;analytics.src='https://www.googletagmanager.com/gtag/js?id=G-Q428VQGBG2';document.head.append(analytics);
  }
})();
