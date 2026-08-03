'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, Eye, Star, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useQuickViewStore } from '@/lib/store/quickViewStore';
import { getImagePath } from '@/lib/products-constants';
import { formatCOP } from '@/lib/format';
import toast from 'react-hot-toast';

const PLACEHOLDER = '/img/placeholder.webp';
const TOAST = { style: { background: '#1A1A1D', color: '#F5F5F6', border: '1px solid rgba(255,46,126,.35)', fontFamily: 'var(--font-sans)' }, iconTheme: { primary: '#FF2E7E', secondary: '#0B0B0C' } };
const ADDED_FEEDBACK_MS = 1300;

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
  const [imgLoaded, setImgLoaded] = useState(false);
  // Si la imagen ya está en la caché del navegador, React puede attachear el
  // listener onLoad después de que el evento ya disparó — se quedaría en
  // opacity:0 para siempre. Este ref callback chequea `.complete` apenas se
  // monta el <img>, como red de seguridad.
  const checkAlreadyLoaded = (el) => {
    if (el?.complete && el.naturalWidth > 0) setImgLoaded(true);
  };

  const hasPrice = product.price > 0;
  const discount = product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
  const lowStock = product.stock > 0 && product.stock <= 5;

  // Tallas reales (no la talla "Única" genérica que se usa cuando el producto no tiene variantes)
  const realSizes = (product.sizes || []).filter(s => s.size && s.size !== 'Única');
  const [pickedSize, setPickedSize] = useState(null);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef(null);

  const flashAdded = () => {
    setJustAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), ADDED_FEEDBACK_MS);
  };

  const addWithSize = (sizeObj) => {
    if (sizeObj && sizeObj.stock === 0) return;
    addItem(product, sizeObj?.ml);
    toast.success(`${product.name}${sizeObj ? ` · ${sizeObj.size}` : ''} agregado`, TOAST);
    flashAdded();
  };

  // Solo se usa cuando el producto no tiene variantes de talla reales para elegir
  // (ver pc-sizes más abajo para el caso con tallas).
  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!hasPrice) { toast.error('Producto sin precio. Consúltanos por WhatsApp.', TOAST); return; }
    addWithSize(product.sizes?.[0]);
  };

  const handlePickSize = (e, sizeObj) => {
    e.preventDefault(); e.stopPropagation();
    if (sizeObj.stock === 0) return;
    setPickedSize(sizeObj);
    addWithSize(sizeObj);
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
          {!imgLoaded && <div className="pc-skeleton" aria-hidden="true" />}
          <img
            ref={checkAlreadyLoaded}
            className={`pc-img pc-img1 ${imgLoaded ? 'is-loaded' : ''}`}
            src={src1}
            alt={`${product.name} — ${product.brand}`}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setImgLoaded(true)}
            onError={() => { if (src1 !== PLACEHOLDER) setSrc1(PLACEHOLDER); setImgLoaded(true); }}
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
            {realSizes.length > 1 ? (
              <div className="pc-sizes" role="group" aria-label="Elegir talla">
                {realSizes.map(s => (
                  <button
                    key={s.size}
                    type="button"
                    className={`pc-size ${pickedSize?.size === s.size ? 'is-picked' : ''} ${s.stock === 0 ? 'is-out' : ''}`}
                    disabled={s.stock === 0}
                    onClick={(e) => handlePickSize(e, s)}
                    aria-label={s.stock === 0 ? `Talla ${s.size} agotada` : `Añadir talla ${s.size}`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            ) : (
              <button className={`pc-add ${justAdded ? 'is-added' : ''}`} onClick={handleAdd} disabled={!hasPrice}>
                {justAdded ? <><Check size={14} /> Agregado</> : <><ShoppingBag size={14} /> {hasPrice ? 'Añadir' : 'Consultar'}</>}
              </button>
            )}
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
