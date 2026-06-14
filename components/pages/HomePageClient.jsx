'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Star, ArrowUpRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react';

// Instagram glyph (no disponible en esta versión de lucide-react)
function IgGlyph({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
import { collections, testimonials } from '@/lib/products-constants';
import ProductCard from '@/components/ui/ProductCard';

const COP = (n) => '$' + Number(n || 0).toLocaleString('es-CO');

// Estrella graffiti (motivo de marca). Reutilizable como bullet/watermark.
function StarMark({ className, size = 24 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" fill="currentColor">
      <path d="M50 2 L61 38 L98 38 L68 60 L79 96 L50 74 L21 96 L32 60 L2 38 L39 38 Z" />
    </svg>
  );
}

export default function HomePageClient({ products = [] }) {
  const bestsellers = products.filter(p => p.bestseller).slice(0, 8);
  const fallbackGrid = products.slice(0, 8);
  const grid = bestsellers.length ? bestsellers : fallbackGrid;
  const spotlight = products.find(p => p.featured) || products[0] || null;

  return (
    <main id="main-content" className="sx6">
      {/* ===================== HERO ===================== */}
      <section className="sx6-hero">
        {/* Watermark: estrella gigante girando */}
        <StarMark className="sx6-hero-star" size={760} />
        <div className="sx6-hero-slash" />

        <div className="container sx6-hero-inner">
          <div className="sx6-hero-copy">
            <p className="sx6-eyebrow">
              <StarMark size={11} /> 6IXSTARS · STREETWEAR DESDE EL 6IX
            </p>
            <h1 className="sx6-hero-title">
              <span className="l1">ROPA QUE</span>
              <span className="l2"><span className="hl">PEGA</span> EN</span>
              <span className="l3">LA CALLE</span>
            </h1>
            <p className="sx6-hero-sub">
              Hoodies, camisetas oversize, cargos y gorras para los que no pasan
              desapercibidos. Hecho para la calle, no para el clóset.
            </p>
            <div className="sx6-hero-cta">
              <Link href="/tienda" className="sx6-btn sx6-btn-pink">
                VER LA TIENDA <ArrowUpRight size={18} />
              </Link>
              <Link href="/tienda?sort=nuevo" className="sx6-btn sx6-btn-ghost">
                NUEVO DROP
              </Link>
            </div>
          </div>

          {/* Drop card lateral */}
          <div className="sx6-hero-drop">
            <div className="sx6-drop-tag">DROP 01</div>
            <img src="/img/logo.png" alt="6ixstars" className="sx6-drop-logo" />
            <div className="sx6-drop-foot">
              <span>FW26</span>
              <span className="sx6-drop-live"><i /> EN VIVO</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MARQUEE ===================== */}
      <div className="sx6-marquee" aria-hidden="true">
        <div className="sx6-marquee-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="sx6-marquee-item">
              6IXSTARS <StarMark size={26} /> NUEVO DROP <StarMark size={26} />
            </span>
          ))}
        </div>
      </div>

      {/* ===================== TRUST ===================== */}
      <section className="container sx6-trust">
        {[
          { Icon: Truck, t: 'Envío a toda Colombia', d: 'Despacho en 24–48h' },
          { Icon: ShieldCheck, t: 'Pago seguro', d: 'Wompi · cifrado bancario' },
          { Icon: RefreshCw, t: 'Cambios fáciles', d: 'Cambia tu talla sin estrés' },
        ].map(({ Icon, t, d }) => (
          <div key={t} className="sx6-trust-item">
            <Icon size={20} />
            <div>
              <p className="sx6-trust-t">{t}</p>
              <p className="sx6-trust-d">{d}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ===================== CATEGORÍAS ===================== */}
      <section className="container sx6-section">
        <div className="sx6-head">
          <span className="sx6-head-kicker"><StarMark size={13} /> EXPLORA</span>
          <h2 className="sx6-head-title">CATEGORÍAS</h2>
        </div>
        <div className="sx6-cats">
          {collections.map((c, i) => (
            <Link key={c.id} href={`/tienda?cat=${c.id}`} className="sx6-cat">
              <span className="sx6-cat-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="sx6-cat-name">{c.name}</span>
              <span className="sx6-cat-desc">{c.description}</span>
              <ArrowUpRight className="sx6-cat-arrow" size={26} />
            </Link>
          ))}
        </div>
      </section>

      {/* ===================== TOP DROPS (grid) ===================== */}
      <section className="container sx6-section">
        <div className="sx6-head sx6-head-row">
          <div>
            <span className="sx6-head-kicker"><StarMark size={13} /> LO MÁS DURO</span>
            <h2 className="sx6-head-title">TOP DROPS</h2>
          </div>
          <Link href="/tienda?sort=bestseller" className="sx6-head-link">
            VER TODO <ArrowUpRight size={16} />
          </Link>
        </div>

        {grid.length ? (
          <div className="grid-4 sx6-grid">
            {grid.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
          </div>
        ) : (
          <div className="sx6-empty">
            <StarMark size={40} />
            <p>El catálogo está en camino. Conecta Supabase y corre <code>seed.sql</code> para ver los productos.</p>
            <Link href="/tienda" className="sx6-btn sx6-btn-ghost">IR A LA TIENDA</Link>
          </div>
        )}
      </section>

      {/* ===================== MANIFIESTO ===================== */}
      <section className="sx6-manifesto">
        <StarMark className="sx6-mani-star" size={420} />
        <div className="container sx6-mani-inner">
          <h2 className="sx6-mani-title">
            HECHO PARA<br />LA CALLE.<br /><span>NO PARA EL CLÓSET.</span>
          </h2>
          <p className="sx6-mani-text">
            6ixstars nació en la calle y se queda ahí. Telas pesadas, fits reales y
            piezas en cantidades limitadas. Cuando se agota, se agota.
          </p>
        </div>
      </section>

      {/* ===================== SPOTLIGHT ===================== */}
      {spotlight && (
        <section className="container sx6-section">
          <div className="sx6-spot">
            <Link href={`/producto/${spotlight.slug}`} className="sx6-spot-img">
              <img src={spotlight.images?.[0] || '/img/placeholder.webp'} alt={spotlight.name} />
              <span className="sx6-spot-badge">DESTACADO</span>
            </Link>
            <div className="sx6-spot-info">
              <span className="sx6-head-kicker"><StarMark size={13} /> PIEZA DESTACADA</span>
              <h2 className="sx6-spot-name">{spotlight.name}</h2>
              <p className="sx6-spot-desc">{spotlight.description}</p>
              {spotlight.price > 0 && <p className="sx6-spot-price">{COP(spotlight.price)}</p>}
              <Link href={`/producto/${spotlight.slug}`} className="sx6-btn sx6-btn-pink">
                VER PIEZA <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===================== RESEÑAS ===================== */}
      <section className="container sx6-section">
        <div className="sx6-head">
          <span className="sx6-head-kicker"><StarMark size={13} /> LA GENTE HABLA</span>
          <h2 className="sx6-head-title">RESEÑAS</h2>
        </div>
        <div className="sx6-reviews">
          {testimonials.map(t => (
            <figure key={t.id} className="sx6-review">
              <div className="sx6-review-stars">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
              </div>
              <blockquote>{t.text}</blockquote>
              <figcaption>
                <strong>{t.name}</strong>
                <span>{t.location} · {t.product}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ===================== NEWSLETTER / COMUNIDAD ===================== */}
      <section className="sx6-join">
        <div className="container sx6-join-inner">
          <StarMark size={40} />
          <h2 className="sx6-join-title">ÚNETE AL <span>6IX</span></h2>
          <p className="sx6-join-text">
            Enterate de los drops antes que nadie. Acceso anticipado, descuentos y nada de spam.
          </p>
          <form className="sx6-join-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="tu@correo.com" aria-label="Correo electrónico" />
            <button type="submit">SUSCRIBIRME</button>
          </form>
          <a href="https://www.instagram.com/6ixstars/" target="_blank" rel="noopener noreferrer" className="sx6-join-ig">
            <IgGlyph size={16} /> @6ixstars
          </a>
        </div>
      </section>

      <HomeStyles />
    </main>
  );
}

function HomeStyles() {
  return (
    <style>{`
      .sx6 { background: var(--black); overflow: clip; }
      .sx6 ::selection { background: var(--gold); color: #0B0B0C; }

      /* ---------- HERO ---------- */
      .sx6-hero {
        position: relative;
        min-height: clamp(560px, 88vh, 900px);
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--dark-4);
        overflow: clip;
      }
      .sx6-hero-star {
        position: absolute;
        right: -180px; top: 50%;
        transform: translateY(-50%);
        color: var(--dark-2);
        opacity: .55;
        animation: sx6-spin 60s linear infinite;
        pointer-events: none;
      }
      @keyframes sx6-spin { to { transform: translateY(-50%) rotate(360deg); } }
      .sx6-hero-slash {
        position: absolute;
        inset: 0;
        background: linear-gradient(115deg, transparent 0 58%, rgba(255,46,126,.10) 58% 62%, transparent 62%);
        pointer-events: none;
      }
      .sx6-hero-inner {
        position: relative;
        z-index: 2;
        display: grid;
        grid-template-columns: 1.5fr .9fr;
        align-items: center;
        gap: 48px;
        padding-top: 64px;
        padding-bottom: 64px;
      }
      .sx6-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        color: var(--gold);
        font-size: .72rem; font-weight: 800; letter-spacing: .22em;
        margin-bottom: 22px;
      }
      .sx6-hero-title {
        font-family: var(--font-display);
        text-transform: uppercase;
        line-height: .86;
        font-size: clamp(3.2rem, 11vw, 9.5rem);
        color: var(--white);
        margin: 0;
        letter-spacing: -.01em;
      }
      .sx6-hero-title span { display: block; }
      .sx6-hero-title .l1 { animation: sx6-up .7s .05s both; }
      .sx6-hero-title .l2 { animation: sx6-up .7s .15s both; }
      .sx6-hero-title .l3 { animation: sx6-up .7s .25s both; }
      .sx6-hero-title .hl {
        color: transparent;
        -webkit-text-stroke: 2px var(--gold);
        text-shadow: 0 0 30px rgba(255,46,126,.4);
      }
      @keyframes sx6-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
      .sx6-hero-sub {
        max-width: 440px;
        margin: 26px 0 30px;
        color: var(--gray-light);
        font-size: 1.02rem;
        line-height: 1.7;
        animation: sx6-up .7s .35s both;
      }
      .sx6-hero-cta { display: flex; gap: 12px; flex-wrap: wrap; animation: sx6-up .7s .45s both; }

      .sx6-btn {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: var(--font-sans);
        font-weight: 800; font-size: .82rem; letter-spacing: .1em;
        text-transform: uppercase;
        padding: 16px 28px;
        border-radius: 2px;
        transition: transform .2s, background .2s, color .2s, box-shadow .2s;
      }
      .sx6-btn-pink { background: var(--gold); color: #0B0B0C; box-shadow: 0 8px 30px rgba(255,46,126,.3); }
      .sx6-btn-pink:hover { background: #fff; transform: translateY(-2px); }
      .sx6-btn-ghost { background: transparent; color: var(--white); border: 1.5px solid var(--dark-4); }
      .sx6-btn-ghost:hover { border-color: var(--gold); color: var(--gold); transform: translateY(-2px); }

      /* Drop card */
      .sx6-hero-drop {
        position: relative;
        justify-self: end;
        width: min(360px, 90%);
        aspect-ratio: 4/5;
        background:
          radial-gradient(120% 120% at 70% 10%, rgba(255,46,126,.18), transparent 60%),
          #121214;
        border: 1px solid var(--dark-4);
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 28px;
        animation: sx6-up .8s .3s both;
        box-shadow: 0 40px 80px rgba(0,0,0,.6);
      }
      .sx6-drop-tag {
        position: absolute; top: 16px; left: 16px;
        background: var(--gold); color: #0B0B0C;
        font-family: var(--font-display);
        font-size: 1rem; letter-spacing: .04em;
        padding: 5px 12px; border-radius: 2px;
      }
      .sx6-drop-logo { width: 78%; height: auto; filter: drop-shadow(0 8px 30px rgba(255,46,126,.4)); }
      .sx6-drop-foot {
        position: absolute; bottom: 16px; left: 16px; right: 16px;
        display: flex; align-items: center; justify-content: space-between;
        font-family: var(--font-sans); font-weight: 800; font-size: .72rem;
        letter-spacing: .14em; color: var(--gray-light);
      }
      .sx6-drop-live { display: inline-flex; align-items: center; gap: 7px; color: var(--gold); }
      .sx6-drop-live i { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); animation: sx6-pulse 1.4s infinite; }
      @keyframes sx6-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .4; transform: scale(.7); } }

      /* ---------- MARQUEE ---------- */
      .sx6-marquee {
        background: var(--gold);
        overflow: hidden;
        padding: 14px 0;
        border-top: 2px solid #0B0B0C;
        border-bottom: 2px solid #0B0B0C;
      }
      .sx6-marquee-track {
        display: flex; align-items: center; width: max-content;
        animation: sx6-marq 30s linear infinite;
      }
      @keyframes sx6-marq { to { transform: translateX(-50%); } }
      .sx6-marquee-item {
        display: inline-flex; align-items: center; gap: 18px;
        font-family: var(--font-display);
        font-size: 1.5rem; letter-spacing: .02em;
        color: #0B0B0C;
        padding: 0 18px;
        white-space: nowrap;
      }

      /* ---------- TRUST ---------- */
      .sx6-trust {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 16px; padding-top: 28px; padding-bottom: 28px;
        border-bottom: 1px solid var(--dark-4);
      }
      .sx6-trust-item { display: flex; align-items: center; gap: 12px; color: var(--gold); }
      .sx6-trust-t { color: var(--white); font-weight: 800; font-size: .9rem; text-transform: uppercase; letter-spacing: .03em; }
      .sx6-trust-d { color: var(--gray); font-size: .8rem; margin-top: 2px; }

      /* ---------- SECTION / HEAD ---------- */
      .sx6-section { padding-top: 80px; padding-bottom: 20px; }
      .sx6-head { margin-bottom: 36px; }
      .sx6-head-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
      .sx6-head-kicker {
        display: inline-flex; align-items: center; gap: 8px;
        color: var(--gold); font-weight: 800; font-size: .72rem; letter-spacing: .22em;
        margin-bottom: 8px;
      }
      .sx6-head-title {
        font-family: var(--font-display);
        font-size: clamp(2.4rem, 6vw, 5rem);
        color: var(--white);
        line-height: .9; margin: 0;
      }
      .sx6-head-link {
        display: inline-flex; align-items: center; gap: 6px;
        color: var(--white); font-weight: 800; font-size: .78rem;
        letter-spacing: .1em; text-transform: uppercase;
        border-bottom: 2px solid var(--gold); padding-bottom: 4px;
        white-space: nowrap; transition: color .2s, gap .2s;
      }
      .sx6-head-link:hover { color: var(--gold); gap: 12px; }

      /* ---------- CATEGORÍAS ---------- */
      .sx6-cats { border-top: 1px solid var(--dark-4); }
      .sx6-cat {
        position: relative;
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        align-items: center;
        gap: 24px;
        padding: 26px 8px;
        border-bottom: 1px solid var(--dark-4);
        overflow: hidden;
        transition: padding-left .3s;
      }
      .sx6-cat::before {
        content: ''; position: absolute; inset: 0;
        background: var(--gold); transform: translateX(-101%);
        transition: transform .4s cubic-bezier(.16,1,.3,1); z-index: 0;
      }
      .sx6-cat:hover::before { transform: translateX(0); }
      .sx6-cat:hover { padding-left: 24px; }
      .sx6-cat > * { position: relative; z-index: 1; transition: color .3s; }
      .sx6-cat-num { font-family: var(--font-display); font-size: 1.1rem; color: var(--gray); }
      .sx6-cat-name {
        font-family: var(--font-display);
        font-size: clamp(1.6rem, 4vw, 2.8rem);
        color: var(--white);
        text-transform: uppercase; line-height: 1;
      }
      .sx6-cat-desc { color: var(--gray); font-size: .85rem; text-align: right; }
      .sx6-cat-arrow { color: var(--gold); }
      .sx6-cat:hover .sx6-cat-num,
      .sx6-cat:hover .sx6-cat-name,
      .sx6-cat:hover .sx6-cat-desc,
      .sx6-cat:hover .sx6-cat-arrow { color: #0B0B0C; }

      /* ---------- GRID / EMPTY ---------- */
      .sx6-grid { margin-top: 4px; }
      .sx6-empty {
        display: flex; flex-direction: column; align-items: center; gap: 16px;
        text-align: center; padding: 60px 20px;
        border: 1px dashed var(--dark-4); border-radius: 8px;
        color: var(--gray);
      }
      .sx6-empty > svg { color: var(--dark-4); }
      .sx6-empty p { max-width: 460px; }
      .sx6-empty code { color: var(--gold); font-family: ui-monospace, monospace; }

      /* ---------- MANIFIESTO ---------- */
      .sx6-manifesto {
        position: relative; overflow: clip;
        background: var(--gold); color: #0B0B0C;
        margin-top: 80px;
        padding: clamp(64px, 10vw, 130px) 0;
      }
      .sx6-mani-star {
        position: absolute; right: -90px; bottom: -90px;
        color: rgba(11,11,12,.12);
        animation: sx6-spin 50s linear infinite;
      }
      .sx6-mani-inner { position: relative; z-index: 1; display: grid; grid-template-columns: 1.3fr 1fr; gap: 40px; align-items: end; }
      .sx6-mani-title {
        font-family: var(--font-display);
        font-size: clamp(2.6rem, 8vw, 6.5rem);
        line-height: .9; margin: 0; color: #0B0B0C;
      }
      .sx6-mani-title span { color: #fff; -webkit-text-stroke: 2px #0B0B0C; }
      .sx6-mani-text { font-size: 1.05rem; font-weight: 600; line-height: 1.6; color: #0B0B0C; max-width: 380px; }

      /* ---------- SPOTLIGHT ---------- */
      .sx6-spot { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
      .sx6-spot-img {
        position: relative; display: block; aspect-ratio: 4/5;
        background: #141416; border-radius: 6px; overflow: hidden;
        border: 1px solid var(--dark-4);
      }
      .sx6-spot-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s; }
      .sx6-spot-img:hover img { transform: scale(1.04); }
      .sx6-spot-badge {
        position: absolute; top: 16px; left: 16px;
        background: var(--gold); color: #0B0B0C;
        font-weight: 800; font-size: .68rem; letter-spacing: .14em;
        padding: 5px 12px; border-radius: 2px;
      }
      .sx6-spot-name { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3.6rem); color: var(--white); line-height: .95; margin: 8px 0 16px; text-transform: uppercase; }
      .sx6-spot-desc { color: var(--gray-light); line-height: 1.7; margin-bottom: 18px; max-width: 440px; }
      .sx6-spot-price { font-family: var(--font-display); font-size: 2rem; color: var(--gold); margin-bottom: 24px; }

      /* ---------- RESEÑAS ---------- */
      .sx6-reviews { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .sx6-review {
        background: var(--dark-2); border: 1px solid var(--dark-4);
        border-radius: 6px; padding: 24px; margin: 0;
        display: flex; flex-direction: column; gap: 14px;
      }
      .sx6-review-stars { color: var(--gold); display: flex; gap: 2px; }
      .sx6-review blockquote { color: var(--white); font-size: .95rem; line-height: 1.6; margin: 0; flex: 1; }
      .sx6-review figcaption { display: flex; flex-direction: column; gap: 2px; border-top: 1px solid var(--dark-4); padding-top: 12px; }
      .sx6-review figcaption strong { color: var(--white); font-size: .9rem; }
      .sx6-review figcaption span { color: var(--gray); font-size: .76rem; }

      /* ---------- JOIN ---------- */
      .sx6-join {
        margin-top: 80px;
        border-top: 1px solid var(--dark-4);
        background: radial-gradient(120% 120% at 50% 0%, rgba(255,46,126,.12), transparent 55%);
        padding: clamp(64px, 9vw, 110px) 0;
      }
      .sx6-join-inner { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; }
      .sx6-join-inner > svg { color: var(--gold); }
      .sx6-join-title { font-family: var(--font-display); font-size: clamp(2.6rem, 7vw, 5.5rem); color: var(--white); margin: 0; line-height: .9; }
      .sx6-join-title span { color: var(--gold); }
      .sx6-join-text { color: var(--gray-light); max-width: 460px; }
      .sx6-join-form { display: flex; gap: 8px; width: min(460px, 100%); margin-top: 12px; }
      .sx6-join-form input {
        flex: 1; min-width: 0;
        background: var(--dark-2); border: 1.5px solid var(--dark-4);
        border-radius: 2px; padding: 15px 16px; color: var(--white);
        font-family: var(--font-sans); font-size: .95rem; outline: none;
        transition: border-color .2s;
      }
      .sx6-join-form input:focus { border-color: var(--gold); }
      .sx6-join-form button {
        background: var(--gold); color: #0B0B0C;
        font-weight: 800; font-size: .8rem; letter-spacing: .08em;
        padding: 0 24px; border-radius: 2px; white-space: nowrap;
        transition: background .2s;
      }
      .sx6-join-form button:hover { background: #fff; }
      .sx6-join-ig {
        display: inline-flex; align-items: center; gap: 8px;
        color: var(--gray-light); font-weight: 700; font-size: .85rem;
        margin-top: 6px; transition: color .2s;
      }
      .sx6-join-ig:hover { color: var(--gold); }

      /* ---------- RESPONSIVE ---------- */
      @media (max-width: 1024px) {
        .sx6-reviews { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 900px) {
        .sx6-hero-inner { grid-template-columns: 1fr; gap: 36px; }
        .sx6-hero-drop { justify-self: start; width: min(300px, 80%); }
        .sx6-mani-inner { grid-template-columns: 1fr; gap: 20px; }
        .sx6-spot { grid-template-columns: 1fr; gap: 28px; }
        .sx6-trust { grid-template-columns: 1fr; gap: 12px; }
      }
      @media (max-width: 640px) {
        .sx6-cat { grid-template-columns: auto 1fr auto; gap: 14px; }
        .sx6-cat-desc { display: none; }
        .sx6-join-form { flex-direction: column; }
        .sx6-join-form button { padding: 14px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .sx6-hero-star, .sx6-mani-star, .sx6-marquee-track, .sx6-drop-live i { animation: none !important; }
        .sx6-hero-title span, .sx6-hero-sub, .sx6-hero-cta, .sx6-hero-drop { animation: none !important; opacity: 1 !important; transform: none !important; }
      }
    `}</style>
  );
}
