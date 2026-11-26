(() => {
  const frame = document.querySelector('.snap-character-ad');
  const video = frame.querySelector('video');
  const controls = frame.querySelector('.snap-film-controls');
  const button = controls.querySelector('button');

  button.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  });

  function updateButton() {
    button.textContent = video.paused ? 'Play' : 'Pause';
  }

  for (const event of ['play', 'pause', 'ended']) video.addEventListener(event, updateButton);
  video.controls = false;
  controls.hidden = false;
})();
