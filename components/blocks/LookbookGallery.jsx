'use client';
// Sección "Galería" — grid interactivo 3×3 (estilo Manthey Racing / CodePen).
// Al hacer hover sobre una foto, su columna Y su fila se expanden (60/15/15)
// mientras el resto se atenúa en B/N; la activa recupera color y hace zoom.
// 100% CSS con :has() + container queries. Paleta y tipografías de la marca.
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

// 9 looks → grid de 3 columnas × 3 filas.
const COLS = [
  ['/img/gen/look-01.webp', '/img/gen/look-02.webp', '/img/gen/look-03.webp'],
  ['/img/gen/look-04.webp', '/img/gen/look-05.webp', '/img/gen/look-06.webp'],
  ['/img/gen/look-07.webp', '/img/gen/look-08.webp', '/img/gen/look-09.webp'],
];

function Cell({ src, n }) {
  return (
    <article className="gx-cell" data-cursor="hover">
      <img src={src} alt={`Look ${String(n).padStart(2, '0')}`} loading="lazy" />
      <span className="gx-idx">[ {String(n).padStart(2, '0')} ]</span>
    </article>
  );
}

export default function LookbookGallery() {
  let counter = 0;
  return (
    <section className="lookbook-21">
      <div className="container lk-head">
        <span className="lk-tag">/// EDITORIAL · COL. 2026</span>
        <h2 className="lk-title">GALERÍA <span>2026</span></h2>
        <p className="lk-sub">La calle como pasarela. Pasa el cursor — la pieza cobra vida.</p>
      </div>

      <div className="gx-grid">
        <div className="gx-cols">
          {COLS.map((col, ci) => (
            <div className="gx-col" key={ci}>
              {col.map((src) => {
                counter += 1;
                return <Cell key={src} src={src} n={counter} />;
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="container gx-foot">
        <Link href="/tienda" className="sx6-btn sx6-btn-pink" data-cursor="hover">
          VER COLECCIÓN COMPLETA <ArrowUpRight size={18} />
        </Link>
      </div>

      <style>{`
        .lookbook-21 { background: var(--black); padding: 96px 0 80px; overflow: hidden; }
        .lookbook-21 .lk-head { text-align: center; margin-bottom: 48px; }
        .lk-tag { display:inline-block; font-family: var(--font-tech); font-size:.64rem; letter-spacing:.2em; color: var(--gold); border:1px solid var(--dark-4); padding:5px 10px; margin-bottom:16px; }
        .lk-title { font-family: var(--font-display); font-size: clamp(2.8rem, 9vw, 7rem); color: var(--white); line-height:.86; margin:0; text-transform:uppercase; }
        .lk-title span { color: transparent; -webkit-text-stroke: 2px var(--gold); }
        .lk-sub { max-width: 460px; margin: 18px auto 0; color: var(--gray-light); line-height:1.6; }

        /* ---------- GRID 3×3 EXPANDIBLE ---------- */
        .gx-grid {
          position: relative;
          width: min(92vw, 720px);
          aspect-ratio: 1;
          margin: 0 auto;
          container-type: size;
        }
        /* Glow rosa de marca detrás del grid */
        .gx-grid::before {
          content: '';
          position: absolute; inset: -6%;
          background: radial-gradient(circle at 50% 45%, rgba(238,177,195,.18), transparent 62%);
          filter: blur(60px);
          z-index: 0;
          transition: background .5s ease-in-out;
        }
        .gx-grid:hover::before { background: radial-gradient(circle at 50% 45%, rgba(238,177,195,.10), transparent 60%); }

        /* Columnas */
        .gx-cols {
          position: relative; z-index: 1;
          display: grid;
          height: 100%;
          gap: 4cqmin;
          grid-template-columns: 30cqmin 30cqmin 30cqmin;
          transition: grid-template-columns .55s cubic-bezier(.16,1,.3,1);
        }
        .gx-cols:has(> .gx-col:nth-child(1):hover) { grid-template-columns: 60cqmin 15cqmin 15cqmin; }
        .gx-cols:has(> .gx-col:nth-child(2):hover) { grid-template-columns: 15cqmin 60cqmin 15cqmin; }
        .gx-cols:has(> .gx-col:nth-child(3):hover) { grid-template-columns: 15cqmin 15cqmin 60cqmin; }

        /* Filas (dentro de cada columna) */
        .gx-col {
          display: grid;
          gap: 4cqmin;
          grid-template-rows: 30cqmin 30cqmin 30cqmin;
          transition: grid-template-rows .55s cubic-bezier(.16,1,.3,1);
        }
        .gx-col:has(> .gx-cell:nth-child(1):hover) { grid-template-rows: 60cqmin 15cqmin 15cqmin; }
        .gx-col:has(> .gx-cell:nth-child(2):hover) { grid-template-rows: 15cqmin 60cqmin 15cqmin; }
        .gx-col:has(> .gx-cell:nth-child(3):hover) { grid-template-rows: 15cqmin 15cqmin 60cqmin; }

        /* Celdas */
        .gx-cell {
          position: relative; margin: 0;
          overflow: hidden;
          border-radius: 14px;
          cursor: pointer;
          border: 1px solid var(--dark-4);
          background: #101012;
          box-shadow: 0 14px 38px rgba(0,0,0,.5);
          transition: border-color .5s;
        }
        .gx-cell img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: filter .55s ease-in-out, transform .55s ease-in-out;
          filter: saturate(.25) contrast(1.05) brightness(1);
        }
        /* Al hacer hover en el grid: todas se atenúan en B/N */
        .gx-cols:hover .gx-cell img { filter: saturate(0) contrast(1.2) brightness(.45); }
        /* La activa: color pleno + zoom (con leve delay para acompañar la expansión) */
        .gx-cols:hover .gx-cell:hover img {
          filter: saturate(1) contrast(1.08) brightness(1);
          transform: scale(1.12);
          transition-delay: .25s;
        }
        .gx-cols:hover .gx-cell:hover { border-color: var(--gold); box-shadow: 0 22px 54px rgba(0,0,0,.6), 0 0 32px rgba(238,177,195,.25); }

        /* Índice mono */
        .gx-idx {
          position: absolute; top: 10px; left: 12px; z-index: 2;
          font-family: var(--font-tech); font-size: .58rem; letter-spacing: .14em;
          color: var(--white); background: rgba(11,11,12,.5); backdrop-filter: blur(6px);
          padding: 3px 8px; border-radius: 6px;
          opacity: .8; transition: opacity .4s, color .4s;
        }
        .gx-cols:hover .gx-idx { opacity: 0; }
        .gx-cols:hover .gx-cell:hover .gx-idx { opacity: 1; color: var(--gold); }

        /* ---------- FOOT ---------- */
        .gx-foot { display: flex; justify-content: center; margin-top: 48px; }

        /* ---------- RESPONSIVE: grid simple sin expansión ---------- */
        @media (max-width: 760px) {
          .gx-grid { width: 100%; aspect-ratio: auto; container-type: normal; }
          .gx-grid::before { display: none; }
          .gx-cols,
          .gx-cols:has(> .gx-col:nth-child(1):hover),
          .gx-cols:has(> .gx-col:nth-child(2):hover),
          .gx-cols:has(> .gx-col:nth-child(3):hover) { grid-template-columns: 1fr 1fr 1fr; gap: 8px; height: auto; }
          .gx-col,
          .gx-col:has(> .gx-cell:nth-child(1):hover),
          .gx-col:has(> .gx-cell:nth-child(2):hover),
          .gx-col:has(> .gx-cell:nth-child(3):hover) { grid-template-rows: auto auto auto; gap: 8px; }
          .gx-cell { aspect-ratio: 3 / 4; }
          .gx-cell img { filter: saturate(1) contrast(1.05) brightness(1) !important; transform: none !important; }
          .gx-idx { opacity: .85 !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .gx-cols, .gx-col, .gx-cell img { transition: none; }
        }
      `}</style>
    </section>
  );
}
