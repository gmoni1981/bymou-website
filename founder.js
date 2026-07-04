;(function () {
  'use strict';

  var section = document.querySelector('.founder-section');
  var portrait = section ? section.querySelector('.founder-portrait-wrap') : null;
  if (!section || !portrait) return;

  var targetX = 0;
  var targetY = 0;
  var currentX = 0;
  var currentY = 0;
  var currentScroll = 0;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) return;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updatePointer(event) {
    var rect = section.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;

    targetX = clamp((event.clientX - centerX) / rect.width, -0.5, 0.5) * 24;
    targetY = clamp((event.clientY - centerY) / rect.height, -0.5, 0.5) * 24;
  }

  function updateScrollDepth() {
    var rect = section.getBoundingClientRect();
    var progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
    currentScroll = (progress - 0.5) * 28;
  }

  function render() {
    currentX += (targetX - currentX) * 0.055;
    currentY += (targetY - currentY) * 0.055;
    updateScrollDepth();

    portrait.style.setProperty('--founder-x', currentX.toFixed(3) + 'px');
    portrait.style.setProperty('--founder-y', currentY.toFixed(3) + 'px');
    portrait.style.setProperty('--founder-scroll', currentScroll.toFixed(3) + 'px');

    window.requestAnimationFrame(render);
  }

  section.addEventListener('pointermove', updatePointer);
  section.addEventListener('pointerleave', function () {
    targetX = 0;
    targetY = 0;
  });

  render();
})();
