(() => {
  const heading = document.querySelector('#work #selected-title');
  const enabled = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  if (!heading || !Element.prototype.animate) return;

  const text = heading.firstChild;
  let active;
  let previousX;
  let previousY;

  function reset() {
    if (!active) return;
    active.remove();
    active = undefined;
    heading.style.removeProperty('color');
  }

  function makeCopy(layer, color, clipPath) {
    const copy = heading.cloneNode(true);
    copy.removeAttribute('id');
    Object.assign(copy.style, {
      position: 'absolute', inset: '0', margin: '0', color, clipPath,
    });
    layer.append(copy);
    return copy;
  }

  heading.addEventListener('pointermove', event => {
    if (!enabled.matches || active || event.pointerType !== 'mouse' || text?.nodeType !== Node.TEXT_NODE) return;
    const dx = previousX === undefined ? event.movementX : event.clientX - previousX;
    const dy = previousY === undefined ? event.movementY : event.clientY - previousY;
    previousX = event.clientX;
    previousY = event.clientY;
    if (Math.hypot(dx, dy) < 2) return;

    const bounds = heading.getBoundingClientRect();
    const range = document.createRange();
    let glyph;
    for (let i = 0; i < text.length; i++) {
      range.setStart(text, i);
      range.setEnd(text, i + 1);
      const rect = range.getBoundingClientRect();
      if (text.data[i].trim() && event.clientX >= rect.left && event.clientX < rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom) {
        glyph = rect;
        break;
      }
    }
    if (!glyph) return;

    const x = glyph.left - bounds.left;
    const y = glyph.top - bounds.top;
    const w = glyph.width;
    const h = glyph.height;
    const ink = getComputedStyle(heading).color;
    const layer = document.createElement('div');
    layer.className = 'wi-gravity-layer';
    layer.setAttribute('aria-hidden', 'true');
    const subtitle = heading.nextElementSibling;
    const clearance = Math.max(0, (subtitle?.getBoundingClientRect().top ?? bounds.bottom) - bounds.bottom);
    Object.assign(layer.style, {
      left: heading.offsetLeft + 'px',
      top: heading.offsetTop + 'px',
      width: bounds.width + 'px',
      height: bounds.height + 'px',
      clipPath: `inset(-12px -8px -${Math.max(0, clearance - 3)}px -8px)`,
    });
    heading.after(layer);
    active = layer;

    const rectangle = (left, top, width, height) =>
      `M ${left} ${top} h ${width} v ${height} h ${-width} Z`;
    const full = rectangle(-12, -16, bounds.width + 24, bounds.height + 48);
    makeCopy(layer, ink, `path(evenodd, "${full} ${rectangle(x, y, w, h)}")`);

    const shards = [
      [[0, 0], [.52, 0], [.41, .42], [0, .55]],
      [[.52, 0], [1, 0], [1, .36], [.41, .42]],
      [[0, .55], [.41, .42], [.56, .74], [0, 1]],
      [[.41, .42], [1, .36], [1, .65], [.56, .74]],
      [[.56, .74], [1, .65], [1, 1], [0, 1]],
    ];
    heading.style.color = 'transparent';
    const animations = shards.map((points, index) => {
      const polygon = points.map(([px, py]) => `${x + px * w}px ${y + py * h}px`).join(',');
      const copy = makeCopy(layer, ink, `polygon(${polygon})`);
      copy.style.transformOrigin = `${x + w * .5}px ${y + h * .5}px`;
      const drift = Math.max(-20, Math.min(20, dx * .45)) + (index - 2) * 3;
      const drop = Math.min(55, h * (.23 + index * .035));
      const tilt = (index - 2) * 5 + Math.sign(dx) * 3;
      const pose = (tx, ty, rotation) => `translate(${tx}px,${ty}px) rotate(${rotation}deg)`;
      return copy.animate([
        { offset: 0, transform: 'none', easing: 'cubic-bezier(.38,.02,.86,.48)' },
        { offset: .35, transform: pose(drift, drop, tilt), easing: 'ease-out' },
        { offset: .43, transform: pose(drift, drop - 4, tilt * .9), easing: 'ease-in' },
        { offset: .51, transform: pose(drift, drop, tilt) },
        { offset: .62, transform: pose(drift, drop, tilt), easing: 'cubic-bezier(.22,1,.36,1)' },
        { offset: 1, transform: 'none' },
      ], { duration: 920, delay: index * 14, fill: 'both' }).finished;
    });
    Promise.allSettled(animations).then(() => { if (active === layer) reset(); });
  });
  heading.addEventListener('pointerleave', () => { previousX = previousY = undefined; });
  enabled.addEventListener('change', reset);
  window.addEventListener('resize', reset, { passive: true });
})();
