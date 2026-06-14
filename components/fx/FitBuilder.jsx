'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Shuffle, ArrowUpRight } from 'lucide-react';

// Configurador interactivo: una figura streetwear cuyas prendas (gorra,
// hoodie, pantalón, tenis) se recolorean en vivo. Pensado como showpiece
// sin necesidad de fotos: el usuario "arma su fit" y ve cómo combina.

const SW = {
  negro:  '#191A1D', rosa: '#FF2E7E', blanco: '#ECECEC', gris: '#5B5B62',
  rojo:   '#E11D48', oliva: '#5C6B3C', denim: '#43618F', beige: '#C9B79C',
  crema:  '#E7DCC6', azul: '#2E5BBA',
};

const GARMENTS = [
  { key: 'cap',      label: 'GORRA',     swatches: ['negro', 'rosa', 'blanco', 'rojo'] },
  { key: 'hoodie',   label: 'HOODIE',    swatches: ['negro', 'rosa', 'blanco', 'gris', 'rojo', 'oliva'] },
  { key: 'pants',    label: 'PANTALÓN',  swatches: ['negro', 'denim', 'beige', 'gris', 'blanco'] },
  { key: 'sneakers', label: 'TENIS',     swatches: ['blanco', 'negro', 'rosa', 'crema'] },
];

const DEFAULT = { cap: 'rosa', hoodie: 'negro', pants: 'denim', sneakers: 'blanco' };

function shade() { return 'rgba(0,0,0,.16)'; }

function Figure({ colors }) {
  const c = (k) => SW[colors[k]] || '#888';
  const ST = { stroke: '#0B0B0C', strokeWidth: 4, strokeLinejoin: 'round' };
  return (
    <svg viewBox="0 0 320 470" className="fb-fig" role="img" aria-label="Figura con prendas personalizables">
      {/* sombra piso */}
      <ellipse cx="160" cy="452" rx="92" ry="14" fill="rgba(0,0,0,.35)" />

      {/* PIERNAS / PANTALÓN */}
      <g style={{ transition: 'fill .35s' }}>
        <path d="M118 300 h36 v140 q0 8 -8 8 h-22 q-8 0 -8 -8 z" fill={c('pants')} {...ST} />
        <path d="M166 300 h36 v140 q0 8 -8 8 h-22 q-8 0 -8 -8 z" fill={c('pants')} {...ST} />
        <rect x="118" y="300" width="84" height="14" fill={shade()} />
      </g>

      {/* TENIS */}
      <g style={{ transition: 'fill .35s' }}>
        <path d="M104 440 h44 q10 0 10 10 v8 q0 6 -6 6 h-52 q-6 0 -6 -8 q0 -16 10 -24 z" fill={c('sneakers')} {...ST} />
        <path d="M172 440 h44 q10 8 10 24 q0 8 -6 8 h-52 q-6 0 -6 -6 v-8 q0 -10 10 -10 z" fill={c('sneakers')} {...ST} />
        <rect x="92" y="460" width="64" height="6" fill="#0B0B0C" opacity=".5" />
        <rect x="164" y="460" width="64" height="6" fill="#0B0B0C" opacity=".5" />
      </g>

      {/* MANOS (piel) */}
      <circle cx="76" cy="300" r="15" fill="#C68642" {...ST} />
      <circle cx="244" cy="300" r="15" fill="#C68642" {...ST} />

      {/* HOODIE: cuerpo + mangas + capucha */}
      <g style={{ transition: 'fill .35s' }}>
        {/* mangas */}
        <path d="M96 185 q-30 8 -34 60 l-6 52 q-1 12 12 14 q16 2 18 -12 l8 -60 z" fill={c('hoodie')} {...ST} />
        <path d="M224 185 q30 8 34 60 l6 52 q1 12 -12 14 q-16 2 -18 -12 l-8 -60 z" fill={c('hoodie')} {...ST} />
        {/* cuerpo */}
        <path d="M96 188 q14 -26 64 -26 t64 26 l8 116 q1 14 -13 14 H101 q-14 0 -13 -14 z" fill={c('hoodie')} {...ST} />
        {/* bolsillo canguro */}
        <path d="M118 250 h84 v34 q-42 14 -84 0 z" fill={shade()} />
        {/* cordones */}
        <rect x="150" y="178" width="4" height="34" rx="2" fill="#0B0B0C" opacity=".55" />
        <rect x="166" y="178" width="4" height="34" rx="2" fill="#0B0B0C" opacity=".55" />
        {/* capucha detrás del cuello */}
        <path d="M120 170 q40 -34 80 0 q-40 -16 -80 0 z" fill={shade()} />
      </g>

      {/* CABEZA (piel) */}
      <circle cx="160" cy="132" r="44" fill="#C68642" {...ST} />
      {/* cara */}
      <circle cx="146" cy="130" r="4.5" fill="#0B0B0C" />
      <circle cx="174" cy="130" r="4.5" fill="#0B0B0C" />
      <path d="M150 150 q10 7 20 0" fill="none" stroke="#0B0B0C" strokeWidth="3.5" strokeLinecap="round" />

      {/* GORRA */}
      <g style={{ transition: 'fill .35s' }}>
        <path d="M116 116 q44 -56 88 0 q-44 -20 -88 0 z" fill={c('cap')} {...ST} />
        <path d="M196 112 q34 4 40 18 q-2 8 -12 8 q-22 -2 -32 -14 z" fill={c('cap')} {...ST} />
        <circle cx="160" cy="78" r="6" fill={c('cap')} {...ST} />
      </g>
      {/* estrella en el pecho */}
      <path d="M160 214 l4 11 11 0 -9 7 4 11 -10 -7 -10 7 4 -11 -9 -7 11 0 z" fill="#FF2E7E" opacity=".9" />
    </svg>
  );
}

export default function FitBuilder() {
  const [colors, setColors] = useState(DEFAULT);
  const [active, setActive] = useState('hoodie');

  const setGarment = (key, sw) => setColors(c => ({ ...c, [key]: sw }));
  const randomize = () => {
    const next = {};
    for (const g of GARMENTS) next[g.key] = g.swatches[Math.floor(Math.random() * g.swatches.length)];
    setColors(next);
  };
  const activeG = GARMENTS.find(g => g.key === active);

  return (
    <div className="fb">
      <div className="fb-stage">
        <span className="fb-stage-tag">[ PRUÉBATELO · LIVE ]</span>
        <span className="fb-stage-code">FIT&nbsp;//&nbsp;6IX—01</span>
        <Figure colors={colors} />
        <div className="fb-grain" aria-hidden="true" />
      </div>

      <div className="fb-panel">
        <span className="sx6-tag">/// ARMA TU FIT</span>
        <h2 className="fb-title">DISEÑA<br />TU <span>DROP</span></h2>
        <p className="fb-sub">Elige el color de cada prenda y mira cómo combina. Cuando te guste, ve directo a la tienda.</p>

        {/* selector de prenda */}
        <div className="fb-tabs">
          {GARMENTS.map(g => (
            <button key={g.key} onClick={() => setActive(g.key)} data-cursor="hover"
              className={`fb-tab ${active === g.key ? 'on' : ''}`}>
              {g.label}
              <span className="fb-tab-dot" style={{ background: SW[colors[g.key]] }} />
            </button>
          ))}
        </div>

        {/* swatches de la prenda activa */}
        <div className="fb-swatches">
          {activeG.swatches.map(sw => (
            <button key={sw} onClick={() => setGarment(active, sw)} data-cursor="hover"
              aria-label={sw} title={sw}
              className={`fb-sw ${colors[active] === sw ? 'on' : ''}`}
              style={{ background: SW[sw] }} />
          ))}
        </div>

        <div className="fb-actions">
          <button onClick={randomize} className="fb-rand" data-cursor="hover"><Shuffle size={15} /> RANDOM</button>
          <Link href="/tienda" className="fb-shop" data-cursor="hover">COMPRAR ESTE FIT <ArrowUpRight size={16} /></Link>
        </div>
      </div>

      <style>{`
        .fb { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid var(--dark-4); background: var(--dark); overflow: hidden; }
        .fb-stage { position: relative; min-height: 540px; display: flex; align-items: center; justify-content: center;
          background: radial-gradient(120% 90% at 50% 10%, rgba(255,46,126,.12), transparent 60%), #101012; border-right: 1px solid var(--dark-4); overflow: hidden; }
        .fb-fig { width: min(78%, 360px); height: auto; display: block; animation: fb-bob 4s ease-in-out infinite; will-change: transform; }
        @keyframes fb-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .fb-stage-tag, .fb-stage-code { position: absolute; font-family: var(--font-tech, monospace); font-size: .6rem; letter-spacing: .16em; color: var(--gray); }
        .fb-stage-tag { top: 18px; left: 18px; color: var(--gold); }
        .fb-stage-code { bottom: 18px; right: 18px; }
        .fb-grain { position: absolute; inset: 0; pointer-events: none; opacity: .05; mix-blend-mode: screen;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

        .fb-panel { padding: clamp(28px, 4vw, 52px); display: flex; flex-direction: column; justify-content: center; }
        .fb-title { font-family: var(--font-display); font-size: clamp(2.4rem, 4.5vw, 4rem); color: var(--white); line-height: .86; text-transform: uppercase; margin: 12px 0 14px; }
        .fb-title span { color: transparent; -webkit-text-stroke: 1.5px var(--gold); }
        .fb-sub { color: var(--gray-light); line-height: 1.6; margin-bottom: 26px; max-width: 380px; }

        .fb-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
        .fb-tab { display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border: 1px solid var(--dark-4);
          background: transparent; color: var(--gray-light); font-family: var(--font-tech, monospace); font-size: .64rem; letter-spacing: .12em; cursor: pointer; transition: all .2s; }
        .fb-tab:hover { border-color: var(--gray); color: var(--white); }
        .fb-tab.on { border-color: var(--gold); color: var(--white); background: rgba(255,46,126,.08); }
        .fb-tab-dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid rgba(255,255,255,.25); }

        .fb-swatches { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; }
        .fb-sw { width: 38px; height: 38px; border-radius: 50%; border: 2px solid var(--dark-4); cursor: pointer; transition: transform .18s, border-color .18s; }
        .fb-sw:hover { transform: scale(1.12); }
        .fb-sw.on { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(255,46,126,.25); }

        .fb-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .fb-rand { display: inline-flex; align-items: center; gap: 7px; padding: 14px 18px; border: 1.5px solid var(--white); background: transparent; color: var(--white); font-weight: 800; font-size: .76rem; letter-spacing: .1em; cursor: pointer; transition: all .2s; }
        .fb-rand:hover { background: var(--white); color: #0B0B0C; }
        .fb-shop { display: inline-flex; align-items: center; gap: 8px; padding: 14px 20px; background: var(--gold); color: #0B0B0C; font-weight: 800; font-size: .76rem; letter-spacing: .1em; text-transform: uppercase; transition: background .2s, gap .2s; }
        .fb-shop:hover { background: #fff; gap: 12px; }

        @media (max-width: 860px) {
          .fb { grid-template-columns: 1fr; }
          .fb-stage { min-height: 420px; border-right: 0; border-bottom: 1px solid var(--dark-4); }
        }
        @media (prefers-reduced-motion: reduce) { .fb-fig { animation: none; } }
      `}</style>
    </div>
  );
}
