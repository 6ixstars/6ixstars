'use client';
// Sección "Por qué 6ix" — reemplaza la franja de marcas (no vendemos marcas
// ajenas). 3 bloques editoriales: ícono + título display + texto corto, con
// número fantasma, brackets e barrido rosa en hover. Paleta de la marca.
import { Sparkles, BadgeCheck, Flame } from 'lucide-react';

const ITEMS = [
  {
    Icon: Sparkles,
    tag: 'SELECCIÓN',
    title: 'CURADO',
    text: 'Cada pieza elegida a mano. Nada de relleno — solo lo que manda en la calle.',
  },
  {
    Icon: BadgeCheck,
    tag: 'CALIDAD',
    title: '100% ORIGINAL',
    text: 'Productos auténticos y verificados. Sin réplicas, sin excusas.',
  },
  {
    Icon: Flame,
    tag: 'CULTURA',
    title: 'COMUNIDAD 6IX',
    text: 'Más que una tienda: streetwear hecho para la calle, no para el clóset.',
  },
];

export default function WhySix() {
  return (
    <section className="container why6" style={{ paddingTop: 86, paddingBottom: 10 }}>
      <div className="why6-head">
        <span className="why6-kicker">/// POR QUÉ 6IX</span>
        <h2 className="why6-h">STREETWEAR ORIGINAL,<br /><span>CURADO PIEZA A PIEZA</span></h2>
      </div>

      <div className="why6-grid">
        {ITEMS.map(({ Icon, tag, title, text }, i) => (
          <article className="why6-cell" key={title} data-cursor="hover">
            <span className="why6-ghost" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <span className="why6-bracket why6-bracket--tl" aria-hidden="true" />
            <span className="why6-bracket why6-bracket--br" aria-hidden="true" />
            <div className="why6-top">
              <span className="why6-ico"><Icon size={26} strokeWidth={1.6} /></span>
              <span className="why6-tag">/// {tag}</span>
            </div>
            <h3 className="why6-title">{title}</h3>
            <p className="why6-text">{text}</p>
          </article>
        ))}
      </div>

      <style>{`
        .why6-head { margin-bottom: 30px; }
        .why6-kicker { display:inline-block; font-family: var(--font-tech); font-size:.64rem; letter-spacing:.2em; color: var(--gold); border:1px solid var(--dark-4); padding:5px 10px; margin-bottom:14px; }
        .why6-h { font-family: var(--font-display); font-size: clamp(1.9rem, 5vw, 4rem); color: var(--white); line-height:.92; margin:0; text-transform:uppercase; }
        .why6-h span { color: transparent; -webkit-text-stroke: 1.5px var(--gold); }

        .why6-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

        .why6-cell {
          position: relative; overflow: hidden;
          background: var(--dark); border: 1px solid var(--dark-4);
          padding: 28px 26px 30px; margin: 0;
          min-height: 220px;
          display: flex; flex-direction: column;
          transition: border-color .3s, transform .3s;
        }
        /* Barrido rosa en hover */
        .why6-cell::after {
          content: ''; position: absolute; inset: 0; z-index: 0;
          background: var(--gold); transform: translateY(101%);
          transition: transform .45s cubic-bezier(.16,1,.3,1);
        }
        .why6-cell:hover { border-color: var(--gold); }
        .why6-cell:hover::after { transform: translateY(0); }
        .why6-cell > * { position: relative; z-index: 1; }

        .why6-ghost {
          position: absolute; right: -8px; bottom: -34px; z-index: 0 !important;
          font-family: var(--font-display); font-size: 8rem; line-height: 1;
          color: var(--dark-2); transition: color .3s;
        }
        .why6-cell:hover .why6-ghost { color: rgba(11,11,12,.12); }

        .why6-bracket { position: absolute; width: 18px; height: 18px; z-index: 1; opacity: 0; transition: opacity .35s, transform .45s cubic-bezier(.16,1,.3,1); }
        .why6-bracket--tl { top: 12px; left: 12px; border-top: 2px solid #0B0B0C; border-left: 2px solid #0B0B0C; transform: translate(-5px,-5px); }
        .why6-bracket--br { bottom: 12px; right: 12px; border-bottom: 2px solid #0B0B0C; border-right: 2px solid #0B0B0C; transform: translate(5px,5px); }
        .why6-cell:hover .why6-bracket { opacity: 1; transform: translate(0,0); }

        .why6-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: auto; }
        .why6-ico { display: inline-flex; color: var(--gold); transition: color .3s, transform .5s cubic-bezier(.16,1,.3,1); }
        .why6-cell:hover .why6-ico { color: #0B0B0C; transform: rotate(-8deg) scale(1.08); }
        .why6-tag { font-family: var(--font-tech); font-size: .58rem; letter-spacing: .16em; color: var(--gray); transition: color .3s; }
        .why6-cell:hover .why6-tag { color: rgba(11,11,12,.7); }

        .why6-title { font-family: var(--font-display); font-size: clamp(1.6rem, 3vw, 2.4rem); color: var(--white); text-transform: uppercase; line-height: .95; margin: 22px 0 10px; transition: color .3s; }
        .why6-cell:hover .why6-title { color: #0B0B0C; }
        .why6-text { color: var(--gray-light); font-size: .92rem; line-height: 1.55; max-width: 30ch; transition: color .3s; }
        .why6-cell:hover .why6-text { color: rgba(11,11,12,.82); }

        @media (max-width: 760px) {
          .why6-grid { grid-template-columns: 1fr; }
          .why6-cell { min-height: 160px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .why6-cell::after, .why6-ico, .why6-bracket { transition: none; }
        }
      `}</style>
    </section>
  );
}
