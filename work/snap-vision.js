(() => {
  const video = document.querySelector('.snap-website-film video');
  if (!video || !('IntersectionObserver' in window)) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;

  function syncPlayback() {
    if (visible && !document.hidden && !motion.matches) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= 0.2;
    syncPlayback();
  }, { threshold: 0.2 }).observe(video);
  document.addEventListener('visibilitychange', syncPlayback);
  motion.addEventListener('change', syncPlayback);
})();
