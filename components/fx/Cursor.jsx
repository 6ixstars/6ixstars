'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Cursor personalizado: un aro (mix-blend difference) que sigue con spring
// + un punto rosa exacto. Crece sobre elementos interactivos. Sólo se activa
// en punteros finos (desktop) y si el usuario no pidió menos movimiento.
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 450, damping: 38, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 450, damping: 38, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');

    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    const over = (e) => {
      const t = e.target;
      setHover(!!(t.closest && t.closest('a, button, input, [data-cursor="hover"]')));
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="fx-cursor-ring"
        style={{ x: rx, y: ry }}
        animate={{ scale: hover ? 2.4 : 1, opacity: hover ? 0.9 : 0.7 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      />
      <motion.div className="fx-cursor-dot" style={{ x, y }} />
      <style>{`
        .has-custom-cursor, .has-custom-cursor * { cursor: none !important; }
        .fx-cursor-ring, .fx-cursor-dot {
          position: fixed; top: 0; left: 0; pointer-events: none; z-index: 99999;
          border-radius: 50%; will-change: transform;
        }
        .fx-cursor-ring {
          width: 36px; height: 36px; margin: -18px 0 0 -18px;
          border: 1.5px solid var(--gold); mix-blend-mode: difference;
        }
        .fx-cursor-dot {
          width: 6px; height: 6px; margin: -3px 0 0 -3px; background: var(--gold);
        }
      `}</style>
    </>
  );
}
