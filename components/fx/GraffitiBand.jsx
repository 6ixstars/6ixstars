'use client';
import { useRef } from 'react';
import { motion, useScroll, useVelocity, useSpring, useTransform, useMotionValue, useAnimationFrame } from 'framer-motion';

// Banda de graffiti con marquee reactivo a la VELOCIDAD del scroll:
// se mueve sola y acelera / cambia de dirección según cómo scrolleas.
// (Patrón "scroll velocity marquee" — da energía/movimiento.)

const wrapN = (min, max, v) => { const r = max - min; return ((((v - min) % r) + r) % r) + min; };

function Star({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <path d="M50 2 L61 38 L98 38 L68 60 L79 96 L50 74 L21 96 L32 60 L2 38 L39 38 Z" />
    </svg>
  );
}

export default function GraffitiBand({ baseSpeed = 2.2 }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 380 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrapN(-25, 0, v)}%`);
  const dir = useRef(-1);

  useAnimationFrame((t, delta) => {
    let move = dir.current * baseSpeed * (delta / 1000);
    if (factor.get() < 0) dir.current = -1;
    else if (factor.get() > 0) dir.current = 1;
    move += dir.current * move * factor.get();
    baseX.set(baseX.get() + move);
  });

  const Item = () => (
    <span className="gb-item">NUEVOS INGRESOS <Star /> ENVÍO A TODA COLOMBIA <Star /> LAS MEJORES MARCAS <Star /> </span>
  );

  return (
    <div className="gb" aria-hidden="true">
      <motion.div className="gb-track" style={{ x }}>
        {[0, 1, 2, 3].map(i => (
          <div className="gb-copy" key={i}><Item /></div>
        ))}
      </motion.div>

      <style>{`
        .gb { position: relative; overflow: hidden; border-top: 1px solid var(--dark-4); border-bottom: 1px solid var(--dark-4); padding: 20px 0; background: #0B0B0C; }
        .gb::before { content: ''; position: absolute; inset: 0; background: url('/img/graffiti.webp') center / cover; opacity: .55; }
        .gb::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, #0B0B0C, transparent 12%, transparent 88%, #0B0B0C), rgba(11,11,12,.3); }
        .gb-track { position: relative; z-index: 1; display: flex; width: max-content; will-change: transform; }
        .gb-copy { display: flex; }
        .gb-item { display: inline-flex; align-items: center; gap: 16px; font-family: var(--font-display); font-size: 1.6rem; letter-spacing: .02em; text-transform: uppercase; color: #fff; padding: 0 18px; white-space: nowrap; text-shadow: 0 2px 14px rgba(0,0,0,.85), 0 0 3px rgba(0,0,0,.9); }
        .gb-item svg { color: var(--gold); }
      `}</style>
    </div>
  );
}
