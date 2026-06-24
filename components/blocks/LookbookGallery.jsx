'use client';
// Sección "Galería" — cinta infinita de doble fila (marquee) con las 9 fotos
// verticales. Las filas se deslizan solas en direcciones opuestas, con un
// ligero tilt 3D del conjunto y hover que resalta cada pieza. Sin recortes.
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const ROW_A = ['/img/gen/look-01.webp', '/img/gen/look-02.webp', '/img/gen/look-03.webp', '/img/gen/look-04.webp', '/img/gen/look-05.webp'];
const ROW_B = ['/img/gen/look-06.webp', '/img/gen/look-07.webp', '/img/gen/look-08.webp', '/img/gen/look-09.webp', '/img/gen/look-01.webp'];

function Card({ src, n }) {
  return (
    <figure className="lk-card" data-cursor="hover">
      <img src={src} alt="" loading="lazy" />
      <span className="lk-card-idx">[ {String(n).padStart(2, '0')} ]</span>
      <span className="lk-card-tag">6IX · FW26</span>
    </figure>
  );
}

export default function LookbookGallery() {
  // Duplicamos cada fila ×2 para loop sin costuras
  const rowA = [...ROW_A, ...ROW_A];
  const rowB = [...ROW_B, ...ROW_B];

  return (
    <section className="lookbook-21">
      <div className="container lk-head">
        <span className="lk-tag">/// EDITORIAL · COL. 2026</span>
        <h2 className="lk-title">GALERÍA <span>2026</span></h2>
        <p className="lk-sub">La calle como pasarela. Piezas reales sobre gente real — así se ve el 6ix.</p>
        <Link href="/tienda" className="sx6-btn sx6-btn-pink lk-cta" data-cursor="hover">
          VER COLECCIÓN <ArrowUpRight size={18} />
        </Link>
      </div>

      <div className="lk-stage">
        <div className="lk-rows">
          {/* Fila A → desliza a la izquierda */}
          <div className="lk-row">
            <div className="lk-track lk-track--left">
              {rowA.map((s, i) => <Card key={`a-${i}`} src={s} n={(i % ROW_A.length) + 1} />)}
            </div>
          </div>
          {/* Fila B → desliza a la derecha */}
          <div className="lk-row">
            <div className="lk-track lk-track--right">
              {rowB.map((s, i) => <Card key={`b-${i}`} src={s} n={(i % ROW_B.length) + 6} />)}
            </div>
          </div>
        </div>
        {/* Degradados laterales para que la cinta se desvanezca en los bordes */}
        <div className="lk-fade lk-fade--l" aria-hidden="true" />
        <div className="lk-fade lk-fade--r" aria-hidden="true" />
      </div>

      <style>{`
        .lookbook-21 { background: var(--black); padding: 96px 0 56px; overflow: hidden; }
        .lookbook-21 .lk-head { text-align: center; margin-bottom: 52px; }
        .lk-tag { display:inline-block; font-family: var(--font-tech); font-size:.64rem; letter-spacing:.2em; color: var(--gold); border:1px solid var(--dark-4); padding:5px 10px; margin-bottom:16px; }
        .lk-title { font-family: var(--font-display); font-size: clamp(2.8rem, 9vw, 7rem); color: var(--white); line-height:.86; margin:0; text-transform:uppercase; }
        .lk-title span { color: transparent; -webkit-text-stroke: 2px var(--gold); }
        .lk-sub { max-width: 460px; margin: 18px auto 0; color: var(--gray-light); line-height:1.6; }
        .lk-cta { margin-top: 26px; }

        /* Escenario con perspectiva 3D */
        .lk-stage {
          position: relative;
          perspective: 1600px;
          overflow: hidden;
        }
        .lk-rows {
          display: flex;
          flex-direction: column;
          gap: 18px;
          transform: rotateX(8deg) rotateZ(-2deg);
          transform-style: preserve-3d;
        }

        .lk-row { overflow: hidden; }
        .lk-track {
          display: flex;
          gap: 18px;
          width: max-content;
          will-change: transform;
        }
        .lk-track--left  { animation: lk-scroll-l 38s linear infinite; }
        .lk-track--right { animation: lk-scroll-r 38s linear infinite; }
        .lk-stage:hover .lk-track { animation-play-state: paused; }

        @keyframes lk-scroll-l { from { transform: translateX(0); }      to { transform: translateX(-50%); } }
        @keyframes lk-scroll-r { from { transform: translateX(-50%); }   to { transform: translateX(0); } }

        /* Cards verticales — altura fija, ancho natural (3:4), sin recorte */
        .lk-card {
          position: relative;
          flex-shrink: 0;
          height: 340px;
          aspect-ratio: 3 / 4;
          margin: 0;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--dark-4);
          box-shadow: 0 12px 34px rgba(0,0,0,.5);
          transition: transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s, border-color .4s;
        }
        .lk-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(.25) contrast(1.02);
          transition: filter .4s, transform .6s cubic-bezier(.16,1,.3,1);
        }
        .lk-card:hover {
          transform: translateY(-8px) scale(1.04);
          border-color: var(--gold);
          box-shadow: 0 22px 50px rgba(0,0,0,.6), 0 0 26px rgba(175,31,58,.25);
          z-index: 3;
        }
        .lk-card:hover img { filter: grayscale(0) contrast(1.05); transform: scale(1.06); }

        .lk-card-idx {
          position: absolute; top: 12px; left: 12px;
          font-family: var(--font-tech); font-size: .58rem; letter-spacing: .14em;
          color: var(--white); background: rgba(11,11,12,.6); backdrop-filter: blur(6px);
          padding: 3px 8px; border-radius: 6px;
        }
        .lk-card-tag {
          position: absolute; bottom: 12px; left: 12px;
          font-family: var(--font-tech); font-size: .56rem; letter-spacing: .16em;
          color: var(--gold); background: rgba(11,11,12,.6); backdrop-filter: blur(6px);
          padding: 3px 8px; border-radius: 6px;
          opacity: 0; transform: translateY(6px); transition: opacity .35s, transform .35s;
        }
        .lk-card:hover .lk-card-tag { opacity: 1; transform: translateY(0); }

        /* Degradados de borde */
        .lk-fade { position: absolute; top: 0; bottom: 0; width: 14%; z-index: 4; pointer-events: none; }
        .lk-fade--l { left: 0;  background: linear-gradient(90deg, var(--black), transparent); }
        .lk-fade--r { right: 0; background: linear-gradient(270deg, var(--black), transparent); }

        @media (max-width: 640px) {
          .lk-card { height: 240px; }
          .lk-rows { transform: rotateX(6deg); gap: 12px; }
          .lk-track { gap: 12px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lk-track--left, .lk-track--right { animation: none; }
          .lk-rows { transform: none; }
          .lk-row { overflow-x: auto; }
        }
      `}</style>
    </section>
  );
}
