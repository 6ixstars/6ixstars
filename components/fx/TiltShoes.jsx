'use client';
import Link from 'next/link';

// Cards 3D con efecto tilt (inspirado en el CodePen de krautgti): la card se
// inclina siguiendo el mouse, el tenis "sale" flotando en Z al hover, borde
// con glow de color, círculo de fondo y texto fantasma 6IX/DROP.
const SHOES = [
  { name: '6IX AIR · LIME',    img: '/img/shoes/green.webp', color: '#9bdc28' },
  { name: '6IX AIR · AQUA',    img: '/img/shoes/blue.webp',  color: '#1da3c3' },
  { name: '6IX AIR · CRIMSON', img: '/img/shoes/red.webp',   color: '#eb0e2f' },
];

export default function TiltShoes() {
  const tilt = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${px * 24}deg) rotateX(${-py * 24}deg) scale(1.05)`;
  };
  const reset = (e) => { e.currentTarget.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)'; };

  return (
    <div className="tlt-wrap">
      {SHOES.map((s) => (
        <div key={s.name} className="tlt-card" style={{ '--c': s.color }} onMouseMove={tilt} onMouseLeave={reset} data-cursor="hover">
          <h3 className="tlt-name">{s.name}</h3>
          <Link href="/tienda" className="tlt-buy">COMPRAR</Link>
          <div className="tlt-circle" />
          <img className="tlt-shoe" src={s.img} alt={s.name} draggable="false" />
        </div>
      ))}

      <style>{`
        .tlt-wrap { display: flex; justify-content: center; align-items: center; gap: 44px; flex-wrap: wrap; padding: 20px 0 8px; }
        .tlt-card {
          position: relative; width: 300px; height: 400px; border-radius: 22px;
          transform-style: preserve-3d; transition: transform .35s cubic-bezier(.03,.98,.52,.99);
          cursor: pointer; will-change: transform;
          background: radial-gradient(ellipse at right top, color-mix(in srgb, var(--c) 78%, transparent) 0%, #1A1A1D 47%, #1A1A1D 100%);
          border: 1.5px solid color-mix(in srgb, var(--c) 35%, var(--dark-4));
          box-shadow: 0 30px 60px rgba(0,0,0,.55);
        }
        .tlt-card::before {
          content: '6IX'; position: absolute; top: 12px; left: 18px;
          font-family: var(--font-display); font-size: 5.4rem; font-style: italic; color: #fff;
          opacity: 0; transition: .5s; pointer-events: none;
        }
        .tlt-card::after {
          content: '6IX'; position: absolute; bottom: 8px; right: 16px;
          font-family: var(--font-display); font-size: 4rem; font-style: italic; color: #fff;
          opacity: 0; transition: .5s; pointer-events: none;
        }
        .tlt-card:hover::before, .tlt-card:hover::after { opacity: .06; }

        .tlt-name {
          position: absolute; top: 0; left: 0; width: 100%; text-align: center;
          color: var(--white); font-family: var(--font-display); text-transform: uppercase;
          font-size: 1.35rem; letter-spacing: .02em;
          transform: translateZ(70px); opacity: 0; transition: .5s; z-index: 12;
        }
        .tlt-card:hover .tlt-name { top: 32px; opacity: 1; }

        .tlt-buy {
          position: absolute; bottom: 0; left: 50%;
          transform: translateX(-50%) translateZ(70px);
          background: var(--c); color: #0B0B0C; padding: 12px 28px; border-radius: 30px;
          font-family: var(--font-sans); font-weight: 800; font-size: .76rem; letter-spacing: .1em;
          opacity: 0; transition: .5s; z-index: 12;
        }
        .tlt-card:hover .tlt-buy { bottom: 28px; opacity: 1; }

        .tlt-circle {
          position: absolute; top: 50%; left: 50%; width: 210px; height: 210px; border-radius: 50%;
          background: var(--c); transition: .5s; z-index: 5;
          transform: translate(-50%, -50%) translateZ(0);
          box-shadow: 0 0 60px color-mix(in srgb, var(--c) 50%, transparent);
        }
        .tlt-card:hover .tlt-circle { transform: translate(-50%, -50%) translateZ(35px); }

        .tlt-shoe {
          position: absolute; top: 50%; left: 50%; max-width: 290px; height: auto;
          transform: translate(-50%, -50%) translateZ(0) rotate(-18deg);
          transition: .5s; z-index: 11; pointer-events: none;
          filter: drop-shadow(0 26px 26px rgba(0,0,0,.55));
        }
        .tlt-card:hover .tlt-shoe { transform: translate(-50%, -50%) translateZ(95px) rotate(-18deg); }

        @media (max-width: 640px) {
          .tlt-wrap { gap: 28px; }
          .tlt-card { width: 280px; height: 380px; }
        }
        @media (prefers-reduced-motion: reduce) { .tlt-card { transition: none; } }
      `}</style>
    </div>
  );
}
