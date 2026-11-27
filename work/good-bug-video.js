(() => {
  const players = new Map();
  const visibility = new IntersectionObserver(entries => {
    for (const { target, intersectionRatio } of entries) {
      const player = players.get(target);
      if (!player) continue;
      player.visible = intersectionRatio >= 0.15;
      sync(player);
    }
  }, { threshold: 0.15 });

  function sync({ video, visible, button }) {
    button.hidden = !visible;
    if (visible && !document.hidden) {
      if (!video.getAttribute('src') && video.dataset.src) video.src = video.dataset.src;
      if (video.paused) video.play().catch(() => {});
    } else {
      video.pause();
      video.muted = true;
    }
  }

  function attach(video) {
    if (video.id === 'hero-film' || video.hasAttribute('data-native-video') || players.has(video) || !video.parentElement) return;
    video.defaultMuted = true;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;

    const host = video.parentElement;
    if (getComputedStyle(host).position === 'static') host.classList.add('portfolio-video-host');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'portfolio-video-sound';
    button.setAttribute('aria-label', 'Video sound');
    button.hidden = true;
    host.append(button);
    function update() {
      button.textContent = video.muted ? 'Sound off' : 'Sound on';
      button.setAttribute('aria-pressed', String(!video.muted));
    }
    function position() {
      const frame = host.getBoundingClientRect();
      const rect = video.getBoundingClientRect();
      if (!frame.width || !frame.height) return;
      button.style.right = (frame.right - rect.right) * host.offsetWidth / frame.width + 10 + 'px';
      button.style.bottom = (frame.bottom - rect.bottom) * host.offsetHeight / frame.height + 10 + 'px';
    }
    const resize = new ResizeObserver(position);
    resize.observe(host);
    resize.observe(video);
    const player = { video, button, resize, visible: false };
    players.set(video, player);
    button.onclick = () => {
      if (!player.visible || document.hidden) return;
      for (const other of players.keys()) if (other !== video && !other.muted) other.muted = true;
      video.muted = !video.muted;
      sync(player);
    };
    video.addEventListener('volumechange', update);
    video.addEventListener('play', () => {
      if (!player.visible || document.hidden) sync(player);
    });
    update();
    position();
    visibility.observe(video);
  }

  function scan() {
    for (const [video, player] of players) {
      if (video.isConnected) continue;
      visibility.unobserve(video);
      player.resize.disconnect();
      player.button.remove();
      players.delete(video);
    }
    document.querySelectorAll('video').forEach(attach);
  }
  document.addEventListener('visibilitychange', () => players.forEach(sync));
  new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes, ...record.removedNodes].some(
      node => node.nodeType === 1 && (node.matches('video') || node.querySelector('video'))
    ))) scan();
  }).observe(document.body, { childList: true, subtree: true });
  scan();
})();
