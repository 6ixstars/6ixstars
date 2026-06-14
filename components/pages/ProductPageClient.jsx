'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, Star, Truck, ShieldCheck, RefreshCw, Check, ChevronDown, Users, Ruler } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { Reveal } from '@/components/ui/ScrollAnimations';
import ProductCard from '@/components/ui/ProductCard';
import ProductReviews from '@/components/ui/ProductReviews';
import { getImagePath, categoryLabels } from '@/lib/products-constants';
import { formatCOP } from '@/lib/format';
import toast from 'react-hot-toast';

const TOAST = {
  style: { background: '#1A1A1D', color: '#F5F5F6', border: '1px solid rgba(255,46,126,.35)', fontFamily: 'var(--font-sans)' },
  iconTheme: { primary: '#FF2E7E', secondary: '#0B0B0C' },
};

const GENDER_LABELS = { hombre: 'Hombre', mujer: 'Mujer', unisex: 'Unisex' };

const faqItems = [
  { q: '¿Cómo sé mi talla?', a: 'Cada prenda indica su fit (oversize, regular, boxy). Si dudas entre dos tallas en oversize, pide la menor. Escríbenos y te ayudamos a elegir.' },
  { q: '¿Cuánto tarda el envío?', a: 'Despachamos en 24–48h a toda Colombia. Recibe el número de guía apenas tu pedido sale.' },
  { q: '¿Puedo cambiar la talla?', a: 'Sí. Tienes 15 días para cambiar tu prenda por otra talla, siempre que esté sin uso y con etiqueta.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--dark-4)' }}>
      <button onClick={() => setOpen(o => !o)} data-cursor="hover" style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '12px',
      }}>
        <span style={{ fontWeight: 700, color: 'var(--white)', fontSize: '.9rem' }}>{q}</span>
        <ChevronDown size={16} style={{ color: 'var(--gold)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }} />
      </button>
      {open && <p style={{ color: 'var(--gray-light)', fontSize: '.88rem', lineHeight: 1.7, paddingBottom: '16px' }}>{a}</p>}
    </div>
  );
}

export default function ProductPageClient({ product, resolvedImages, related = [] }) {
  const productSizes = product?.sizes || [];
  const inStock = (s) => (s?.stock ?? 1) > 0;
  const firstAvailable = productSizes.find(inStock) || productSizes[0];
  const [selSize, setSelSize] = useState(firstAvailable?.ml || null);
  const selectedSizeObj = productSizes.find(s => s.ml === selSize) || firstAvailable;
  const displayPrice = selectedSizeObj?.price ?? product?.price ?? 0;
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('descripcion');
  const { addItem } = useCartStore();
  const { items: rawWishlist, toggle: toggleWishlist } = useWishlistStore();
  const wishlistItems = Array.isArray(rawWishlist) ? rawWishlist : [];
  const wishlisted = product ? wishlistItems.some(i => i?.id === product.id) : false;

  const [realReviews, setRealReviews] = useState([]);
  useEffect(() => {
    if (!product?.slug) return;
    fetch(`/api/reviews?slug=${product.slug}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => Array.isArray(data) && setRealReviews(data))
      .catch(() => {});
  }, [product?.slug]);

  const [liveViewers, setLiveViewers] = useState(null);
  useEffect(() => { setLiveViewers(Math.floor(Math.random() * 20) + 8); }, []);

  const reviewCount = realReviews.length;
  const avgRating = realReviews.length
    ? (realReviews.reduce((s, r) => s + r.rating, 0) / realReviews.length).toFixed(1)
    : 0;
  const recommendPct = realReviews.length
    ? Math.round(realReviews.filter(r => r.rating >= 4).length / realReviews.length * 100)
    : null;

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '120px 24px' }}>
      <h2 style={{ color: 'var(--white)' }}>Producto no encontrado</h2>
      <Link href="/tienda" className="btn btn-outline" style={{ marginTop: '24px' }}>Volver a la Tienda</Link>
    </div>
  );

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
  const catLabel = categoryLabels[product.category] || product.category;
  const genderLabel = GENDER_LABELS[product.gender] || product.gender;

  const hasRealImages = product.images?.length && !product.images[0]?.includes('placeholder');
  const productImages = (resolvedImages && resolvedImages.length)
    ? resolvedImages
    : (hasRealImages ? product.images : [getImagePath(product)]);

  const handleAdd = () => {
    if (displayPrice <= 0) { toast.error('Producto sin precio. Consúltanos por WhatsApp.', TOAST); return; }
    if (!selSize) { toast.error('Elige una talla.', TOAST); return; }
    for (let i = 0; i < qty; i++) addItem(product, selSize);
    toast.success(`${product.name} (${selSize}) agregado`, TOAST);
  };

  const handleBuyNow = () => {
    if (displayPrice <= 0) { toast.error('Producto sin precio. Consúltanos por WhatsApp.', TOAST); return; }
    if (!selSize) { toast.error('Elige una talla.', TOAST); return; }
    addItem(product, selSize);
    window.location.href = '/checkout';
  };

  // Highlights de la prenda (reemplazan los "benefits" de perfume).
  const highlights = [
    product.material && `Material: ${product.material}`,
    product.fit && `Fit: ${product.fit}`,
    product.color && `Color: ${product.color}`,
  ].filter(Boolean);

  return (
    <main className="pdp-light">
      {/* URGENCY BANNER */}
      {product.stock > 0 && product.stock <= 15 && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(255,46,126,.08), rgba(255,46,126,.16), rgba(255,46,126,.08))',
          borderBottom: '1px solid rgba(255,46,126,.3)',
          padding: '10px 24px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '.82rem', color: 'var(--gold)', fontWeight: 800, letterSpacing: '.04em' }}>
            🔥 ¡Solo quedan <strong>{product.stock} unidades</strong>! {product.stock <= 5 ? 'Último stock.' : 'Pide antes de que se agote.'}
          </p>
        </div>
      )}

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* BREADCRUMB */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', fontSize: '.78rem', color: 'var(--gray)', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--gray)' }}>Inicio</Link>
          <span>/</span>
          <Link href="/tienda" style={{ color: 'var(--gray)' }}>Tienda</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/tienda?cat=${product.category}`} style={{ color: 'var(--gold)' }}>{catLabel}</Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: 'var(--white)' }}>{product.name}</span>
        </nav>

        {/* MAIN GRID */}
        <div className="product-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', marginBottom: '80px', alignItems: 'start' }}>

          {/* LEFT: GALLERY */}
          <div className="product-gallery" style={{ position: 'sticky', top: '100px' }}>
            <div className="product-main-img" style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '14px', overflow: 'hidden', background: '#141416', marginBottom: '12px' }}>
              <img
                src={productImages[imgIdx]}
                alt={`${product.name} — ${product.brand}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                onError={e => { e.currentTarget.src = '/img/placeholder.webp'; }}
              />
              <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {product.badge && (
                  <span className="badge" style={{ background: product.badgeColor || 'var(--gold)' }}>{product.badge}</span>
                )}
                {discount && (
                  <span className="badge" style={{ background: 'var(--gold-dark)', color: '#fff' }}>-{discount}%</span>
                )}
              </div>
              <button
                onClick={() => toggleWishlist(product)}
                data-cursor="hover"
                aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                style={{
                  position: 'absolute', top: 16, right: 16, width: 42, height: 42, borderRadius: '50%',
                  background: 'rgba(11,11,12,.6)', backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: wishlisted ? 'var(--gold)' : 'var(--white)',
                  border: '1px solid var(--dark-4)', cursor: 'pointer', transition: 'all .2s',
                }}
              >
                <Heart size={17} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
            {productImages.length > 1 && (
              <div className="product-thumbs" style={{ display: 'flex', gap: '10px' }}>
                {productImages.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className="product-thumb" data-cursor="hover" style={{
                    borderRadius: '8px', overflow: 'hidden', flexShrink: 0,
                    border: `2px solid ${imgIdx === i ? 'var(--gold)' : 'var(--dark-4)'}`,
                    transition: 'border-color .2s', padding: 0, background: 'var(--dark-2)',
                  }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PURCHASE PANEL */}
          <div>
            {/* Brand + meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '.72rem', color: 'var(--gold)', letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 800 }}>{product.brand}</span>
              <span style={{ color: 'var(--dark-4)' }}>·</span>
              <span style={{ fontSize: '.72rem', color: 'var(--gray)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{genderLabel}</span>
              {catLabel && (
                <>
                  <span style={{ color: 'var(--dark-4)' }}>·</span>
                  <span style={{ fontSize: '.7rem', padding: '2px 10px', borderRadius: '99px', background: 'rgba(255,46,126,.12)', color: 'var(--gold)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                    {catLabel}
                  </span>
                </>
              )}
            </div>

            {/* Name */}
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, textTransform: 'uppercase', color: 'var(--white)', marginBottom: '14px', fontSize: 'clamp(2rem,4vw,3.2rem)', lineHeight: .95 }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              {realReviews.length > 0 ? (
                <>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={15} style={{ color: 'var(--gold)' }} fill={s <= Math.round(Number(avgRating)) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--white)', fontSize: '.9rem' }}>{avgRating}</span>
                  <span style={{ color: 'var(--gray)', fontSize: '.85rem' }}>({reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'})</span>
                </>
              ) : (
                <span style={{ color: 'var(--gray)', fontSize: '.85rem' }}>Aún sin reseñas — sé el primero en opinar</span>
              )}
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', color: 'var(--gold)', fontWeight: 400 }}>
                {displayPrice > 0 ? formatCOP(displayPrice) : 'Consultar precio'}
              </span>
              {product.originalPrice > 0 && (
                <span style={{ fontSize: '1.2rem', color: 'var(--gray)', textDecoration: 'line-through' }}>
                  {formatCOP(product.originalPrice)}
                </span>
              )}
              {discount && (
                <span style={{ background: 'var(--gold)', color: '#0B0B0C', fontSize: '.78rem', fontWeight: 800, padding: '4px 10px', borderRadius: '99px' }}>
                  -{discount}%
                </span>
              )}
            </div>
            <p style={{ fontSize: '.78rem', color: 'var(--gray)', marginBottom: '24px' }}>
              Impuestos incluidos · Envío calculado al finalizar
            </p>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,46,126,.05)', borderRadius: '10px', border: '1px solid rgba(255,46,126,.15)' }}>
                {highlights.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: i < highlights.length - 1 ? '10px' : 0 }}>
                    <Check size={15} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '.88rem', color: 'var(--gray-light)', lineHeight: 1.5 }}>{b}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Size Selector */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '.8rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gray-light)' }}>
                  Talla: <span style={{ color: 'var(--gold)' }}>{selSize || '—'}</span>
                </label>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.72rem', color: 'var(--gray)' }}>
                  <Ruler size={13} /> Guía de tallas
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {productSizes.map(s => {
                  const avail = inStock(s);
                  const active = selSize === s.ml;
                  return (
                    <button
                      key={s.ml}
                      onClick={() => avail && setSelSize(s.ml)}
                      disabled={!avail}
                      data-cursor="hover"
                      title={avail ? '' : 'Agotada'}
                      style={{
                        minWidth: 52, padding: '12px 16px', borderRadius: '6px', border: '1.5px solid',
                        borderColor: active ? 'var(--gold)' : 'var(--dark-4)',
                        background: active ? 'var(--gold)' : 'transparent',
                        color: active ? '#0B0B0C' : (avail ? 'var(--white)' : 'var(--gray)'),
                        fontSize: '.9rem', fontWeight: 800, transition: 'all .2s',
                        cursor: avail ? 'pointer' : 'not-allowed',
                        textDecoration: avail ? 'none' : 'line-through', opacity: avail ? 1 : .5,
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {s.size || s.ml}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Qty + CTA */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--dark-4)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} data-cursor="hover" style={{ width: 44, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)', fontSize: '1.2rem', background: 'var(--dark-2)', cursor: 'pointer' }}>−</button>
                <span style={{ width: 44, textAlign: 'center', fontWeight: 800, color: 'var(--white)', background: 'var(--dark-3)', lineHeight: '56px' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} data-cursor="hover" style={{ width: 44, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)', fontSize: '1.2rem', background: 'var(--dark-2)', cursor: 'pointer' }}>+</button>
              </div>
              <button
                onClick={handleAdd}
                disabled={displayPrice <= 0}
                className="btn btn-primary"
                data-cursor="hover"
                style={{ flex: 1, fontSize: '.95rem', height: '56px', opacity: displayPrice <= 0 ? 0.55 : 1, cursor: displayPrice <= 0 ? 'not-allowed' : 'pointer' }}
              >
                <ShoppingBag size={18} /> {displayPrice > 0 ? 'Agregar al carrito' : 'Consultar precio'}
              </button>
            </div>

            {displayPrice > 0 && (
              <button onClick={handleBuyNow} className="btn btn-outline btn-full" data-cursor="hover" style={{ marginBottom: '20px', height: '52px' }}>
                Comprar ahora — {formatCOP(displayPrice * qty)}
              </button>
            )}

            {/* Trust Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {[
                { icon: Truck, title: 'Envío 24–48h', desc: 'a toda Colombia' },
                { icon: ShieldCheck, title: 'Pago seguro', desc: 'Wompi' },
                { icon: RefreshCw, title: 'Cambios', desc: '15 días' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--dark-2)', borderRadius: '8px', border: '1px solid var(--dark-4)' }}>
                  <Icon size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--white)' }}>{title}</p>
                    <p style={{ fontSize: '.65rem', color: 'var(--gray)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {liveViewers !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(255,46,126,.06)', border: '1px solid rgba(255,46,126,.2)', borderRadius: '8px', marginBottom: '28px' }}>
                <Users size={15} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: '.82rem', color: 'var(--gold)', fontWeight: 700 }}>
                  🟢 {liveViewers} personas están viendo esto ahora
                </span>
              </div>
            )}

            {/* TABS */}
            <div style={{ borderTop: '1px solid var(--dark-4)', paddingTop: '24px' }}>
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--dark-4)', marginBottom: '20px', overflowX: 'auto' }}>
                {[
                  { id: 'descripcion', label: 'Descripción' },
                  { id: 'detalles', label: 'Detalles' },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} data-cursor="hover" style={{
                    padding: '10px 18px', fontSize: '.78rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
                    border: 'none', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                    color: tab === t.id ? 'var(--gold)' : 'var(--gray)',
                    borderBottom: `2px solid ${tab === t.id ? 'var(--gold)' : 'transparent'}`,
                    marginBottom: '-1px', transition: 'color .2s',
                  }}>{t.label}</button>
                ))}
              </div>

              {tab === 'descripcion' && (
                <p style={{ color: 'var(--gray-light)', lineHeight: 1.9, fontSize: '.95rem' }}>
                  {product.description || 'Sin descripción por ahora.'}
                </p>
              )}

              {tab === 'detalles' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    ['Material', product.material],
                    ['Fit', product.fit],
                    ['Color', product.color],
                    ['Género', genderLabel],
                    ['Categoría', catLabel],
                    ['Tallas', productSizes.map(s => s.size || s.ml).join(' · ')],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} style={{ padding: '12px 16px', background: 'var(--dark-2)', borderRadius: '8px', border: '1px solid var(--dark-4)' }}>
                      <p style={{ fontSize: '.68rem', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '4px' }}>{k}</p>
                      <p style={{ color: 'var(--white)', fontWeight: 700, fontSize: '.9rem' }}>{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SOCIAL PROOF BANNER */}
        <div className="pdp-social-proof" style={{ background: 'linear-gradient(135deg, var(--dark-2), var(--dark-3))', border: '1px solid rgba(255,46,126,.15)', borderRadius: '16px', marginBottom: '64px' }}>
          <div className="pdp-social-proof-grid">
            {[
              { icon: Truck, value: '24–48h', label: 'Envío a toda Colombia' },
              { icon: RefreshCw, value: '15 días', label: 'Para cambios de talla' },
              { icon: ShieldCheck, value: 'Wompi', label: 'Pago 100% seguro' },
              { icon: Star, value: '4.9/5', label: 'Valoración promedio' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="pdp-social-proof-item">
                <Icon className="pdp-social-proof-icon" style={{ color: 'var(--gold)' }} />
                <p className="pdp-social-proof-value">{value}</p>
                <p className="pdp-social-proof-label">{label}</p>
              </div>
            ))}
          </div>
          <style>{`
            .pdp-social-proof { padding: 32px; }
            .pdp-social-proof-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
            .pdp-social-proof-item { min-width: 0; }
            .pdp-social-proof-icon { width: 24px; height: 24px; margin: 0 auto 8px; display: block; }
            .pdp-social-proof-value { font-family: var(--font-display); font-size: 1.6rem; color: var(--white); font-weight: 400; margin-bottom: 4px; line-height: 1.15; word-break: break-word; }
            .pdp-social-proof-label { font-size: .78rem; color: var(--gray); letter-spacing: .04em; line-height: 1.35; }
            @media (max-width: 720px) {
              .pdp-social-proof { padding: 24px 18px; }
              .pdp-social-proof-grid { grid-template-columns: repeat(2, 1fr); gap: 22px 16px; }
              .pdp-social-proof-value { font-size: 1.3rem; }
              .pdp-social-proof-label { font-size: .72rem; }
            }
          `}</style>
        </div>

        {/* REVIEWS */}
        <ProductReviews
          productSlug={product.slug}
          initialRating={Number(avgRating)}
          initialCount={reviewCount}
        />

        {/* FAQ */}
        <div style={{ maxWidth: '700px', margin: '0 auto 64px' }}>
          <div className="section-header" style={{ marginBottom: '24px' }}>
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}>¿Tienes <em style={{ color: 'var(--gold)' }}>dudas?</em></h2>
          </div>
          <div style={{ background: 'var(--dark-2)', border: '1px solid var(--dark-4)', borderRadius: '12px', padding: '8px 24px' }}>
            {faqItems.map(item => <FaqItem key={item.q} {...item} />)}
          </div>
        </div>

        {/* RELATED */}
        {related.length > 0 && (
          <Reveal>
            <div style={{ marginBottom: '48px' }}>
              <div className="section-header" style={{ marginBottom: '32px' }}>
                <p className="eyebrow">También te puede gustar</p>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)' }}>Más <em style={{ color: 'var(--gold)' }}>prendas</em></h2>
              </div>
              <div className="grid-4">
                {related.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </Reveal>
        )}
      </div>

      {/* STICKY MOBILE CTA */}
      <div className="mobile-sticky-cta" role="region" aria-label="Acción de compra">
        <div className="mobile-sticky-cta-info">
          <p className="mobile-sticky-cta-size">Talla {selSize || '—'}</p>
          <p className="mobile-sticky-cta-price">
            {displayPrice > 0 ? formatCOP(displayPrice) : 'Consultar'}
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={displayPrice <= 0}
          className="btn btn-primary mobile-sticky-cta-btn"
          aria-label={displayPrice > 0 ? `Agregar ${product.name} al carrito` : 'Consultar precio'}
        >
          <ShoppingBag size={16} aria-hidden="true" />
          <span>{displayPrice > 0 ? 'Agregar' : 'Consultar'}</span>
        </button>
      </div>

      <style>{`
        @media(max-width:768px) {
          main > .container > div.product-main-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          main > .container > div.product-main-grid > div.product-gallery { position: static !important; }
        }
        @media(max-width:640px) {
          .grid-4 { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </main>
  );
}
