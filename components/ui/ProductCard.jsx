'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useQuickViewStore } from '@/lib/store/quickViewStore';
import { getImagePath } from '@/lib/products-constants';
import { formatCOP } from '@/lib/format';
import toast from 'react-hot-toast';

const PLACEHOLDER = '/img/placeholder.webp';
const TOAST = { style: { background: '#1A1A1D', color: '#F5F5F6', border: '1px solid rgba(255,46,126,.35)', fontFamily: 'var(--font-sans)' }, iconTheme: { primary: '#FF2E7E', secondary: '#0B0B0C' } };

export default function ProductCard({ product, priority = false }) {
  const { addItem } = useCartStore();
  const { items: rawWishlist, toggle: toggleWishlist } = useWishlistStore();
  const openQuickView = useQuickViewStore((s) => s.open);
  const wishlistItems = Array.isArray(rawWishlist) ? rawWishlist : [];
  const wishlisted = wishlistItems.some(i => i?.id === product.id);

  const imgs = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const img1 = (imgs[0] && !imgs[0].includes('placeholder')) ? imgs[0] : getImagePath(product);
  const img2 = imgs[1] && !imgs[1].includes('placeholder') ? imgs[1] : null;
  const [src1, setSrc1] = useState(img1);

  const hasPrice = product.price > 0;
  const discount = product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!hasPrice) { toast.error('Producto sin precio. Consúltanos por WhatsApp.', TOAST); return; }
    const size = product.sizes?.[1]?.ml || product.sizes?.[0]?.ml;
    addItem(product, size);
    toast.success(`${product.name} agregado`, TOAST);
  };

  const tilt = (e) => {
    const el = e.currentTarget; const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${-py * 5}deg`);
    el.style.setProperty('--ry', `${px * 5}deg`);
  };
  const reset = (e) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); };

  return (
    <Link href={`/producto/${product.slug}`} className="pc" data-cursor="hover">
      <article className="pc-card" onMouseMove={tilt} onMouseLeave={reset}>
        <div className="pc-media">
          <img
            className="pc-img pc-img1"
            src={src1}
            alt={`${product.name} — ${product.brand}`}
            loading={priority ? 'eager' : 'lazy'}
            onError={() => { if (src1 !== PLACEHOLDER) setSrc1(PLACEHOLDER); }}
          />
          {img2 && <img className="pc-img pc-img2" src={img2} alt="" loading="lazy" />}

          <div className="pc-badges">
            {product.badge && <span className="pc-badge" style={product.badgeColor ? { background: product.badgeColor } : undefined}>{product.badge}</span>}
            {discount && <span className="pc-badge pc-badge--off">−{discount}%</span>}
            {lowStock && <span className="pc-badge pc-badge--low">ÚLTIMAS {product.stock}</span>}
          </div>

          <button
            className={`pc-wish ${wishlisted ? 'on' : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
            aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'} aria-pressed={wishlisted}
          >
            <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          <div className="pc-actions">
            <button className="pc-add" onClick={handleAdd} disabled={!hasPrice}>
              <ShoppingBag size={14} /> {hasPrice ? 'Añadir' : 'Consultar'}
            </button>
            <button className="pc-eye" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }} aria-label="Vista rápida">
              <Eye size={16} />
            </button>
          </div>
        </div>

        <div className="pc-info">
          <div className="pc-top">
            <span className="pc-brand">{product.brand}</span>
            {product.rating > 0 && <span className="pc-rating"><Star size={11} fill="currentColor" /> {Number(product.rating).toFixed(1)}</span>}
          </div>
          <h3 className="pc-name">{product.name}</h3>
          <div className="pc-price">
            <span className={`pc-now ${hasPrice ? '' : 'pc-soon'}`}>{hasPrice ? formatCOP(product.price) : 'Consultar precio'}</span>
            {product.originalPrice > product.price && <s className="pc-was">{formatCOP(product.originalPrice)}</s>}
          </div>
        </div>
      </article>
    </Link>
  );
}
