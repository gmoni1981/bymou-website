import { useEffect, useState } from 'react';
import TextPressure from './TextPressure.jsx';

const motion = matchMedia('(prefers-reduced-motion: no-preference)');

export default function WorkPressureTitle({ text }) {
  const [animate, setAnimate] = useState(motion.matches);
  useEffect(() => {
    const change = event => setAnimate(event.matches);
    motion.addEventListener('change', change);
    return () => motion.removeEventListener('change', change);
  }, []);

  return (
    <span className="wi-pressure-title">
      <span className="wi-pressure-label">{text}</span>
      {animate && (
        <span className="wi-pressure-mount" aria-hidden="true">
          <TextPressure text={text} fixedTypography fontFamily="BYMOU Pressure" fontUrl=""
            flex={false} italic={false} radius={0.28} smoothing={0.27} clickRipple={false} />
        </span>
      )}
    </span>
  );
}
