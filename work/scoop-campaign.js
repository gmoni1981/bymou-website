(() => {
  const gallery = document.querySelector('.scoop-campaign');
  if (!gallery) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduced.matches) {
    gallery.setAttribute('data-motion', '');
    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-in', '');
        reveal.unobserve(entry.target);
      }
    }, { threshold: .08 });
    gallery.querySelectorAll('[data-reveal]').forEach(panel => reveal.observe(panel));
  }

  for (const panel of gallery.querySelectorAll('.campaign-film')) {
    const video = panel.querySelector('video');
    const sound = panel.querySelector('[data-campaign-sound]');
    const replay = panel.querySelector('[data-campaign-replay]');
    let visible = false;
    let manual = false;

    function setMuted(muted) {
      video.muted = muted;
      sound.setAttribute('aria-pressed', String(!muted));
      sound.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
    }
    function play() {
      video.play().catch(() => { replay.hidden = false; });
    }
    function sync() {
      if (!visible || document.hidden) {
        video.pause();
        setMuted(true);
        return;
      }
      if ((!reduced.matches || manual) && !video.ended) play();
    }

    setMuted(true);
    if (reduced.matches) replay.hidden = false;
    sound.addEventListener('click', () => {
      setMuted(!video.muted);
      manual = true;
      if (video.ended) video.currentTime = 0;
      play();
    });
    replay.addEventListener('click', () => {
      manual = true;
      video.currentTime = 0;
      play();
    });

    const playback = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: .32 });
    playback.observe(video);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', () => {
      if (reduced.matches) { manual = false; video.pause(); replay.hidden = false; }
      else sync();
    });
  }
})();
