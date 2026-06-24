'use client';
// Sección "Galería" — masonry de 3 columnas con las 9 fotos verticales.
// Scroll natural (sin pin) para que todas las fotos se vean completas.
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const PHOTOS = [
  '/img/gen/look-01.webp', '/img/gen/look-02.webp', '/img/gen/look-03.webp',
  '/img/gen/look-04.webp', '/img/gen/look-05.webp', '/img/gen/look-06.webp',
  '/img/gen/look-07.webp', '/img/gen/look-08.webp', '/img/gen/look-09.webp',
];

export default function LookbookGallery() {
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

      <div className="container">
        <div className="lk-grid">
          {PHOTOS.map((src, i) => (
            <figure key={i} className="lk-card" style={{ animationDelay: `${(i % 3) * 0.08}s` }}>
              <img src={src} alt="" loading="lazy" />
            </figure>
          ))}
        </div>
      </div>

      <style>{`
        .lookbook-21 { background: var(--black); padding: 96px 0 40px; }
        .lookbook-21 .lk-head { text-align: center; margin-bottom: 48px; }
        .lk-tag { display:inline-block; font-family: var(--font-tech); font-size:.64rem; letter-spacing:.2em; color: var(--gold); border:1px solid var(--dark-4); padding:5px 10px; margin-bottom:16px; }
        .lk-title { font-family: var(--font-display); font-size: clamp(2.8rem, 9vw, 7rem); color: var(--white); line-height:.86; margin:0; text-transform:uppercase; }
        .lk-title span { color: transparent; -webkit-text-stroke: 2px var(--gold); }
        .lk-sub { max-width: 460px; margin: 18px auto 0; color: var(--gray-light); line-height:1.6; }
        .lk-cta { margin-top: 26px; }

        /* Masonry de 3 columnas con fotos verticales completas */
        .lk-grid {
          column-count: 3;
          column-gap: 14px;
        }
        .lk-card {
          margin: 0 0 14px;
          break-inside: avoid;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 8px 28px rgba(0,0,0,.45);
          border: 1px solid var(--dark-4);
          opacity: 0;
          transform: translateY(24px);
          animation: lk-in .7s cubic-bezier(.16,1,.3,1) forwards;
        }
        .lk-card img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform .6s cubic-bezier(.16,1,.3,1);
        }
        .lk-card:hover img { transform: scale(1.05); }

        @keyframes lk-in {
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .lk-grid { column-count: 2; }
        }
        @media (max-width: 520px) {
          .lk-grid { column-count: 2; column-gap: 10px; }
          .lk-card { margin-bottom: 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lk-card { opacity: 1; transform: none; animation: none; }
        }
      `}</style>
    </section>
  );
}
