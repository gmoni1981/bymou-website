import React from 'react';
import { createRoot } from 'react-dom/client';
import TextPressure from './TextPressure.jsx';

const mount = document.querySelector('.wi-pressure-mount');
const interactive = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
let root;
function sync() {
  if (!mount) return;
  if (interactive.matches) {
    if (root) return;
    root = createRoot(mount);
    root.render(<TextPressure text="MADE YOU LOOK." fixedTypography fontFamily="BYMOU Pressure" fontUrl=""
      flex={false} italic={false} radius={0.28} smoothing={0.27} clickRipple={false} />);
  } else if (root) {
    root.unmount();
    root = undefined;
  }
}
interactive.addEventListener('change', sync);
sync();
