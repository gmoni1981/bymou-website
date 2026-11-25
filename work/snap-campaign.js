(() => {
  if (!('IntersectionObserver' in window)) return;

  document.querySelectorAll('.snap-campaign-frame video').forEach(setupFilm);

  function setupFilm(video) {
    const controls = video.parentElement.querySelector('.snap-film-controls');
    const play = controls.querySelector('[data-snap-play]');
    const sound = controls.querySelector('[data-snap-sound]');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    let playbackChoice;

    function syncPlayback() {
      if (inView && !document.hidden && (playbackChoice ?? !reducedMotion.matches)) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }

    play.addEventListener('click', () => {
      playbackChoice = video.paused;
      syncPlayback();
    });

    sound.addEventListener('click', () => {
      video.muted = !video.muted;
    });

    const updatePlayButton = () => { play.textContent = video.paused ? 'Play' : 'Pause'; };
    video.addEventListener('play', updatePlayButton);
    video.addEventListener('pause', updatePlayButton);
    video.addEventListener('volumechange', () => {
      sound.textContent = video.muted ? 'Sound off' : 'Sound on';
      sound.setAttribute('aria-pressed', String(!video.muted));
    });

    new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= 0.2;
      syncPlayback();
    }, { threshold: 0.2 }).observe(video);

    reducedMotion.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    video.controls = false;
    controls.hidden = false;
  }
})();
