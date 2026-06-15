'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, ArrowUpRight, ArrowRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { collections, testimonials } from '@/lib/products-constants';
import ProductCard from '@/components/ui/ProductCard';
import SmoothScroll from '@/components/fx/SmoothScroll';
import Cursor from '@/components/fx/Cursor';
import ScrollProgress from '@/components/fx/ScrollProgress';
import Reveal from '@/components/fx/Reveal';
import Magnetic from '@/components/fx/Magnetic';
import TiltShoes from '@/components/fx/TiltShoes';

const COP = (n) => '$' + Number(n || 0).toLocaleString('es-CO');

function StarMark({ className, size = 24, outline = false, style }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true"
      fill={outline ? 'none' : 'currentColor'} stroke={outline ? 'currentColor' : 'none'} strokeWidth={outline ? 3 : 0} style={style}>
      <path d="M50 2 L61 38 L98 38 L68 60 L79 96 L50 74 L21 96 L32 60 L2 38 L39 38 Z" />
    </svg>
  );
}

function IgGlyph({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const heroStagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } };
const lineUp = { hidden: { y: '118%' }, show: { y: 0, transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] } } };
const softUp = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } };

// Bento: spans de columna (de 12) por categoría — layout editorial asimétrico.
const BENTO_SPANS = [7, 5, 5, 7, 8, 4];

// Piezas del DROP (showcase). Usan las fotos generadas + slugs del seed.
const DROP_ITEMS = [
  { name: 'Buzo Oversize Shadow',    price: '$159.900', img: '/img/gen/cat-buzos.webp',     slug: 'buzo-oversize-shadow',   colors: ['#191A1D', '#FF2E7E', '#ECECEC', '#5B5B62'], sizes: ['S', 'M', 'L', 'XL'] },
  { name: 'Jean Baggy Wave',         price: '$169.900', img: '/img/gen/cat-jeans.webp',     slug: 'jean-baggy-wave',        colors: ['#43618F', '#191A1D', '#ECECEC'],            sizes: ['S', 'M', 'L', 'XL'] },
  { name: 'Conjunto Track 6ix',      price: '$229.900', img: '/img/gen/cat-conjuntos.webp', slug: 'conjunto-track-6ix',     colors: ['#191A1D', '#FF2E7E', '#5C6B3C'],            sizes: ['S', 'M', 'L', 'XL'] },
  { name: 'Camisa Boxy Static',      price: '$79.900',  img: '/img/gen/cat-camisas.webp',   slug: 'camisa-boxy-static',     colors: ['#ECECEC', '#191A1D', '#FF2E7E'],            sizes: ['S', 'M', 'L', 'XL'] },
  { name: 'Bermuda Cargo Tactical',  price: '$109.900', img: '/img/gen/cat-bermudas.webp',  slug: 'bermuda-cargo-tactical', colors: ['#5C6B3C', '#191A1D', '#C9B79C'],            sizes: ['S', 'M', 'L', 'XL'] },
  { name: 'Gorra Snapback 6ix',      price: '$59.900',  img: '/img/gen/cat-gorras.webp',    slug: 'gorra-snapback-6ix',     colors: ['#191A1D', '#FF2E7E', '#E11D48'],            sizes: ['Única'] },
];

export default function HomePageClient({ products = [] }) {
  const bestsellers = products.filter(p => p.bestseller).slice(0, 8);
  const grid = bestsellers.length ? bestsellers : products.slice(0, 8);
  const spotlight = products.find(p => p.featured) || products[0] || null;

  return (
    <SmoothScroll>
      <ScrollProgress />
      <Cursor />

      {/* Marco brutalista fijo + meta en esquinas */}
      <div className="sx6-frame" aria-hidden="true">
        <span className="sx6-frame-tl">★ EST. MMXXVI</span>
        <span className="sx6-frame-tr">TORONTO ⇄ CO</span>
        <span className="sx6-frame-bl">FW26 / 6IX</span>
        <span className="sx6-frame-br">6IXSTARS®</span>
      </div>

      <main id="main-content" className="sx6">

        {/* ===================== HERO — VIDEO (premium, anclado abajo) ===================== */}
        <section className="sx6-hero sx6-vhero">
          <video className="sx6-hero-video" autoPlay muted loop playsInline preload="auto" poster="/video/hero-poster.webp">
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>
          <div className="sx6-vhero-grad" aria-hidden="true" />

          <div className="container sx6-vhero-content">
            <motion.span className="sx6-vhero-kicker" variants={softUp} initial="hidden" animate="show">
              ★ FW26 · COLECCIÓN 01 · DESDE EL 6IX
            </motion.span>
            <motion.h1 className="sx6-vhero-h" variants={heroStagger} initial="hidden" animate="show">
              <span className="m"><motion.span className="ln" variants={lineUp}>ROPA QUE <span className="hl">PEGA</span></motion.span></span>
              <span className="m"><motion.span className="ln" variants={lineUp}>EN LA CALLE</motion.span></span>
            </motion.h1>
            <motion.div className="sx6-vhero-cta" variants={softUp} initial="hidden" animate="show" transition={{ delay: 0.5 }}>
              <Magnetic strength={0.5}>
                <Link href="/tienda" className="sx6-btn sx6-btn-pink" data-cursor="hover">VER LA TIENDA <ArrowUpRight size={18} /></Link>
              </Magnetic>
              <Magnetic strength={0.5}>
                <Link href="/tienda?sort=nuevo" className="sx6-btn sx6-btn-ghost" data-cursor="hover">NUEVO DROP</Link>
              </Magnetic>
            </motion.div>
          </div>
        </section>

        {/* ===================== BANDA GRAFFITI ===================== */}
        <div className="sx6-graffiti" aria-hidden="true">
          <div className="sx6-graffiti-track">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="sx6-graffiti-item">NUEVO DROP <StarMark size={20} /> ENVÍO A TODA COLOMBIA <StarMark size={20} /></span>
            ))}
          </div>
        </div>

        {/* ===================== DROP 01 — CARRUSEL 3D ===================== */}
        <section className="container sx6-section">
          <Reveal className="sx6-head sx6-head-row">
            <div>
              <span className="sx6-tag">/// DROP 01 · FW26</span>
              <h2 className="sx6-head-title">EL DROP</h2>
            </div>
            <Link href="/tienda?sort=nuevo" className="sx6-head-link" data-cursor="hover">VER DROP <ArrowRight size={16} /></Link>
          </Reveal>
          <TiltShoes />
        </section>

        {/* ===================== TRUST ===================== */}
        <section className="container sx6-trust">
          {[
            { Icon: Truck, t: 'Envío a toda Colombia', d: '24–48H' },
            { Icon: ShieldCheck, t: 'Pago seguro', d: 'WOMPI' },
            { Icon: RefreshCw, t: 'Cambios fáciles', d: '15 DÍAS' },
          ].map(({ Icon, t, d }, i) => (
            <Reveal key={t} i={i} className="sx6-trust-item">
              <Icon size={18} />
              <p className="sx6-trust-t">{t}</p>
              <span className="sx6-trust-d">{d}</span>
            </Reveal>
          ))}
        </section>

        {/* ===================== CATEGORÍAS — BENTO ===================== */}
        <section className="container sx6-section">
          <Reveal className="sx6-head">
            <span className="sx6-tag">/// EXPLORA · 06 CATEGORÍAS</span>
            <h2 className="sx6-head-title">CATEGORÍAS</h2>
          </Reveal>
          <div className="sx6-bento">
            {collections.map((c, i) => (
              <Reveal key={c.id} i={i % 3} className="sx6-bento-cell" style={{ gridColumn: `span ${BENTO_SPANS[i] || 6}` }}>
                <Link href={`/tienda?cat=${c.id}`} className="sx6-tile" data-cursor="hover"
                  style={{ backgroundImage: `linear-gradient(180deg, rgba(11,11,12,.2), rgba(11,11,12,.9)), url(/img/gen/cat-${c.id}.webp)`, backgroundSize: 'cover', backgroundPosition: 'center top' }}>
                  <span className="sx6-tile-ghost">{String(i + 1).padStart(2, '0')}</span>
                  <div className="sx6-tile-top">
                    <span className="sx6-tile-idx">[ {String(i + 1).padStart(2, '0')} ]</span>
                    <span className="sx6-tile-id">{c.id.toUpperCase()}</span>
                  </div>
                  <div className="sx6-tile-bot">
                    <h3 className="sx6-tile-name">{c.name}</h3>
                    <ArrowUpRight className="sx6-tile-arrow" size={30} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===================== LOOKBOOK ===================== */}
        <section className="sx6-lookbook">
          <div className="container">
            <Reveal className="sx6-head sx6-head-row">
              <div>
                <span className="sx6-tag">/// EDITORIAL</span>
                <h2 className="sx6-head-title">LOOKBOOK <span className="o">FW26</span></h2>
              </div>
              <Link href="/tienda" className="sx6-head-link" data-cursor="hover">VER COLECCIÓN <ArrowRight size={16} /></Link>
            </Reveal>
            <div className="sx6-look-grid">
              {[
                { label: 'FIG.01 — OUTERWEAR', img: 'look-01' },
                { label: 'FIG.02 — DENIM', img: 'look-02' },
                { label: 'FIG.03 — HEADWEAR', img: 'look-03' },
              ].map(({ label, img }, i) => (
                <Reveal key={label} i={i} className={`sx6-look-cell ${i === 1 ? 'tall' : ''}`}>
                  <div className="sx6-look-frame" data-cursor="hover"
                    style={{ backgroundImage: `linear-gradient(180deg, transparent 38%, rgba(11,11,12,.88)), url(/img/gen/${img}.webp)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <span className="sx6-look-label">{label}</span>
                    <span className="sx6-look-corner">6IX</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CAMPAÑA ===================== */}
        <section className="sx6-campaign">
          <img src="/img/gen/campaign.webp" alt="Campaña 6ixstars FW26" className="sx6-campaign-img" />
          <div className="container sx6-campaign-inner">
            <span className="sx6-tag">/// CAMPAÑA FW26</span>
            <h2 className="sx6-campaign-title">EN LAS CALLES<br /><span>DE COLOMBIA</span></h2>
            <Magnetic strength={0.4}>
              <Link href="/tienda" className="sx6-btn sx6-btn-pink" data-cursor="hover">VER LA COLECCIÓN <ArrowUpRight size={18} /></Link>
            </Magnetic>
          </div>
        </section>

        {/* ===================== TOP DROPS ===================== */}
        <section className="container sx6-section">
          <Reveal className="sx6-head sx6-head-row">
            <div>
              <span className="sx6-tag">/// LO MÁS DURO</span>
              <h2 className="sx6-head-title">TOP DROPS</h2>
            </div>
            <Link href="/tienda?sort=bestseller" className="sx6-head-link" data-cursor="hover">VER TODO <ArrowRight size={16} /></Link>
          </Reveal>

          {grid.length ? (
            <div className="grid-4 sx6-grid">
              {grid.map((p, i) => (
                <Reveal key={p.id} i={i % 4}><ProductCard product={p} priority={i < 4} /></Reveal>
              ))}
            </div>
          ) : (
            <div className="sx6-empty">
              <StarMark size={40} outline />
              <p>El catálogo está en camino. Conecta Supabase y corre <code>seed.sql</code> para ver los productos.</p>
              <Link href="/tienda" className="sx6-btn sx6-btn-ghost" data-cursor="hover">IR A LA TIENDA</Link>
            </div>
          )}
        </section>

        {/* ===================== MANIFIESTO ===================== */}
        <section className="sx6-manifesto">
          <div className="sx6-mani-marq" aria-hidden="true">
            <div className="sx6-mani-track">
              {Array.from({ length: 8 }).map((_, i) => <span key={i}>6IXSTARS&nbsp;</span>)}
            </div>
          </div>
          <div className="container sx6-mani-inner">
            <Reveal as="span" className="sx6-mani-tag">/// MANIFIESTO N°01</Reveal>
            <Reveal as="h2" className="sx6-mani-title">HECHO PARA LA CALLE.<br /><span>NO PARA EL CLÓSET.</span></Reveal>
            <Reveal i={1} as="p" className="sx6-mani-text">
              6ixstars nació en la calle y se queda ahí. Telas pesadas, fits reales y
              piezas en cantidades limitadas. Cuando se agota, se agota.
            </Reveal>
          </div>
        </section>

        {/* ===================== SPOTLIGHT ===================== */}
        {spotlight && (
          <section className="container sx6-section">
            <div className="sx6-spot">
              <Reveal className="sx6-spot-imgwrap">
                <Link href={`/producto/${spotlight.slug}`} className="sx6-spot-img" data-cursor="hover">
                  <img src={spotlight.images?.[0] || '/img/placeholder.webp'} alt={spotlight.name} />
                  <span className="sx6-spot-badge">★ DESTACADO</span>
                </Link>
              </Reveal>
              <Reveal i={1} className="sx6-spot-info">
                <span className="sx6-tag">/// PIEZA DESTACADA</span>
                <h2 className="sx6-spot-name">{spotlight.name}</h2>
                <p className="sx6-spot-desc">{spotlight.description}</p>
                {spotlight.price > 0 && <p className="sx6-spot-price">{COP(spotlight.price)}</p>}
                <Magnetic strength={0.4}>
                  <Link href={`/producto/${spotlight.slug}`} className="sx6-btn sx6-btn-pink" data-cursor="hover">VER PIEZA <ArrowUpRight size={18} /></Link>
                </Magnetic>
              </Reveal>
            </div>
          </section>
        )}

        {/* ===================== RESEÑAS ===================== */}
        <section className="container sx6-section">
          <Reveal className="sx6-head">
            <span className="sx6-tag">/// LA GENTE HABLA</span>
            <h2 className="sx6-head-title">RESEÑAS</h2>
          </Reveal>
          <div className="sx6-reviews">
            {testimonials.map((t, i) => (
              <Reveal key={t.id} i={i} as="figure" className="sx6-review">
                <span className="sx6-review-idx">0{i + 1}</span>
                <div className="sx6-review-stars">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                </div>
                <blockquote>{t.text}</blockquote>
                <figcaption><strong>{t.name}</strong><span>{t.location} · {t.product}</span></figcaption>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===================== JOIN ===================== */}
        <section className="sx6-join">
          <div className="container sx6-join-inner">
            <Reveal>
              <span className="sx6-tag" style={{ color: '#0B0B0C', borderColor: 'rgba(11,11,12,.3)' }}>/// COMUNIDAD 6IX</span>
              <h2 className="sx6-join-title">ÚNETE AL 6IX</h2>
              <p className="sx6-join-text">Enterate de los drops antes que nadie. Acceso anticipado, descuentos y nada de spam.</p>
              <form className="sx6-join-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="TU@CORREO.COM" aria-label="Correo electrónico" data-cursor="hover" />
                <button type="submit" data-cursor="hover">SUSCRIBIRME</button>
              </form>
              <a href="https://www.instagram.com/6ixstars/" target="_blank" rel="noopener noreferrer" className="sx6-join-ig" data-cursor="hover"><IgGlyph size={16} /> @6IXSTARS</a>
            </Reveal>
          </div>
        </section>

        <HomeStyles />
      </main>
    </SmoothScroll>
  );
}

function HomeStyles() {
  return (
    <style>{`
      .sx6 { background: var(--black); overflow: clip; }
      .sx6 ::selection { background: var(--gold); color: #0B0B0C; }
      .sx6 .sx6-tag, .sx6-frame span { font-family: var(--font-tech); }

      /* ---------- MARCO BRUTALISTA ---------- */
      .sx6-frame { position: fixed; inset: 12px; border: 1px solid var(--dark-4); pointer-events: none; z-index: 40; }
      .sx6-frame span { position: absolute; font-size: .58rem; letter-spacing: .2em; color: var(--gray); background: var(--black); padding: 2px 6px; }
      .sx6-frame-tl { top: -8px; left: 14px; }
      .sx6-frame-tr { top: -8px; right: 14px; }
      .sx6-frame-bl { bottom: -8px; left: 14px; }
      .sx6-frame-br { bottom: -8px; right: 14px; color: var(--gold) !important; }
      @media (max-width: 700px) { .sx6-frame { inset: 7px; } .sx6-frame-tr, .sx6-frame-bl { display: none; } }

      /* ---------- HERO ---------- */
      .sx6-hero { position: relative; min-height: 100svh; display: flex; align-items: center; overflow: clip; border-bottom: 1px solid var(--dark-4);
        background: radial-gradient(70% 55% at 74% 34%, rgba(255,46,126,.10), transparent 62%), radial-gradient(50% 40% at 10% 90%, rgba(67,97,143,.10), transparent 60%); }
      .sx6-hero-bigstar { position: absolute; right: -340px; top: 48%; transform: translateY(-50%); color: var(--gold); opacity: .10; pointer-events: none; will-change: transform; }
      .sx6-hero-bigstar svg { display: block; }
      .sx6-hero-outstar { position: absolute; left: 38%; top: 14%; color: var(--dark-4); opacity: .6; pointer-events: none; }
      .sx6-hero-inner { position: relative; z-index: 2; width: 100%; max-width: 920px; margin: 0 auto; padding-top: 90px; padding-bottom: 80px; display: flex; flex-direction: column; align-items: center; text-align: center; }
      .ghost-hero { position: absolute; inset: 0; z-index: 0; }
      .ghost-hero canvas { display: block; }
      .sx6-hero-fade { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(72% 46% at 50% 34%, rgba(11,11,12,.62), transparent 72%); }
      .sx6-hero-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
      /* HERO VIDEO PREMIUM: degradado sólo arriba (navbar) y abajo (texto), centro limpio */
      .sx6-vhero-grad { position: absolute; inset: 0; z-index: 1; pointer-events: none;
        background: linear-gradient(180deg, rgba(11,11,12,.55) 0%, rgba(11,11,12,.12) 15%, transparent 40%, transparent 50%, rgba(11,11,12,.35) 70%, rgba(11,11,12,.92) 100%); }
      .sx6-vhero-content { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding-bottom: clamp(54px, 11vh, 120px); }
      .sx6-vhero-kicker { display: inline-block; font-family: var(--font-tech); font-size: .64rem; letter-spacing: .24em; color: var(--gold); margin-bottom: 16px; }
      .sx6-vhero-h { font-family: var(--font-display); text-transform: uppercase; font-size: clamp(2.4rem, 6.5vw, 5.4rem); line-height: .9; color: #fff; margin: 0 0 26px; max-width: 18ch; text-shadow: 0 6px 36px rgba(0,0,0,.55); }
      .sx6-vhero-h .hl { color: transparent; -webkit-text-stroke: 2px var(--gold); }
      .sx6-vhero-h .m { display: block; overflow: hidden; padding-bottom: .04em; }
      .sx6-vhero-h .ln { display: block; will-change: transform; }
      .sx6-vhero-cta { display: flex; gap: 12px; flex-wrap: wrap; }
      @media (max-width: 600px) { .sx6-vhero-content { padding-bottom: 84px; } .sx6-vhero-h { font-size: clamp(2.2rem, 11vw, 3rem); } }
      /* hero centrado: sin restricción de ancho lateral */

      .sx6-hero-toprow { display: flex; justify-content: center; font-family: var(--font-tech); font-size: .64rem; letter-spacing: .24em; color: var(--gold); margin-bottom: 24px; }

      .sx6-hero-title { font-family: var(--font-display); text-transform: uppercase; line-height: .86; font-size: clamp(2.8rem, 9vw, 8rem); color: var(--white); margin: 0; letter-spacing: -.01em; }
      .sx6-hero-title .m { display: block; overflow: hidden; }
      .sx6-hero-title .ln { display: block; will-change: transform; }
      .sx6-hero-title .ln.fill { color: var(--white); }
      .sx6-hero-title .out { color: transparent; -webkit-text-stroke: 2px var(--gold); text-shadow: 0 0 40px rgba(255,46,126,.4); }
      .sx6-hero-title .reg { font-size: .22em; vertical-align: top; color: var(--gold); font-style: normal; margin-left: .1em; }

      .sx6-hero-bottom { display: flex; flex-direction: column; align-items: center; gap: 22px; margin-top: 28px; }
      .sx6-hero-sub { max-width: 460px; margin: 0 auto; color: var(--gray-light); font-size: .98rem; line-height: 1.65; }
      .sx6-hero-sub .bar { display: none; }
      .sx6-hero-cta { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

      .sx6-btn { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-sans); font-weight: 800; font-size: .82rem; letter-spacing: .1em; text-transform: uppercase; padding: 17px 30px; border-radius: 0; transition: background .2s, color .2s, box-shadow .2s; }
      .sx6-btn-pink { background: var(--gold); color: #0B0B0C; box-shadow: 0 10px 34px rgba(255,46,126,.32); }
      .sx6-btn-pink:hover { background: #fff; }
      .sx6-btn-ghost { background: transparent; color: var(--white); border: 1.5px solid var(--white); }
      .sx6-btn-ghost:hover { background: var(--white); color: #0B0B0C; }

      /* Sticker */
      .sx6-sticker { position: absolute; top: 96px; right: 0; background: var(--gold); color: #0B0B0C; padding: 14px 18px 12px; width: 168px; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 18px 50px rgba(0,0,0,.5); transform-origin: center; }
      .sx6-sticker-top, .sx6-sticker-bot { font-family: var(--font-tech); font-size: .58rem; letter-spacing: .12em; font-weight: 700; }
      .sx6-sticker-big { font-family: var(--font-display); font-size: 2.2rem; line-height: .9; }
      .sx6-sticker-dots { height: 0; border-top: 2px dashed rgba(11,11,12,.4); margin: 6px 0; }
      @media (max-width: 900px) { .sx6-sticker { top: auto; bottom: 92px; right: 8px; transform: rotate(9deg) scale(.85); } }
      @media (max-width: 560px) { .sx6-sticker { display: none; } }

      .sx6-scrollcue { position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--gray); font-family: var(--font-tech); font-size: .56rem; letter-spacing: .3em; }
      .sx6-scrollcue i { width: 1px; height: 34px; background: linear-gradient(var(--gold), transparent); animation: sx6-cue 1.8s ease-in-out infinite; transform-origin: top; }
      @keyframes sx6-cue { 0%,100% { transform: scaleY(.4); opacity: .4; } 50% { transform: scaleY(1); opacity: 1; } }

      /* ---------- MARQUEE DIAGONAL ---------- */
      /* ---------- BANDA GRAFFITI ---------- */
      @keyframes sx6-marq { to { transform: translateX(-50%); } }
      .sx6-graffiti { position: relative; overflow: hidden; border-top: 1px solid var(--dark-4); border-bottom: 1px solid var(--dark-4); padding: 20px 0; background: #0B0B0C; }
      .sx6-graffiti::before { content: ''; position: absolute; inset: 0; background: url('/img/graffiti.webp') center / cover; opacity: .55; }
      .sx6-graffiti::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, #0B0B0C, transparent 12%, transparent 88%, #0B0B0C), rgba(11,11,12,.3); }
      .sx6-graffiti-track { position: relative; z-index: 1; display: flex; align-items: center; width: max-content; animation: sx6-marq 34s linear infinite; }
      .sx6-graffiti-item { display: inline-flex; align-items: center; gap: 16px; font-family: var(--font-display); font-size: 1.6rem; letter-spacing: .02em; text-transform: uppercase; color: #fff; padding: 0 18px; white-space: nowrap; text-shadow: 0 2px 14px rgba(0,0,0,.85), 0 0 3px rgba(0,0,0,.9); }
      .sx6-graffiti-item svg { color: var(--gold); }

      /* ---------- TRUST ---------- */
      .sx6-trust { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--dark-4); margin-bottom: 10px; }
      .sx6-trust-item { display: flex; align-items: center; gap: 12px; color: var(--gold); padding: 22px 24px; border-right: 1px solid var(--dark-4); }
      .sx6-trust-item:last-child { border-right: 0; }
      .sx6-trust-t { color: var(--white); font-weight: 800; font-size: .82rem; text-transform: uppercase; letter-spacing: .04em; flex: 1; }
      .sx6-trust-d { font-family: var(--font-tech); font-size: .62rem; color: var(--gray); letter-spacing: .14em; }
      @media (max-width: 700px) { .sx6-trust { grid-template-columns: 1fr; } .sx6-trust-item { border-right: 0; border-bottom: 1px solid var(--dark-4); } .sx6-trust-item:last-child { border-bottom: 0; } }

      /* ---------- HEAD ---------- */
      .sx6-section { padding-top: 86px; padding-bottom: 20px; }
      .sx6-head { margin-bottom: 34px; }
      .sx6-head-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
      .sx6-tag { display: inline-block; font-size: .64rem; letter-spacing: .2em; color: var(--gold); margin-bottom: 12px; border: 1px solid var(--dark-4); padding: 5px 10px; }
      .sx6-head-title { font-family: var(--font-display); font-size: clamp(2.6rem, 7vw, 6rem); color: var(--white); line-height: .88; margin: 0; text-transform: uppercase; }
      .sx6-head-title .o, .sx6-head-title span.o { color: transparent; -webkit-text-stroke: 1.5px var(--gold); }
      .sx6-head-link { display: inline-flex; align-items: center; gap: 6px; color: var(--white); font-weight: 800; font-size: .76rem; letter-spacing: .1em; text-transform: uppercase; border: 1.5px solid var(--white); padding: 11px 18px; white-space: nowrap; transition: all .2s; }
      .sx6-head-link:hover { background: var(--gold); border-color: var(--gold); color: #0B0B0C; gap: 12px; }

      /* ---------- BENTO ---------- */
      .sx6-bento { display: grid; grid-template-columns: repeat(12, 1fr); gap: 10px; }
      .sx6-bento-cell { min-width: 0; }
      .sx6-tile { position: relative; display: flex; flex-direction: column; justify-content: space-between; height: 100%; min-height: 230px; padding: 20px; border: 1px solid var(--dark-4); background: var(--dark); overflow: hidden; transition: background .3s; }
      .sx6-tile::after { content: ''; position: absolute; inset: 0; background: var(--gold); transform: translateY(101%); transition: transform .45s cubic-bezier(.16,1,.3,1); z-index: 0; }
      .sx6-tile:hover::after { transform: translateY(0); }
      .sx6-tile > * { position: relative; z-index: 1; }
      .sx6-tile-ghost { position: absolute; right: -10px; bottom: -40px; font-family: var(--font-display); font-size: 9rem; line-height: 1; color: var(--dark-2); z-index: 0 !important; transition: color .3s; }
      .sx6-tile:hover .sx6-tile-ghost { color: rgba(11,11,12,.12); }
      .sx6-tile-top { display: flex; justify-content: space-between; font-family: var(--font-tech); font-size: .6rem; letter-spacing: .14em; color: var(--gray); transition: color .3s; }
      .sx6-tile-bot { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; }
      .sx6-tile-name { font-family: var(--font-display); font-size: clamp(1.6rem, 3vw, 2.8rem); color: var(--white); text-transform: uppercase; line-height: .95; margin: 0; transition: color .3s; }
      .sx6-tile-arrow { color: var(--gold); flex-shrink: 0; transition: color .3s, transform .3s; }
      .sx6-tile:hover .sx6-tile-top, .sx6-tile:hover .sx6-tile-name, .sx6-tile:hover .sx6-tile-arrow { color: #0B0B0C; }
      .sx6-tile:hover .sx6-tile-arrow { transform: translate(4px,-4px); }
      @media (max-width: 760px) { .sx6-bento-cell { grid-column: span 12 !important; } .sx6-tile { min-height: 150px; } }

      /* ---------- LOOKBOOK ---------- */
      .sx6-lookbook { padding: 86px 0 20px; }
      .sx6-look-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; align-items: start; }
      .sx6-look-frame { position: relative; aspect-ratio: 3/4; border: 1px solid var(--dark-4); background: radial-gradient(120% 120% at 50% 20%, rgba(255,46,126,.07), transparent 60%), #101012; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: border-color .3s; }
      .sx6-look-cell.tall .sx6-look-frame { aspect-ratio: 3/4.6; }
      .sx6-look-frame:hover { border-color: var(--gold); }
      .sx6-look-star { color: var(--dark-4); transition: color .4s, transform .6s; }
      .sx6-look-frame:hover .sx6-look-star { color: var(--gold); transform: rotate(40deg) scale(1.1); }
      .sx6-look-label { position: absolute; bottom: 14px; left: 14px; font-family: var(--font-tech); font-size: .6rem; letter-spacing: .16em; color: var(--gray-light); }
      .sx6-look-corner { position: absolute; top: 14px; right: 14px; font-family: var(--font-tech); font-size: .6rem; letter-spacing: .16em; color: var(--gold); }
      @media (max-width: 760px) { .sx6-look-grid { grid-template-columns: 1fr 1fr; } .sx6-look-cell:nth-child(3) { grid-column: span 2; } .sx6-look-cell.tall .sx6-look-frame { aspect-ratio: 3/4; } }

      /* ---------- GRID / EMPTY ---------- */
      .sx6-grid { margin-top: 4px; }
      .sx6-empty { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; padding: 60px 20px; border: 1px dashed var(--dark-4); color: var(--gray); }
      .sx6-empty > svg { color: var(--dark-4); }
      .sx6-empty p { max-width: 460px; }
      .sx6-empty code { color: var(--gold); font-family: var(--font-tech); }

      /* ---------- MANIFIESTO ---------- */
      .sx6-manifesto { position: relative; overflow: clip; background: var(--gold); color: #0B0B0C; margin-top: 86px; padding: 0 0 clamp(56px, 9vw, 110px); }
      .sx6-mani-marq { overflow: hidden; border-bottom: 2px solid #0B0B0C; padding: 8px 0; margin-bottom: clamp(40px, 7vw, 90px); }
      .sx6-mani-track { display: flex; width: max-content; animation: sx6-marq 40s linear infinite; font-family: var(--font-display); font-size: 1.4rem; color: transparent; -webkit-text-stroke: 1px #0B0B0C; text-transform: uppercase; }
      .sx6-mani-inner { position: relative; z-index: 1; }
      .sx6-mani-tag { display: inline-block; font-family: var(--font-tech); font-size: .64rem; letter-spacing: .2em; border: 1px solid rgba(11,11,12,.3); padding: 5px 10px; margin-bottom: 18px; }
      .sx6-mani-title { font-family: var(--font-display); font-size: clamp(2.6rem, 9vw, 7.5rem); line-height: .88; margin: 0 0 20px; color: #0B0B0C; text-transform: uppercase; }
      .sx6-mani-title span { color: var(--gold); -webkit-text-stroke: 2px #0B0B0C; }
      .sx6-mani-text { font-size: 1.05rem; font-weight: 600; line-height: 1.6; color: #0B0B0C; max-width: 460px; }

      /* ---------- SPOTLIGHT ---------- */
      .sx6-spot { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
      .sx6-spot-img { position: relative; display: block; aspect-ratio: 4/5; background: #141416; overflow: hidden; border: 1px solid var(--dark-4); }
      .sx6-spot-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s; }
      .sx6-spot-img:hover img { transform: scale(1.04); }
      .sx6-spot-badge { position: absolute; top: 14px; left: 14px; background: var(--gold); color: #0B0B0C; font-family: var(--font-tech); font-weight: 700; font-size: .62rem; letter-spacing: .12em; padding: 5px 11px; }
      .sx6-spot-name { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3.6rem); color: var(--white); line-height: .95; margin: 8px 0 16px; text-transform: uppercase; }
      .sx6-spot-desc { color: var(--gray-light); line-height: 1.7; margin-bottom: 18px; max-width: 440px; }
      .sx6-spot-price { font-family: var(--font-display); font-size: 2.2rem; color: var(--gold); margin-bottom: 24px; }

      /* ---------- RESEÑAS ---------- */
      .sx6-reviews { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
      .sx6-review { position: relative; background: var(--dark); border: 1px solid var(--dark-4); padding: 24px; margin: 0; display: flex; flex-direction: column; gap: 14px; transition: border-color .25s, background .25s; }
      .sx6-review:hover { border-color: var(--gold); background: var(--dark-2); }
      .sx6-review-idx { position: absolute; top: 16px; right: 18px; font-family: var(--font-tech); font-size: .7rem; color: var(--dark-4); }
      .sx6-review-stars { color: var(--gold); display: flex; gap: 2px; }
      .sx6-review blockquote { color: var(--white); font-size: .95rem; line-height: 1.6; margin: 0; flex: 1; }
      .sx6-review figcaption { display: flex; flex-direction: column; gap: 2px; border-top: 1px solid var(--dark-4); padding-top: 12px; }
      .sx6-review figcaption strong { color: var(--white); font-size: .88rem; }
      .sx6-review figcaption span { font-family: var(--font-tech); color: var(--gray); font-size: .68rem; }

      /* ---------- JOIN ---------- */
      .sx6-join { margin-top: 86px; background: var(--gold); color: #0B0B0C; padding: clamp(64px, 9vw, 120px) 0; }
      .sx6-join-inner { display: flex; flex-direction: column; align-items: center; text-align: center; }
      .sx6-join-title { font-family: var(--font-display); font-size: clamp(3rem, 9vw, 7rem); color: #0B0B0C; margin: 14px 0 0; line-height: .85; text-transform: uppercase; }
      .sx6-join-text { color: rgba(11,11,12,.8); max-width: 460px; margin: 16px auto 0; font-weight: 600; }
      .sx6-join-form { display: flex; gap: 0; width: min(480px, 100%); margin: 24px auto 0; border: 2px solid #0B0B0C; }
      .sx6-join-form input { flex: 1; min-width: 0; background: transparent; border: 0; padding: 16px; color: #0B0B0C; font-family: var(--font-tech); font-size: .9rem; outline: none; }
      .sx6-join-form input::placeholder { color: rgba(11,11,12,.5); }
      .sx6-join-form button { background: #0B0B0C; color: var(--gold); font-weight: 800; font-size: .8rem; letter-spacing: .08em; padding: 0 26px; white-space: nowrap; transition: opacity .2s; }
      .sx6-join-form button:hover { opacity: .85; }
      .sx6-join-ig { display: inline-flex; align-items: center; gap: 8px; color: #0B0B0C; font-family: var(--font-tech); font-weight: 700; font-size: .8rem; margin-top: 18px; }

      /* ---------- CAMPAÑA ---------- */
      .sx6-campaign { position: relative; min-height: 80vh; display: flex; align-items: flex-end; overflow: clip; margin-top: 86px; border-top: 1px solid var(--dark-4); border-bottom: 1px solid var(--dark-4); }
      .sx6-campaign-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .sx6-campaign::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(11,11,12,.94), rgba(11,11,12,.3) 55%, rgba(11,11,12,.55)); }
      .sx6-campaign-inner { position: relative; z-index: 1; padding-top: 60px; padding-bottom: 64px; }
      .sx6-campaign-title { font-family: var(--font-display); font-size: clamp(2.8rem, 8vw, 7rem); color: var(--white); line-height: .88; margin: 12px 0 26px; text-transform: uppercase; }
      .sx6-campaign-title span { color: transparent; -webkit-text-stroke: 1.5px var(--gold); }

      /* ---------- RESPONSIVE ---------- */
      @media (max-width: 1024px) { .sx6-reviews { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 900px) {
        .sx6-look-grid { gap: 10px; }
        .sx6-spot { grid-template-columns: 1fr; gap: 28px; }
        .sx6-hero-bottom { flex-direction: column; align-items: center; }
      }
      @media (max-width: 640px) { .sx6-scrollcue { display: none; } .sx6-join-form { flex-direction: column; } .sx6-join-form button { padding: 14px; } }
      @media (prefers-reduced-motion: reduce) {
        .sx6-marquee-track, .sx6-mani-track, .sx6-scrollcue i { animation: none !important; }
      }
    `}</style>
  );
}
