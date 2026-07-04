;(function () {
  'use strict';

  var chapter = document.querySelector('.horizontal-chapter');
  var chapterTrack = chapter ? chapter.querySelector('.horizontal-chapter-track') : null;
  var section = document.querySelector('.video-carousel-section');
  if (!section) return;

  var track = section.querySelector('.video-carousel-track');
  var items = Array.prototype.slice.call(section.querySelectorAll('.video-carousel-item'));
  var modal = section.querySelector('.video-carousel-modal');
  var modalVideo = section.querySelector('.video-carousel-modal-video');
  var closeButton = section.querySelector('.video-carousel-close');
  var count = items.length;
  var radius = 680;
  var angleStep = count ? 360 / count : 0;
  var activeIndex = 0;
  var currentIndex = -1;
  var chapterScrollTrigger = null;


  function isMobileChapter() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function setMobileLayout() {
    if (chapterTrack) chapterTrack.style.transform = '';
    if (track) track.style.transform = '';
    currentIndex = -1;
    items.forEach(function (item) {
      item.style.transform = '';
      item.classList.add('is-front');
      item.setAttribute('aria-current', 'true');
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function layoutCarousel(index) {
    activeIndex = clamp(index, 0, count - 1);
    if (activeIndex === currentIndex) return;
    currentIndex = activeIndex;
    var rotation = activeIndex * angleStep;

    if (track) {
      track.style.transform = 'translateZ(-' + radius + 'px) rotateY(' + rotation.toFixed(3) + 'deg)';
    }

    items.forEach(function (item, itemIndex) {
      var angle = itemIndex * -angleStep;
      var front = itemIndex === activeIndex;

      item.style.transform = 'translate(-50%, -50%) rotateY(' + angle + 'deg) translateZ(' + radius + 'px)';
      item.classList.toggle('is-front', front);
      item.setAttribute('aria-current', front ? 'true' : 'false');
    });
  }

  function setupChapterScroll() {
    if (isMobileChapter()) {
      setMobileLayout();
      return;
    }

    if (!chapter || !chapterTrack || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      layoutCarousel(0);
      return;
    }

    var carouselProgressEnd = 0.72;
    var horizontalTravel = 50;

    gsap.set(chapterTrack, { xPercent: 0 });

    if (chapterScrollTrigger) chapterScrollTrigger.kill();
    chapterScrollTrigger = ScrollTrigger.create({
      trigger: chapter,
      start: 'top top',
      end: function () {
        return '+=' + Math.max(window.innerHeight * 1.7, 1500);
      },
      pin: true,
      pinSpacing: true,
      scrub: 0.9,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: function (self) {
        var progress = self.progress;
        var carouselProgress = clamp(progress / carouselProgressEnd, 0, 1);
        var nextIndex = Math.round(carouselProgress * (count - 1));
        var horizontalProgress = clamp((progress - carouselProgressEnd) / (1 - carouselProgressEnd), 0, 1);

        layoutCarousel(nextIndex);
        gsap.set(chapterTrack, { xPercent: -horizontalTravel * horizontalProgress });
      }
    });
  }

  items.forEach(function (item) {
    var video = item.querySelector('video');
    if (!video) return;

    video.muted = true;
    video.controls = false;
    video.play().catch(function () {});
  });

  section.addEventListener('click', function (event) {
    var item = event.target.closest('.video-carousel-item');
    if (!item || !section.contains(item)) return;
    if (!isMobileChapter() && !item.classList.contains('is-front')) return;

    openModal(item.getAttribute('data-video'));
  });

  function openModal(src) {
    if (!src || !modal || !modalVideo) return;

    modalVideo.src = src;
    modalVideo.muted = false;
    modalVideo.controls = false;
    modalVideo.currentTime = 0;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modalVideo.play().catch(function () {});
  }

  function closeModal() {
    if (!modal || !modalVideo) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
  }

  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', function (event) {
      if (event.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeModal();
  });

  if (isMobileChapter()) {
    setMobileLayout();
  } else {
    layoutCarousel(0);
  }
  setupChapterScroll();

  window.addEventListener('resize', function () {
    if (isMobileChapter()) {
      if (chapterScrollTrigger) {
        chapterScrollTrigger.kill();
        chapterScrollTrigger = null;
      }
      setMobileLayout();
    }
  });
})();
