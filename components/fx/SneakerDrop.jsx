'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

// Sneaker dibujado en SVG con partes separadas que se recolorean DE VERDAD:
// upper (cuerpo), accent (swoosh + talón), sole (suela), lace (cordones).
function Sneaker({ upper, accent, sole = '#ECECEC', lace = '#15151A' }) {
  const ST = { stroke: '#0B0B0C', strokeWidth: 3.5, strokeLinejoin: 'round', strokeLinecap: 'round' };
  return (
    <svg viewBox="0 0 640 380" className="sk" role="img" aria-label="Tenis personalizable">
      {/* sombra */}
      <ellipse cx="320" cy="350" rx="250" ry="20" fill="rgba(0,0,0,.4)" />

      {/* suela exterior (oscura) */}
      <path d="M72 300 C56 304 54 326 78 330 L556 326 C594 324 604 306 588 296 Z" fill="#0B0B0C" />
      {/* mediasuela (blanca) */}
      <path d="M70 268 C52 272 50 300 80 302 L556 298 C598 296 602 276 582 266 C520 258 120 260 70 268 Z" fill={sole} {...ST} />
      <path d="M86 286 L566 282" stroke="rgba(0,0,0,.18)" strokeWidth="3" fill="none" />

      {/* UPPER — cuerpo principal */}
      <path d="M104 268
        C98 222 124 190 186 180
        C256 170 322 170 372 178
        C402 183 426 176 444 158
        C460 142 486 138 504 152
        C528 172 548 214 544 268 Z" fill={upper} {...ST} />

      {/* puntera (tono del upper, sombreada) */}
      <path d="M104 268 C98 224 122 192 184 182 C188 214 186 244 188 268 Z" fill="rgba(0,0,0,.14)" />

      {/* SWOOSH — acento */}
      <path d="M176 250
        C268 222 366 206 470 184
        C490 180 496 196 480 204
        C384 232 286 252 206 264
        C190 266 168 258 176 250 Z" fill={accent} {...ST} />

      {/* panel de cordones */}
      <path d="M300 178 L430 156 L452 196 L326 226 Z" fill={lace} opacity=".9" />
      {/* cordones */}
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={316 + i * 34} y1={208 - i * 12} x2={352 + i * 34} y2={186 - i * 12}
          stroke="#ECECEC" strokeWidth="5" strokeLinecap="round" />
      ))}

      {/* lengüeta */}
      <path d="M430 156 C440 138 462 134 470 150 L452 196 Z" fill={upper} {...ST} />

      {/* collar / talón con acento */}
      <path d="M504 152 C528 168 546 206 544 250 L516 252 C516 214 508 180 496 160 Z" fill={accent} {...ST} />
      {/* tab del talón */}
      <rect x="524" y="150" width="22" height="30" rx="5" fill={lace} {...ST} />
    </svg>
  );
}

const COLORWAYS = [
  { name: 'SHADOW',  dot: '#191A1D', upper: '#1E1F24', accent: '#FF2E7E' },
  { name: 'PINK',    dot: '#FF2E7E', upper: '#FF2E7E', accent: '#15151A' },
  { name: 'CLOUD',   dot: '#ECECEC', upper: '#E9E9EC', accent: '#15151A' },
  { name: 'RED',     dot: '#E11D48', upper: '#E11D48', accent: '#ECECEC' },
  { name: 'AZURE',   dot: '#2E5BBA', upper: '#2E5BBA', accent: '#ECECEC' },
  { name: 'OLIVE',   dot: '#5C6B3C', upper: '#5C6B3C', accent: '#FF2E7E' },
];
const SIZES = ['38', '39', '40', '41', '42', '43'];

export default function SneakerDrop() {
  const [cw, setCw] = useState(0);
  const [size, setSize] = useState(2);
  const c = COLORWAYS[cw];

  return (
    <div className="sd">
      <div className="sd-left">
        <span className="sd-tag">DROP 01 · FW26</span>
        <h3 className="sd-name">6IX RUNNER <span>“{c.name}”</span></h3>
        <span className="sd-price">$329.900</span>

        <p className="sd-label">Colorway</p>
        <div className="sd-colors">
          {COLORWAYS.map((cwy, i) => (
            <button key={cwy.name} onClick={() => setCw(i)} data-cursor="hover"
              className={`sd-color ${cw === i ? 'on' : ''}`} style={{ background: cwy.dot }} aria-label={cwy.name} title={cwy.name} />
          ))}
        </div>

        <p className="sd-label">Talla</p>
        <div className="sd-sizes">
          {SIZES.map((s, i) => (
            <button key={s} onClick={() => setSize(i)} data-cursor="hover" className={`sd-size ${size === i ? 'on' : ''}`}>{s}</button>
          ))}
        </div>

        <Link href="/tienda" className="sd-buy" data-cursor="hover">AÑADIR AL CARRITO <ArrowUpRight size={16} /></Link>
      </div>

      <div className="sd-stage">
        <span className="sd-ghost" aria-hidden="true">6IX</span>
        <span className="sd-slab" aria-hidden="true" />
        <div className="sd-shoe"><Sneaker upper={c.upper} accent={c.accent} /></div>
      </div>

      <style>{`
        .sd { position: relative; display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: center;
          background: radial-gradient(90% 80% at 65% 25%, rgba(255,46,126,.10), transparent 60%), var(--dark);
          border: 1px solid var(--dark-4); padding: 40px; min-height: 520px; overflow: hidden; }
        .sd-left { position: relative; z-index: 3; }
        .sd-tag { font-family: var(--font-tech, monospace); font-size: .62rem; letter-spacing: .2em; color: var(--gold); }
        .sd-name { font-family: var(--font-display); font-size: clamp(1.8rem, 3vw, 2.8rem); color: var(--white); text-transform: uppercase; line-height: .95; margin: 12px 0 8px; }
        .sd-name span { color: var(--gold); }
        .sd-price { font-family: var(--font-display); font-size: 1.9rem; color: var(--gold); }
        .sd-label { font-family: var(--font-tech, monospace); font-size: .6rem; letter-spacing: .2em; text-transform: uppercase; color: var(--gray); margin: 22px 0 9px; }
        .sd-colors { display: flex; gap: 9px; flex-wrap: wrap; }
        .sd-color { width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--dark-4); cursor: pointer; transition: transform .15s, border-color .15s; }
        .sd-color:hover { transform: scale(1.12); }
        .sd-color.on { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(255,46,126,.25); }
        .sd-sizes { display: flex; gap: 8px; flex-wrap: wrap; }
        .sd-size { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--dark-4); background: transparent; color: var(--gray-light); font-weight: 800; font-size: .82rem; cursor: pointer; transition: all .18s; }
        .sd-size:hover { border-color: var(--gray); color: var(--white); }
        .sd-size.on { background: var(--white); color: #0B0B0C; border-color: var(--white); }
        .sd-buy { display: inline-flex; align-items: center; gap: 8px; margin-top: 26px; padding: 15px 26px; background: var(--gold); color: #0B0B0C; font-weight: 800; font-size: .8rem; letter-spacing: .1em; text-transform: uppercase; transition: background .2s, gap .2s; }
        .sd-buy:hover { background: #fff; gap: 12px; }

        .sd-stage { position: relative; min-height: 420px; display: flex; align-items: center; justify-content: center; }
        .sd-ghost { position: absolute; z-index: 0; font-family: var(--font-display); font-size: clamp(9rem, 24vw, 22rem); color: #fff; opacity: .035; user-select: none; }
        .sd-slab { position: absolute; z-index: 1; width: 70%; height: 26%; top: 50%; left: 12%;
          background: linear-gradient(120deg, var(--gold), #7a1f8f 60%, #43618f); transform: rotate(-12deg); filter: blur(3px); opacity: .5; border-radius: 8px; }
        .sd-shoe { position: relative; z-index: 2; width: clamp(320px, 46vw, 580px); animation: sd-float 5s ease-in-out infinite; }
        .sk { width: 100%; height: auto; display: block; filter: drop-shadow(0 30px 40px rgba(0,0,0,.5)); }
        .sk path, .sk rect, .sk line, .sk ellipse { transition: fill .35s; }
        @keyframes sd-float { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-12px) rotate(-1deg); } }

        @media (max-width: 900px) {
          .sd { grid-template-columns: 1fr; gap: 16px; padding: 24px; min-height: 0; }
          .sd-stage { order: -1; min-height: 280px; }
        }
        @media (prefers-reduced-motion: reduce) { .sd-shoe { animation: none; } }
      `}</style>
    </div>
  );
}
