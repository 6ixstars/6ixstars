'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useQuickViewStore } from '@/lib/store/quickViewStore';
import { getImagePath } from '@/lib/products-constants';
import { formatCOP } from '@/lib/format';
import toast from 'react-hot-toast';

const PLACEHOLDER = '/img/placeholder.webp';
const CARD_SIZES = '(max-width: 640px) 50vw, (max-width: 900px) 50vw, (max-width: 1024px) 33vw, 25vw';

const TOAST = { style: { background: '#1A1A1D', color: '#F5F5F6', border: '1px solid rgba(255,46,126,.35)', fontFamily: 'var(--font-sans)' }, iconTheme: { primary: '#FF2E7E', secondary: '#0B0B0C' } };

export default function ProductCard({ product, priority = false }) {
  const [hovered, setHovered] = useState(false);
  const hasRealImages = product.images?.length && !product.images[0]?.includes('placeholder');
  const initialImg = hasRealImages ? product.images[0] : getImagePath(product);
  const [imgSrc, setImgSrc] = useState(initialImg);
  const { addItem } = useCartStore();
  const { items: rawWishlist, toggle: toggleWishlist } = useWishlistStore();
  const openQuickView = useQuickViewStore((s) => s.open);
  const wishlistItems = Array.isArray(rawWishlist) ? rawWishlist : [];
  const wishlisted = wishlistItems.some(i => i?.id === product.id);

  const hasPrice = product.price > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasPrice) {
      toast.error('Producto sin precio. Consúltanos por WhatsApp.', TOAST);
      return;
    }
    const defaultSize = product.sizes?.[1]?.ml || product.sizes?.[0]?.ml;
    addItem(product, defaultSize);
    toast.success(`${product.name} agregado`, TOAST);
  };

  return (
    <Link href={`/producto/${product.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      >
        {/* Image */}
        <div className="product-card-img-wrap" style={{ aspectRatio: '3/4' }}>
          <Image
            src={imgSrc}
            alt={`${product.name} — ${product.brand} ${product.category || ''}`.trim()}
            fill
            sizes={CARD_SIZES}
            style={{ objectFit: 'cover' }}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            onError={() => { if (imgSrc !== PLACEHOLDER) setImgSrc(PLACEHOLDER); }}
          />

          {/* Badges */}
          {(product.badge || (product.stock > 0 && product.stock <= 5)) && (
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 2 }}>
              {product.badge && (
                <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '3px 10px', background: product.badgeColor || 'var(--gold)', color: '#FAF8F3', borderRadius: 2 }}>{product.badge}</span>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 10px', background: 'rgba(26,22,16,.75)', color: 'var(--gold-light)', borderRadius: 2 }}>
                  Últimas {product.stock}
                </span>
              )}
            </div>
          )}

          {/* Wishlist */}
          <button
            className={`product-card-wishlist ${hovered ? 'is-hover' : ''}`}
            onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
            aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={wishlisted}
            style={{
              position: 'absolute', top: 10, right: 10, zIndex: 2,
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(246,243,238,.85)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: wishlisted ? '#C04A5C' : 'var(--gray)',
              border: 'none', cursor: 'pointer',
              transition: 'opacity .25s',
            }}
          >
            <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Hover overlay + CTA */}
          <div className="product-card-overlay">
            <div className="product-card-cta">
              <button
                id={`add-to-cart-${product.id}`}
                onClick={handleAddToCart}
                disabled={!hasPrice}
                style={{
                  flex: 1, padding: '11px 0',
                  background: hasPrice ? 'var(--gold)' : 'rgba(122,110,94,.55)',
                  color: '#FAF8F3',
                  fontSize: '.7rem', fontWeight: 600, letterSpacing: '.15em',
                  textTransform: 'uppercase', border: 'none',
                  cursor: hasPrice ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-sans)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <ShoppingBag size={13} /> {hasPrice ? 'Agregar' : 'Consultar'}
              </button>
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}
                aria-label={`Vista rápida de ${product.name}`}
                style={{
                  width: 44, minHeight: 44, background: 'rgba(246,243,238,.12)',
                  border: '1px solid rgba(246,243,238,.25)',
                  color: '#FAF8F3', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Eye size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="product-card-info">
          <p style={{ fontSize: '.62rem', letterSpacing: '.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
            {product.brand}
          </p>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'var(--white)', fontWeight: 700, lineHeight: 1.25, marginBottom: 8, textTransform: 'none' }}>
            {product.name}
            {product.type && <span style={{ fontSize: '.78rem', color: 'var(--gray)', marginLeft: 6, fontWeight: 500 }}>· {product.type}</span>}
          </h3>
          <span style={{ fontSize: '.98rem', fontWeight: 700, color: product.price > 0 ? 'var(--white)' : 'var(--gray)', letterSpacing: '.01em' }}>
            {product.price > 0 ? formatCOP(product.price) : 'Consultar precio'}
          </span>
        </div>
      </article>
    </Link>
  );
}
