'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

// Flipbook 3D: páginas (front/back) que se hojean al click. Adaptado del
// CodePen "book gallery" al tema oscuro de 6ixstars, con las fotos del drop.
const PAGES = [
  ['/img/gen/look-01.webp', '/img/gen/look-02.webp'],
  ['/img/gen/look-03.webp', '/img/gen/cat-buzos.webp'],
  ['/img/gen/cat-jeans.webp', '/img/gen/cat-camisas.webp'],
  ['/img/gen/cat-conjuntos.webp', '/img/gen/cat-bermudas.webp'],
  ['/img/gen/hero-model.webp', '/img/gen/spotlight.webp'],
];

export default function BookGallery() {
  const [open, setOpen] = useState(() => new Set());

  const toggle = (i) => (e) => {
    e.stopPropagation();
    setOpen(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };
  const closeAll = () => setOpen(new Set());

  return (
    <section className="bgx-scene" onClick={closeAll}>
      <div className="bgx-typo" aria-hidden="true"><span>STREET</span><span>WEAR</span></div>

      <div className={`bgx-book ${open.size ? 'is-open-book' : ''}`}>
        {PAGES.map(([front, back], i) => (
          <div key={i} className={`bgx-page ${open.has(i) ? 'is-open' : ''}`} style={{ '--i': i }} onClick={toggle(i)}>
            <img src={front} alt="" draggable="false" />
            <img src={back} alt="" draggable="false" />
          </div>
        ))}
      </div>

      <div className="bgx-bottom" onClick={(e) => e.stopPropagation()}>
        <Link href="/tienda" className="bgx-cta">VER LA TIENDA <ArrowUpRight size={18} /></Link>
        <span className="bgx-hint">★ CLICK PARA HOJEAR EL DROP ★</span>
      </div>

      <style>{`
        @property --page-rotate { syntax: "<angle>"; inherits: true; initial-value: 0deg; }
        @property --spine-shift { syntax: "<length>"; inherits: true; initial-value: 0px; }

        .bgx-scene {
          position: relative; width: 100%; height: 100svh; min-height: 600px;
          perspective: 1000px; transform-style: preserve-3d;
          display: flex; justify-content: center; align-items: center; overflow: hidden;
          background: #0B0B0C; border-bottom: 1px solid var(--dark-4);
        }
        .bgx-scene::before {
          content: ''; position: absolute; inset: 0;
          background: url('/img/gen/campaign.webp') center/cover no-repeat;
          opacity: .14; filter: grayscale(.3);
        }
        .bgx-scene::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(60% 55% at 50% 48%, rgba(255,46,126,.14), transparent 62%),
                      linear-gradient(0deg, #0B0B0C 4%, transparent 50%);
        }

        .bgx-typo {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 100%; padding: 0 4vw; z-index: 1; pointer-events: none;
          display: flex; justify-content: space-between; align-items: center;
          font-family: var(--font-display); text-transform: uppercase; line-height: .8;
          font-size: clamp(3.5rem, 15vw, 14rem);
          color: transparent; -webkit-text-stroke: 2px rgba(255,255,255,.16);
        }
        .bgx-typo span:last-child { color: transparent; -webkit-text-stroke: 2px rgba(255,46,126,.4); }

        .bgx-book {
          position: relative; width: 220px; height: 320px; z-index: 10;
          perspective: 1000px; transform-style: preserve-3d;
          display: flex; justify-content: center; align-items: center;
          --spine-shift: 0px; transform: translateX(var(--spine-shift));
          transition: --spine-shift .5s ease;
        }
        .bgx-book.is-open-book { --spine-shift: 110px; }

        .bgx-page {
          position: absolute; width: 220px; height: 320px;
          perspective: 1000px; transform-style: preserve-3d;
          transform-origin: left center; --page-rotate: 0deg;
          transform: rotateY(var(--page-rotate));
          transition: --page-rotate .55s ease-in-out, z-index 0s;
          transition-delay: calc((4 - var(--i)) * .1s), calc((4 - var(--i)) * .1s + .25s);
          box-shadow: 4px 6px 24px rgba(0,0,0,.5); cursor: pointer;
          z-index: calc(10 - var(--i)); border: 1px solid var(--dark-4);
        }
        .bgx-page.is-open {
          --page-rotate: -180deg; transition-delay: 0s, 0s; z-index: calc(20 + var(--i));
        }
        .bgx-page img {
          width: 100%; height: 100%; object-fit: cover;
          position: absolute; top: 0; left: 0; background: #141416; backface-visibility: hidden;
        }
        .bgx-page img:nth-child(2) { transform: rotateY(180deg) translateZ(1px); z-index: 1; }

        .bgx-bottom {
          position: absolute; bottom: clamp(28px, 6vh, 60px); left: 50%; transform: translateX(-50%);
          z-index: 20; display: flex; flex-direction: column; align-items: center; gap: 14px;
        }
        .bgx-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--gold); color: #0B0B0C; padding: 16px 28px;
          font-family: var(--font-sans); font-weight: 800; font-size: .82rem; letter-spacing: .1em; text-transform: uppercase;
          box-shadow: 0 10px 30px rgba(255,46,126,.3); transition: background .2s, transform .2s, gap .2s;
        }
        .bgx-cta:hover { background: #fff; transform: translateY(-2px); gap: 12px; }
        .bgx-hint { font-family: var(--font-tech, monospace); font-size: .6rem; letter-spacing: .26em; color: var(--gray); }

        @media (max-width: 600px) {
          .bgx-book, .bgx-page { width: 180px; height: 260px; }
          .bgx-book.is-open-book { --spine-shift: 90px; }
        }
      `}</style>
    </section>
  );
}
