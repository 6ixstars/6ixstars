'use client';
// Sección "Galería" — showcase de paneles expandibles (estilo team-showcase de
// 21st.dev). Una fila de paneles que se expanden al hacer hover (o tap en móvil),
// revelando el look completo + meta editorial. Estética futurista: brackets
// animados, scanlines, glow rosa de marca y labels mono. Entrada con stagger.
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

// 9 looks → 6 paneles destacados para el showcase expandible.
const LOOKS = [
  { src: '/img/gen/look-01.webp', name: 'SHADOW',  tag: 'OVERSIZE' },
  { src: '/img/gen/look-03.webp', name: 'STATIC',  tag: 'BOXY FIT' },
  { src: '/img/gen/look-05.webp', name: 'WAVE',    tag: 'BAGGY' },
  { src: '/img/gen/look-07.webp', name: 'TACTICAL',tag: 'CARGO' },
  { src: '/img/gen/look-09.webp', name: 'TRACK',   tag: 'CONJUNTO' },
  { src: '/img/gen/look-02.webp', name: 'NOISE',   tag: 'STREET' },
];

const panelVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

function Panel({ look, n, active, onActivate }) {
  return (
    <motion.div
      className={`gx-panel ${active ? 'is-active' : ''}`}
      variants={panelVariants}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      onMouseEnter={onActivate}
      onClick={onActivate}
      data-cursor="hover"
    >
      <img src={look.src} alt={`Look ${look.name}`} loading="lazy" />
      <span className="gx-scan" aria-hidden="true" />
      <span className="gx-grad" aria-hidden="true" />

      {/* Brackets de esquina que se "arman" al activar */}
      <span className="gx-bracket gx-bracket--tl" aria-hidden="true" />
      <span className="gx-bracket gx-bracket--br" aria-hidden="true" />

      {/* Índice vertical (estado colapsado) */}
      <span className="gx-idx">{String(n).padStart(2, '0')}</span>

      {/* Contenido revelado (estado activo) */}
      <div className="gx-info">
        <span className="gx-info-tag">/// {look.tag}</span>
        <h3 className="gx-info-name">{look.name}</h3>
        <Link href="/tienda" className="gx-info-cta" data-cursor="hover">
          VER LOOK <ArrowUpRight size={16} />
        </Link>
      </div>

      <span className="gx-meta">6IX · FW26</span>
    </motion.div>
  );
}

export default function LookbookGallery() {
  const [active, setActive] = useState(0);

  return (
    <section className="lookbook-21">
      <div className="container lk-head">
        <span className="lk-tag">/// EDITORIAL · COL. 2026</span>
        <h2 className="lk-title">GALERÍA <span>2026</span></h2>
        <p className="lk-sub">La calle como pasarela. Pasa el cursor — cada pieza cobra vida.</p>
      </div>

      <motion.div
        className="container gx-stage"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        transition={{ staggerChildren: 0.08 }}
      >
        {LOOKS.map((look, i) => (
          <Panel
            key={look.src + i}
            look={look}
            n={i + 1}
            active={active === i}
            onActivate={() => setActive(i)}
          />
        ))}
      </motion.div>

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

        /* ---------- ESCENARIO DE PANELES EXPANDIBLES ---------- */
        .gx-stage {
          display: flex;
          gap: 12px;
          height: 560px;
        }

        .gx-panel {
          position: relative;
          flex: 1 1 0;
          min-width: 0;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid var(--dark-4);
          background: #101012;
          transition: flex-grow .6s cubic-bezier(.16,1,.3,1), border-color .5s, box-shadow .5s;
          will-change: flex-grow;
        }
        .gx-panel.is-active {
          flex-grow: 5;
          border-color: var(--gold);
          box-shadow: 0 24px 60px rgba(0,0,0,.6), 0 0 40px rgba(238,177,195,.22);
        }

        .gx-panel img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          filter: grayscale(.7) contrast(1.05) brightness(.7);
          transform: scale(1.08);
          transition: filter .6s, transform .8s cubic-bezier(.16,1,.3,1);
        }
        .gx-panel.is-active img { filter: grayscale(0) contrast(1.05) brightness(1); transform: scale(1); }

        /* Degradado inferior para legibilidad del texto */
        .gx-grad {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(180deg, rgba(11,11,12,.1) 0%, transparent 35%, transparent 55%, rgba(11,11,12,.85) 100%);
          opacity: .9; transition: opacity .5s;
        }

        /* Scanlines sutiles tipo HUD */
        .gx-scan {
          position: absolute; inset: 0; pointer-events: none; opacity: 0;
          background: repeating-linear-gradient(0deg, rgba(238,177,195,.06) 0px, rgba(238,177,195,.06) 1px, transparent 2px, transparent 4px);
          transition: opacity .5s;
          mix-blend-mode: overlay;
        }
        .gx-panel.is-active .gx-scan { opacity: 1; }

        /* Brackets de esquina */
        .gx-bracket { position: absolute; width: 26px; height: 26px; pointer-events: none; opacity: 0; transition: opacity .4s .1s, transform .5s cubic-bezier(.16,1,.3,1); }
        .gx-bracket--tl { top: 14px; left: 14px; border-top: 2px solid var(--gold); border-left: 2px solid var(--gold); transform: translate(-6px,-6px); }
        .gx-bracket--br { bottom: 14px; right: 14px; border-bottom: 2px solid var(--gold); border-right: 2px solid var(--gold); transform: translate(6px,6px); }
        .gx-panel.is-active .gx-bracket { opacity: 1; transform: translate(0,0); }

        /* Índice — visible en estado colapsado */
        .gx-idx {
          position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
          font-family: var(--font-display); font-size: 1.8rem; color: var(--white);
          opacity: .85; transition: opacity .35s;
          writing-mode: vertical-rl; letter-spacing: .1em;
        }
        .gx-panel.is-active .gx-idx { opacity: 0; }

        /* Info revelada */
        .gx-info {
          position: absolute; left: 22px; bottom: 22px; right: 22px;
          opacity: 0; transform: translateY(14px);
          transition: opacity .45s .12s, transform .55s .12s cubic-bezier(.16,1,.3,1);
          pointer-events: none;
        }
        .gx-panel.is-active .gx-info { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .gx-info-tag { display: block; font-family: var(--font-tech); font-size: .62rem; letter-spacing: .18em; color: var(--gold); margin-bottom: 6px; }
        .gx-info-name { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3.4rem); color: var(--white); line-height: .9; margin: 0 0 16px; text-transform: uppercase; }
        .gx-info-cta {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--font-sans); font-weight: 800; font-size: .72rem; letter-spacing: .1em; text-transform: uppercase;
          color: #0B0B0C; background: var(--gold); padding: 9px 16px; border-radius: 999px;
          transition: background .2s, gap .2s;
        }
        .gx-info-cta:hover { background: #fff; gap: 11px; }

        .gx-meta {
          position: absolute; top: 16px; right: 16px;
          font-family: var(--font-tech); font-size: .56rem; letter-spacing: .16em;
          color: var(--white); background: rgba(11,11,12,.55); backdrop-filter: blur(6px);
          padding: 3px 8px; border-radius: 6px; opacity: 0; transition: opacity .4s;
        }
        .gx-panel.is-active .gx-meta { opacity: 1; }

        /* ---------- FOOT ---------- */
        .gx-foot { display: flex; justify-content: center; margin-top: 44px; }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 860px) {
          .gx-stage { flex-direction: column; height: auto; gap: 10px; }
          .gx-panel { flex: none; height: 92px; }
          .gx-panel.is-active { flex: none; height: 380px; }
          .gx-idx { writing-mode: horizontal-tb; bottom: auto; top: 50%; transform: translate(-50%,-50%); }
          .gx-info { left: 18px; right: 18px; bottom: 18px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .gx-panel, .gx-panel img, .gx-info, .gx-bracket { transition: none; }
          .gx-panel img { filter: grayscale(0) brightness(1); transform: scale(1); }
        }
      `}</style>
    </section>
  );
}
