(() => {
  const screen = document.querySelector('#studio .studio-phone-screen');
  if (!screen) return;
  const video = screen.querySelector('video');
  const like = screen.querySelector('.studio-reel-like');
  const count = screen.querySelector('.studio-reel-count');
  const save = screen.querySelector('.studio-reel-save');
  const burst = screen.querySelector('.studio-reel-burst');
  const progress = screen.querySelector('.studio-reel-progress span');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const initialCount = 1248;
  const formatCount = new Intl.NumberFormat('en');
  let liked = false;
  let animation;
  let press;
  let lastTap;

  function setLiked(value) {
    liked = value;
    like.setAttribute('aria-pressed', String(liked));
    count.textContent = formatCount.format(initialCount + Number(liked));
  }
  like.addEventListener('click', () => setLiked(!liked));
  save.addEventListener('click', () => save.setAttribute('aria-pressed', String(save.getAttribute('aria-pressed') !== 'true')));

  video.addEventListener('pointerdown', event => {
    if (event.isPrimary && event.button === 0) press = { id:event.pointerId, x:event.clientX, y:event.clientY };
  });
  video.addEventListener('pointercancel', () => { press = lastTap = undefined; });
  video.addEventListener('pointerup', event => {
    const start = press;
    press = undefined;
    if (start?.id !== event.pointerId || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) {
      lastTap = undefined;
      return;
    }
    const now = performance.now();
    if (lastTap && now - lastTap.time < 320 && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 28) {
      setLiked(true);
      lastTap = undefined;
      animation?.cancel();
      if (!reduced.matches) animation = burst.animate([
        { opacity:0, transform:'scale(.7)' },
        { opacity:1, transform:'scale(1.05)', offset:.26 },
        { opacity:1, transform:'scale(1)', offset:.62 },
        { opacity:0, transform:'scale(1.08)' },
      ], { duration:680, easing:'ease-out' });
    } else {
      lastTap = { x:event.clientX, y:event.clientY, time:now };
    }
  });

  const updateProgress = () => {
    const fraction = video.duration > 0 ? video.currentTime / video.duration : 0;
    progress.style.transform = `scaleX(${Math.min(1, fraction)})`;
  };
  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('loadedmetadata', updateProgress);
})();
