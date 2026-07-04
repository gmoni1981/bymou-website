;(function () {
  'use strict';

  var translations = {
    en: {
      nav: { work: 'Work', vision: 'Vision', contact: 'Contact' },
      hero: {
        one: 'I DIRECT THINGS THAT DON’T EXIST.',
        two: 'CAMPAIGNS THAT MOVE.',
        three: 'SYSTEMS THAT SELL.',
        four: 'WORLDS PEOPLE REMEMBER.'
      },
      ui: { scroll: 'Scroll', close: 'Close' },
      section2: { heading: 'WHAT DO YOU NEED?' },
      tabs: { ugc: 'UGC', branding: 'BRANDING', ads: 'ADS', web: 'WEB' },
      web: {
        label1: '01 — FASHION PORTFOLIO',
        label2: '02 — IMMERSIVE WORLD',
        label3: '03 — PRODUCT LANDING',
        label4: '04 — HOSPITALITY WEBSITE'
      },
      ticker: {
        text: 'BYMOU CREATES CINEMATIC COMMERCIALS • AI CAMPAIGNS • UGC CONTENT • BRAND FILMS • PRODUCT VISUALS • WEBSITE EXPERIENCES • CREATIVE DIRECTION • MOTION DESIGN •'
      },
      founder: {
        role: 'AI Creative Director',
        p1: 'I create cinematic campaigns, luxury brand systems and digital experiences for modern brands.',
        p2: 'Blending creative direction, AI filmmaking, UGC strategy, advertising concepts and website experiences, I turn ideas into visual worlds designed to stop the scroll and build desire.',
        p3: 'My work combines human taste with advanced AI production, supported by formal training and certifications from Google and Anthropic.',
        p4: 'From concept to final execution, every project is built with one goal: to make brands feel impossible to ignore.'
      },
      project: {
        kicker: 'Commission BYMOU',
        heading: 'WHAT ARE WE CREATING?',
        subheading: 'Select the components of your project.',
        summaryTitle: 'YOUR PROJECT',
        empty: 'Select one or more components.',
        scopeLabel: 'Estimated Scope:',
        scopeValue: 'Custom Production',
        cta: 'START THE CONVERSATION'
      },
      options: {
        ugc: 'UGC CONTENT',
        aiCommercial: 'AI COMMERCIAL',
        productVisuals: 'PRODUCT VISUALS',
        branding: 'BRANDING',
        website: 'WEBSITE',
        socialContent: 'SOCIAL CONTENT',
        aiModel: 'AI MODEL',
        motionDesign: 'MOTION DESIGN',
        creativeDirection: 'CREATIVE DIRECTION'
      },
      footer: { instagram: 'Instagram', linkedin: 'LinkedIn', twitter: 'Twitter', email: 'Email' }
    },
    fr: {
      nav: { work: 'Travail', vision: 'Vision', contact: 'Contact' },
      hero: {
        one: 'JE DIRIGE CE QUI N’EXISTE PAS.',
        two: 'DES CAMPAGNES QUI BOUGENT.',
        three: 'DES SYSTÈMES QUI VENDENT.',
        four: 'DES MONDES DONT ON SE SOUVIENT.'
      },
      ui: { scroll: 'Défiler', close: 'Fermer' },
      section2: { heading: 'DE QUOI AVEZ-VOUS BESOIN ?' },
      tabs: { ugc: 'UGC', branding: 'IDENTITÉ', ads: 'PUBLICITÉ', web: 'WEB' },
      web: {
        label1: '01 — PORTFOLIO MODE',
        label2: '02 — MONDE IMMERSIF',
        label3: '03 — PAGE PRODUIT',
        label4: '04 — SITE HOSPITALITÉ'
      },
      ticker: {
        text: 'BYMOU CRÉE DES FILMS PUBLICITAIRES • CAMPAGNES IA • CONTENU UGC • FILMS DE MARQUE • VISUELS PRODUIT • EXPÉRIENCES WEB • DIRECTION CRÉATIVE • MOTION DESIGN •'
      },
      founder: {
        role: 'Directrice Créative IA',
        p1: 'Je crée des campagnes cinématiques, des systèmes de marque luxe et des expériences digitales pour les marques modernes.',
        p2: 'En mêlant direction créative, film IA, stratégie UGC, concepts publicitaires et expériences web, je transforme les idées en univers visuels conçus pour arrêter le scroll et créer le désir.',
        p3: 'Mon travail combine le goût humain avec une production IA avancée, soutenue par des formations et certifications de Google et Anthropic.',
        p4: 'Du concept à l’exécution finale, chaque projet poursuit un objectif : rendre les marques impossibles à ignorer.'
      },
      project: {
        kicker: 'Commissionner BYMOU',
        heading: 'QUE CRÉONS-NOUS ?',
        subheading: 'Sélectionnez les composants de votre projet.',
        summaryTitle: 'VOTRE PROJET',
        empty: 'Sélectionnez un ou plusieurs composants.',
        scopeLabel: 'Portée estimée :',
        scopeValue: 'Production sur mesure',
        cta: 'COMMENCER LA CONVERSATION'
      },
      options: {
        ugc: 'CONTENU UGC',
        aiCommercial: 'FILM PUBLICITAIRE IA',
        productVisuals: 'VISUELS PRODUIT',
        branding: 'IDENTITÉ',
        website: 'SITE WEB',
        socialContent: 'CONTENU SOCIAL',
        aiModel: 'MODÈLE IA',
        motionDesign: 'MOTION DESIGN',
        creativeDirection: 'DIRECTION CRÉATIVE'
      },
      footer: { instagram: 'Instagram', linkedin: 'LinkedIn', twitter: 'Twitter', email: 'Email' }
    },
    it: {
      nav: { work: 'Lavori', vision: 'Visione', contact: 'Contatto' },
      hero: {
        one: 'DIRIGO COSE CHE NON ESISTONO.',
        two: 'CAMPAGNE CHE SI MUOVONO.',
        three: 'SISTEMI CHE VENDONO.',
        four: 'MONDI CHE RESTANO.'
      },
      ui: { scroll: 'Scorri', close: 'Chiudi' },
      section2: { heading: 'DI COSA HAI BISOGNO?' },
      tabs: { ugc: 'UGC', branding: 'BRANDING', ads: 'ADS', web: 'WEB' },
      web: {
        label1: '01 — PORTFOLIO MODA',
        label2: '02 — MONDO IMMERSIVO',
        label3: '03 — LANDING PRODOTTO',
        label4: '04 — SITO HOSPITALITY'
      },
      ticker: {
        text: 'BYMOU CREA COMMERCIAL CINEMATICI • CAMPAGNE IA • CONTENUTI UGC • BRAND FILM • VISUAL DI PRODOTTO • ESPERIENZE WEB • DIREZIONE CREATIVA • MOTION DESIGN •'
      },
      founder: {
        role: 'Direttrice Creativa IA',
        p1: 'Creo campagne cinematiche, sistemi di brand di lusso ed esperienze digitali per marchi moderni.',
        p2: 'Unendo direzione creativa, filmmaking IA, strategia UGC, concept pubblicitari ed esperienze web, trasformo le idee in mondi visivi pensati per fermare lo scroll e costruire desiderio.',
        p3: 'Il mio lavoro combina gusto umano e produzione IA avanzata, supportata da formazione e certificazioni di Google e Anthropic.',
        p4: 'Dal concept all’esecuzione finale, ogni progetto ha un obiettivo: rendere i brand impossibili da ignorare.'
      },
      project: {
        kicker: 'Commissiona BYMOU',
        heading: 'COSA STIAMO CREANDO?',
        subheading: 'Seleziona i componenti del tuo progetto.',
        summaryTitle: 'IL TUO PROGETTO',
        empty: 'Seleziona uno o più componenti.',
        scopeLabel: 'Ambito stimato:',
        scopeValue: 'Produzione su misura',
        cta: 'INIZIA LA CONVERSAZIONE'
      },
      options: {
        ugc: 'CONTENUTI UGC',
        aiCommercial: 'COMMERCIAL IA',
        productVisuals: 'VISUAL DI PRODOTTO',
        branding: 'BRANDING',
        website: 'SITO WEB',
        socialContent: 'CONTENUTI SOCIAL',
        aiModel: 'MODELLO IA',
        motionDesign: 'MOTION DESIGN',
        creativeDirection: 'DIREZIONE CREATIVA'
      },
      footer: { instagram: 'Instagram', linkedin: 'LinkedIn', twitter: 'Twitter', email: 'Email' }
    }
  };

  var currentLang = 'en';
  var selected = [];
  var section = document.querySelector('.project-builder-section');
  var buttons = section ? Array.prototype.slice.call(section.querySelectorAll('.project-option')) : [];
  var summaryList = section ? section.querySelector('.project-summary-list') : null;
  var langButtons = Array.prototype.slice.call(document.querySelectorAll('.language-option'));

  function getText(lang, path) {
    return path.split('.').reduce(function (value, key) {
      return value && value[key];
    }, translations[lang]) || path;
  }

  function renderSummary() {
    if (!summaryList) return;

    if (!selected.length) {
      summaryList.innerHTML = '<li>' + getText(currentLang, 'project.empty') + '</li>';
      return;
    }

    summaryList.innerHTML = selected.map(function (key) {
      return '<li>✓ ' + getText(currentLang, 'options.' + key) + '</li>';
    }).join('');
  }

  function applyLanguage(lang) {
    currentLang = translations[lang] ? lang : 'en';
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      node.textContent = getText(currentLang, node.getAttribute('data-i18n'));
    });

    buttons.forEach(function (button) {
      var key = button.getAttribute('data-project-key');
      if (key) button.setAttribute('data-project-option', getText(currentLang, 'options.' + key));
    });

    langButtons.forEach(function (button) {
      var active = button.getAttribute('data-lang') === currentLang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    try { window.localStorage.setItem('bymou-language', currentLang); } catch (error) {}
    renderSummary();
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-project-key');
      var active = button.classList.toggle('is-selected');
      button.setAttribute('aria-pressed', active ? 'true' : 'false');

      if (active) {
        selected.push(key);
      } else {
        selected = selected.filter(function (item) {
          return item !== key;
        });
      }

      renderSummary();
    });

    button.setAttribute('aria-pressed', 'false');
  });

  langButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      applyLanguage(button.getAttribute('data-lang'));
    });
  });

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  var chapter = document.querySelector('.horizontal-chapter');
  var footer = document.querySelector('#contact');

  function getChapterTrigger() {
    if (typeof ScrollTrigger === 'undefined' || !chapter) return null;
    var triggers = ScrollTrigger.getAll ? ScrollTrigger.getAll() : [];
    return triggers.find(function (trigger) {
      return trigger.trigger === chapter;
    }) || null;
  }

  function getTargetScroll(hash) {
    var chapterTrigger = getChapterTrigger();

    if (hash === '#work' && chapterTrigger) {
      return chapterTrigger.start + 2;
    }

    if (hash === '#vision' && chapterTrigger) {
      return chapterTrigger.end - 4;
    }

    var target = document.querySelector(hash);
    if (!target) return null;

    return target.getBoundingClientRect().top + window.pageYOffset;
  }

  function scrollToTarget(hash) {
    var targetScroll = getTargetScroll(hash);
    if (targetScroll === null) return;

    window.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth'
    });
  }

  function setActiveNav(hash) {
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === hash);
    });
  }

  function updateActiveNav() {
    var active = '';
    var chapterTrigger = getChapterTrigger();
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    if (footer && footer.getBoundingClientRect().top <= window.innerHeight * 0.62) {
      active = '#contact';
    } else if (chapterTrigger && scrollY >= chapterTrigger.start && scrollY <= chapterTrigger.end) {
      active = chapterTrigger.progress < 0.72 ? '#work' : '#vision';
    } else {
      var vision = document.querySelector('#vision');
      var work = document.querySelector('#work');
      if (vision && vision.getBoundingClientRect().top <= window.innerHeight * 0.55) {
        active = '#vision';
      } else if (work && work.getBoundingClientRect().top <= window.innerHeight * 0.55) {
        active = '#work';
      }
    }

    setActiveNav(active);
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      var hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      event.preventDefault();
      scrollToTarget(hash);
    });
  });

  var ticking = false;
  function requestActiveUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      updateActiveNav();
    });
  }

  window.addEventListener('scroll', requestActiveUpdate, { passive: true });
  window.addEventListener('resize', requestActiveUpdate);
  window.addEventListener('load', requestActiveUpdate);

  var initialLang = 'en';
  try {
    initialLang = window.localStorage.getItem('bymou-language') || 'en';
  } catch (error) {}
  applyLanguage(initialLang);
  setTimeout(requestActiveUpdate, 400);
})();
