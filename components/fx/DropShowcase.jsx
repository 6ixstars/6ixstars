'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

// hex → luminancia (0..1) para ajustar el brillo del colorway.
const hexRgb = (h) => {
  const x = (h || '#888').replace('#', '');
  const f = x.length === 3 ? x.split('').map(c => c + c).join('') : x;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lumOf = (h) => { const [r, g, b] = hexRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

// Showcase de producto estilo "Nike 3D": pieza grande al centro en ángulo,
// palabra fantasma gigante detrás, panel izquierdo con color + talla + CTA,
// y arco de miniaturas a la derecha para cambiar de pieza.
export default function DropShowcase({ items = [] }) {
  const [idx, setIdx] = useState(0);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState(1);
  const p = items[idx] || {};
  const N = items.length;

  // Colorway: tiñe la pieza al color elegido (sin fotos por color).
  const swatch = (p.colors || [])[color] || '#888';
  const lum = lumOf(swatch);
  const bright = (0.72 + lum * 0.55).toFixed(2);   // negro → oscuro, blanco → claro
  const tintOpacity = (0.35 + (1 - Math.abs(lum - 0.5) * 2) * 0.4).toFixed(2); // más tinte en colores medios

  return (
    <div className="ds">
      {/* IZQUIERDA — info */}
      <div className="ds-left">
        <span className="ds-tag">DROP 01 · FW26</span>
        <h3 className="ds-name" key={p.slug}>{p.name}</h3>
        <span className="ds-price">{p.price}</span>

        <p className="ds-label">Colores</p>
        <div className="ds-colors">
          {(p.colors || []).map((c, i) => (
            <button key={i} onClick={() => setColor(i)} data-cursor="hover"
              className={`ds-color ${color === i ? 'on' : ''}`} style={{ background: c }} aria-label={`Color ${i + 1}`} />
          ))}
        </div>

        <p className="ds-label">Talla</p>
        <div className="ds-sizes">
          {(p.sizes || []).map((s, i) => (
            <button key={s} onClick={() => setSize(i)} data-cursor="hover"
              className={`ds-size ${size === i ? 'on' : ''}`}>{s}</button>
          ))}
        </div>

        <Link href={`/producto/${p.slug}`} className="ds-buy" data-cursor="hover">
          VER PIEZA <ArrowUpRight size={16} />
        </Link>
      </div>

      {/* CENTRO — pieza grande + texto fantasma */}
      <div className="ds-center">
        <span className="ds-ghost" aria-hidden="true">6IX</span>
        <span className="ds-slab" aria-hidden="true" />
        <div className="ds-hero" key={p.img}>
          <img src={p.img} alt={p.name} draggable="false" style={{ filter: `brightness(${bright}) contrast(1.04)` }} />
          <span className="ds-hero-tint" style={{ background: swatch, opacity: tintOpacity }} aria-hidden="true" />
        </div>
        <span className="ds-index" aria-hidden="true">{String(idx + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</span>
      </div>

      {/* DERECHA — arco de miniaturas */}
      <div className="ds-arc" role="tablist" aria-label="Elegir pieza">
        <span className="ds-arc-line" aria-hidden="true" />
        {items.map((it, i) => {
          const t = N > 1 ? i / (N - 1) : 0.5;
          const push = Math.sin(t * Math.PI) * 30; // bulge hacia afuera
          return (
            <button key={it.slug || i} onClick={() => { setIdx(i); setColor(0); setSize(1); }} role="tab" aria-selected={idx === i}
              data-cursor="hover" className={`ds-thumb ${idx === i ? 'on' : ''}`}
              style={{ top: `calc(6% + ${t * 84}%)`, transform: `translate(${push}px, -50%)` }}
              aria-label={it.name}>
              <img src={it.img} alt="" draggable="false" />
            </button>
          );
        })}
      </div>

      <style>{`
        .ds { position: relative; display: grid; grid-template-columns: 280px 1fr 110px; gap: 24px; align-items: center;
          background: radial-gradient(90% 80% at 60% 20%, rgba(255,46,126,.10), transparent 60%), var(--dark);
          border: 1px solid var(--dark-4); padding: 36px; min-height: 540px; overflow: hidden; }

        /* IZQUIERDA */
        .ds-left { position: relative; z-index: 3; }
        .ds-tag { font-family: var(--font-tech, monospace); font-size: .62rem; letter-spacing: .2em; color: var(--gold); }
        .ds-name { font-family: var(--font-display); font-size: clamp(1.8rem, 3vw, 2.8rem); color: var(--white); text-transform: uppercase; line-height: .95; margin: 12px 0 8px; animation: ds-in .5s ease both; }
        .ds-price { font-family: var(--font-display); font-size: 1.8rem; color: var(--gold); }
        .ds-label { font-family: var(--font-tech, monospace); font-size: .6rem; letter-spacing: .2em; text-transform: uppercase; color: var(--gray); margin: 22px 0 9px; }
        .ds-colors { display: flex; gap: 9px; }
        .ds-color { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--dark-4); cursor: pointer; transition: transform .15s, border-color .15s; }
        .ds-color:hover { transform: scale(1.12); }
        .ds-color.on { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(255,46,126,.25); }
        .ds-sizes { display: flex; gap: 8px; flex-wrap: wrap; }
        .ds-size { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--dark-4); background: transparent; color: var(--gray-light); font-weight: 800; font-size: .82rem; cursor: pointer; transition: all .18s; }
        .ds-size:hover { border-color: var(--gray); color: var(--white); }
        .ds-size.on { background: var(--white); color: #0B0B0C; border-color: var(--white); }
        .ds-buy { display: inline-flex; align-items: center; gap: 8px; margin-top: 26px; padding: 15px 26px; background: var(--gold); color: #0B0B0C; font-weight: 800; font-size: .8rem; letter-spacing: .1em; text-transform: uppercase; transition: background .2s, gap .2s; }
        .ds-buy:hover { background: #fff; gap: 12px; }

        /* CENTRO */
        .ds-center { position: relative; height: 100%; min-height: 440px; display: flex; align-items: center; justify-content: center; }
        .ds-ghost { position: absolute; z-index: 0; font-family: var(--font-display); font-size: clamp(8rem, 22vw, 20rem); color: #fff; opacity: .035; letter-spacing: -.02em; user-select: none; }
        .ds-slab { position: absolute; z-index: 1; width: 64%; height: 30%; top: 52%; left: 8%;
          background: linear-gradient(120deg, var(--gold), #7a1f8f 60%, #43618f); transform: rotate(-18deg) skewX(-10deg); filter: blur(2px); opacity: .55; border-radius: 6px; }
        .ds-hero { position: relative; z-index: 2; width: clamp(280px, 34vw, 460px); aspect-ratio: 4/5; transform: rotate(-7deg);
          box-shadow: 0 50px 90px rgba(0,0,0,.6); border: 1px solid var(--dark-4); overflow: hidden; animation: ds-pop .55s cubic-bezier(.16,1,.3,1) both; }
        .ds-hero img { width: 100%; height: 100%; object-fit: cover; transition: filter .4s; }
        .ds-hero-tint { position: absolute; inset: 0; mix-blend-mode: color; transition: background .4s, opacity .4s; pointer-events: none; }
        .ds-index { position: absolute; z-index: 3; bottom: 6px; left: 50%; transform: translateX(-50%); font-family: var(--font-display); font-size: 1.1rem; color: var(--gray); }
        @keyframes ds-pop { from { opacity: 0; transform: rotate(-7deg) translateY(28px) scale(.96); } to { opacity: 1; transform: rotate(-7deg) translateY(0) scale(1); } }
        @keyframes ds-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

        /* DERECHA — arco */
        .ds-arc { position: relative; z-index: 3; height: 440px; }
        .ds-arc-line { position: absolute; right: 22px; top: 4%; bottom: 4%; width: 1px; background: linear-gradient(transparent, var(--dark-4), transparent); border-radius: 999px; }
        .ds-thumb { position: absolute; right: 0; width: 54px; height: 54px; border-radius: 50%; overflow: hidden; border: 1px solid var(--dark-4); background: #141416; cursor: pointer; padding: 0; transition: width .25s, height .25s, border-color .25s, box-shadow .25s; }
        .ds-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ds-thumb:hover { border-color: var(--gray); }
        .ds-thumb.on { width: 66px; height: 66px; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(255,46,126,.25); }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .ds { grid-template-columns: 1fr; gap: 18px; padding: 24px; min-height: 0; }
          .ds-center { order: -1; min-height: 360px; }
          .ds-arc { height: auto; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
          .ds-arc-line { display: none; }
          .ds-thumb { position: static; transform: none !important; }
          .ds-thumb.on { width: 54px; height: 54px; }
        }
      `}</style>
    </div>
  );
}
