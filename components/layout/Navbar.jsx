'use client';
import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, Heart, ArrowRight, ArrowUpRight, FileText, Truck, RotateCcw, HelpCircle, Mail } from 'lucide-react';
import { useCartStore, useCartCount } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { collections, getImagePath } from '@/lib/products-constants';
import TubelightNav from '@/components/layout/TubelightNav';

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const COP = (n) => 'COP $' + Number(n || 0).toLocaleString('es-CO');

const SEARCHABLE_PAGES = [
  { title: 'Contacto', desc: 'Habla con nosotros', url: '/contacto', Icon: Mail, keywords: ['contacto', 'whatsapp', 'email', 'ayuda', 'soporte', 'hablar'] },
  { title: 'Preguntas frecuentes', desc: 'FAQ — envíos, pagos, devoluciones', url: '/faq', Icon: HelpCircle, keywords: ['faq', 'preguntas', 'frecuentes', 'ayuda', 'envio', 'pago', 'devolucion'] },
  { title: 'Envíos', desc: 'Cobertura y tiempos', url: '/faq', Icon: Truck, keywords: ['envio', 'envios', 'shipping', 'entrega', 'express', 'colombia'] },
  { title: 'Devoluciones', desc: 'Cambios y devoluciones', url: '/devoluciones', Icon: RotateCcw, keywords: ['devolucion', 'devoluciones', 'cambio', 'reembolso', 'garantia'] },
  { title: 'Wishlist', desc: 'Tus favoritos guardados', url: '/wishlist', Icon: Heart, keywords: ['wishlist', 'favoritos', 'guardados', 'lista'] },
];

// Menú principal: Inicio + las 6 categorías directas.
const NAV_ITEMS = [
  { label: 'Inicio', to: '/' },
  ...collections.map(c => ({ label: c.name, to: `/tienda?cat=${c.id}`, cat: c.id })),
];

export default function Navbar({ products = [] }) {
  return (
    <Suspense fallback={<NavbarShell />}>
      <NavbarInner products={products} />
    </Suspense>
  );
}

function HouseLogo() {
  return (
    <Link href="/" className="sb-nav-logo" aria-label="6ixstars inicio">
      <img src="/img/logo.png" alt="6ixstars" className="sb-logo-img" width="220" height="56" />
    </Link>
  );
}

function NavbarShell() {
  return (
    <header className="sb-nav">
      <div className="container sb-nav-top"><div /><HouseLogo /><div /></div>
      <NavStyles />
    </header>
  );
}

function NavbarInner({ products = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { toggleCart } = useCartStore();
  const count = useCartCount();
  const { items: rawWishlist } = useWishlistStore();
  const wishlistItems = Array.isArray(rawWishlist) ? rawWishlist : [];
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false); setSearchOpen(false); setSearchQuery('');
  }, [pathname, searchParams]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [menuOpen]);

  const handleSearch = (e) => {
    if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/tienda?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false); setSearchQuery('');
    }
  };

  const searchResults = useMemo(() => {
    const q = norm(searchQuery.trim());
    if (q.length < 2) return null;

    const productMatches = products
      .map(p => {
        const haystack = norm([p.name, p.brand, p.description, ...(p.categories || [])].filter(Boolean).join(' '));
        if (!haystack.includes(q)) return null;
        let score = 0;
        if (norm(p.name).startsWith(q)) score += 10; else if (norm(p.name).includes(q)) score += 6;
        if (norm(p.brand).startsWith(q)) score += 8; else if (norm(p.brand).includes(q)) score += 4;
        score += (p.rating || 0) * 0.4;
        if (p.bestseller) score += 1;
        return { p, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    const brandSet = new Set();
    const brandMatches = [];
    for (const p of products) {
      if (!p.brand || brandSet.has(p.brand)) continue;
      if (norm(p.brand).includes(q)) { brandSet.add(p.brand); brandMatches.push(p.brand); }
      if (brandMatches.length >= 4) break;
    }

    const categoryMatches = collections.filter(c => norm(c.name).includes(q) || norm(c.description).includes(q));
    const pageMatches = SEARCHABLE_PAGES.filter(pg => norm(pg.title).includes(q) || norm(pg.desc).includes(q) || pg.keywords.some(k => norm(k).includes(q)));

    return {
      products: productMatches.slice(0, 5).map(x => x.p),
      productsTotal: productMatches.length,
      brands: brandMatches,
      categories: categoryMatches.slice(0, 4),
      pages: pageMatches.slice(0, 4),
      empty: productMatches.length === 0 && brandMatches.length === 0 && categoryMatches.length === 0 && pageMatches.length === 0,
    };
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeSearch = () => { setSearchOpen(false); setSearchQuery(''); };

  const isItemActive = (item) => {
    if (item.to === '/') return pathname === '/';
    if (item.cat) return pathname === '/tienda' && (searchParams?.get('cat') || '').split(',').includes(item.cat);
    return pathname === item.to.split('?')[0];
  };

  return (
    <>
      <header className={`sb-nav ${scrolled ? 'scrolled' : ''}`}>
        {/* Fila 1: toggle (mobile) · logo · acciones */}
        <div className="container sb-nav-bar">
          <button className="sb-mobile-toggle-left" onClick={() => setMenuOpen(m => !m)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <HouseLogo />

          {/* Categorías en la MISMA fila — 21st.dev Tubelight Navbar */}
          <div className="sb-nav-cats">
            <TubelightNav items={NAV_ITEMS.map(item => ({ ...item, active: isItemActive(item) }))} />
          </div>

          <div className="sb-nav-actions">
            <button onClick={() => setSearchOpen(s => !s)} className="sb-nav-icon-btn" aria-label="Buscar"><Search size={19} /></button>
            <Link href="/wishlist" className="sb-nav-icon-btn" aria-label="Favoritos">
              <Heart size={19} />
              {wishlistItems.length > 0 && <span className="sb-nav-badge">{wishlistItems.length}</span>}
            </Link>
            <button onClick={toggleCart} className="sb-nav-icon-btn" aria-label="Carrito">
              <ShoppingBag size={19} />
              {count > 0 && <span key={count} className="sb-nav-badge pop">{count}</span>}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="sb-search-bar">
            <div className="container">
              <div className="sb-search-inputwrap">
                <Search size={18} className="sb-search-icon" />
                <input className="sb-search-input" placeholder="Buscar prendas, categorías o páginas..." autoFocus
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
                {searchQuery && (
                  <button type="button" className="sb-search-clear" onClick={() => setSearchQuery('')} aria-label="Limpiar búsqueda"><X size={15} /></button>
                )}
              </div>

              {searchQuery.trim().length < 2 ? (
                <p className="sb-search-hint">Escribe al menos 2 letras · <kbd>Enter</kbd> para buscar · <kbd>Esc</kbd> para cerrar</p>
              ) : searchResults?.empty ? (
                <div className="sb-search-empty">
                  <p>No encontramos nada para <strong>&quot;{searchQuery}&quot;</strong>.</p>
                  <p className="sb-search-empty-hint">Probá con el nombre de la prenda, la categoría, o una palabra como &quot;envío&quot; o &quot;wishlist&quot;.</p>
                </div>
              ) : (
                <div className="sb-search-results">
                  {searchResults?.products?.length > 0 && (
                    <div className="sb-search-section">
                      <p className="sb-search-section-title">Productos <span>{searchResults.productsTotal}</span></p>
                      <div className="sb-search-product-list">
                        {searchResults.products.map(p => (
                          <Link key={p.id} href={`/producto/${p.slug}`} className="sb-search-product" onClick={closeSearch}>
                            <img src={getImagePath(p)} alt={p.name} loading="lazy" />
                            <div className="sb-search-product-info">
                              <span className="brand">{p.brand}</span>
                              <span className="name">{p.name}</span>
                              <span className="price">{Number.isFinite(p.price) && p.price > 0 ? COP(p.price) : 'Próximamente'}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {searchResults.productsTotal > searchResults.products.length && (
                        <Link href={`/tienda?q=${encodeURIComponent(searchQuery.trim())}`} className="sb-search-viewall" onClick={closeSearch}>
                          Ver los {searchResults.productsTotal} resultados <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  )}

                  {searchResults?.categories?.length > 0 && (
                    <div className="sb-search-section">
                      <p className="sb-search-section-title">Categorías</p>
                      <div className="sb-search-chips">
                        {searchResults.categories.map(f => (
                          <Link key={f.id} href={`/tienda?cat=${f.id}`} className="sb-search-chip" onClick={closeSearch}>
                            <span className="sb-search-chip-dot" style={{ background: f.color }} />{f.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults?.brands?.length > 0 && (
                    <div className="sb-search-section">
                      <p className="sb-search-section-title">Marcas</p>
                      <div className="sb-search-chips">
                        {searchResults.brands.map(b => (
                          <Link key={b} href={`/tienda?brand=${encodeURIComponent(b)}`} className="sb-search-chip" onClick={closeSearch}>{b}</Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults?.pages?.length > 0 && (
                    <div className="sb-search-section">
                      <p className="sb-search-section-title">Páginas</p>
                      <div className="sb-search-page-list">
                        {searchResults.pages.map(pg => (
                          <Link key={pg.url + pg.title} href={pg.url} className="sb-search-page" onClick={closeSearch}>
                            <span className="sb-search-page-icon"><pg.Icon size={16} /></span>
                            <div><span className="title">{pg.title}</span><span className="desc">{pg.desc}</span></div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <NavStyles />
      </header>

      {menuOpen && (
        <>
          <div className="sb-drawer-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="sb-drawer" role="dialog" aria-modal="true" aria-label="Menú de navegación">
            <div className="sb-drawer-header">
              <Link href="/" className="sb-drawer-logo" onClick={() => setMenuOpen(false)} aria-label="Inicio">
                <img src="/img/logo.png" alt="6ixstars" height="36" width="140" />
              </Link>
              <button type="button" className="sb-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><X size={20} /></button>
            </div>

            <div className="sb-drawer-body">
              <Link href="/tienda" className="sb-drawer-cta" onClick={() => setMenuOpen(false)}>
                <span>Ver toda la tienda</span><ArrowRight size={15} />
              </Link>
              <p className="sb-drawer-section-title">Categorías</p>
              <nav className="sb-drawer-main-nav">
                {NAV_ITEMS.map(item => (
                  <Link key={item.label} href={item.to} className="sb-drawer-main-link" onClick={() => setMenuOpen(false)}>
                    {item.label} <ArrowUpRight size={15} />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="sb-drawer-footer">
              <div className="sb-drawer-social">
                <a href="https://www.instagram.com/6ixstars/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="sb-drawer-social-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </a>
                <a href="https://www.tiktok.com/@6ixstars" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="sb-drawer-social-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.15a4.85 4.85 0 0 1-1-.46z" /></svg>
                </a>
              </div>
              <p className="sb-drawer-footer-copy">© 2026 6ixstars</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function NavStyles() {
  return (
    <style>{`
      .sb-nav { position: sticky; top: var(--announce-h); z-index: 50; background: #0B0B0C; border-bottom: 1px solid var(--dark-4); transition: background .35s, border-color .35s; }
      .sb-nav.scrolled { background: rgba(11,11,12,.92); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); box-shadow: 0 8px 24px rgba(0,0,0,.5); }

      /* Fila única: logo · categorías · acciones */
      .sb-nav-bar { display: flex; align-items: center; gap: 22px; padding: 12px 0; }
      .sb-nav-logo { display: inline-flex; align-items: center; flex-shrink: 0; transition: opacity .25s; }
      .sb-nav-logo:hover { opacity: .85; }
      .sb-logo-img { height: 46px; width: auto; display: block; filter: drop-shadow(0 2px 10px rgba(255,46,126,.25)); transition: transform .35s cubic-bezier(.16,1,.3,1); }
      .sb-nav-logo:hover .sb-logo-img { transform: scale(1.04); }
      @media (max-width: 768px) { .sb-logo-img { height: 40px; } }

      .sb-mobile-toggle-left { display: none; width: 44px; height: 44px; border-radius: 50%; align-items: center; justify-content: center; color: var(--white); background: transparent; border: 0; cursor: pointer; transition: background .25s, color .25s; margin-left: -10px; }
      .sb-mobile-toggle-left:hover { background: rgba(255,46,126,.12); color: var(--gold); }

      .sb-nav-actions { display: flex; gap: 4px; align-items: center; }
      .sb-nav-icon-btn { position: relative; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: var(--white); background: transparent; border: 0; cursor: pointer; transition: all .25s; }
      .sb-nav-icon-btn:hover { background: rgba(255,46,126,.14); color: var(--gold); }
      .sb-nav-icon-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
      .sb-nav-badge { position: absolute; top: 4px; right: 4px; background: var(--gold); color: #0B0B0C; font-size: .58rem; font-weight: 800; min-width: 17px; height: 17px; padding: 0 5px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; line-height: 1; border: 2px solid #0B0B0C; font-family: var(--font-sans); }
      .sb-nav-badge.pop { animation: sb-badge-pop .4s cubic-bezier(.16,1,.3,1); }
      @keyframes sb-badge-pop { 0% { transform: scale(.5); } 50% { transform: scale(1.25); } 100% { transform: scale(1); } }

      /* Categorías (en la misma fila, centradas, ocupan el espacio sobrante) */
      .sb-nav-cats { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 22px; }
      .sb-nav-link { position: relative; font-family: var(--font-sans); font-size: .76rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--gray-light); padding: 4px 0; transition: color .25s; }
      .sb-nav-link::after { content: ''; position: absolute; left: 0; right: 0; bottom: -2px; height: 2px; background: var(--gold); transform: scaleX(0); transform-origin: right; transition: transform .4s cubic-bezier(.16,1,.3,1); }
      .sb-nav-link:hover, .sb-nav-link.active { color: var(--white); }
      .sb-nav-link:hover::after, .sb-nav-link.active::after { transform: scaleX(1); transform-origin: left; }
      .sb-nav-link:focus-visible { outline: 2px solid var(--gold); outline-offset: 4px; border-radius: 2px; }

      /* Búsqueda */
      .sb-search-bar { position: absolute; top: 100%; left: 0; right: 0; background: rgba(11,11,12,.98); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--gold); padding: 18px 24px 22px; animation: sb-slide-down .25s cubic-bezier(.22,.61,.36,1); max-height: calc(100vh - 80px); overflow-y: auto; }
      @keyframes sb-slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
      .sb-search-inputwrap { position: relative; max-width: 720px; display: flex; align-items: center; }
      .sb-search-icon { position: absolute; left: 14px; color: var(--gray); pointer-events: none; }
      .sb-search-input { width: 100%; padding: 13px 44px 13px 42px; background: rgba(255,255,255,.06); border: 1.5px solid var(--dark-4); border-radius: 8px; color: var(--white); font-family: var(--font-sans); font-size: .95rem; outline: none; transition: border-color .2s, background .2s; }
      .sb-search-input::placeholder { color: var(--gray); }
      .sb-search-input:focus { border-color: var(--gold); background: rgba(255,255,255,.09); box-shadow: 0 0 0 4px rgba(255,46,126,.18); }
      .sb-search-clear { position: absolute; right: 10px; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.08); color: var(--white); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: 0; }
      .sb-search-clear:hover { background: rgba(255,46,126,.2); color: var(--gold); }
      .sb-search-hint { font-size: .72rem; color: var(--gray); margin-top: 10px; max-width: 720px; font-family: var(--font-sans); }
      .sb-search-hint kbd { background: rgba(255,255,255,.08); border: 1px solid var(--dark-4); border-radius: 4px; padding: 1px 6px; font-family: ui-monospace, monospace; font-size: .85em; color: var(--white); }
      .sb-search-empty { max-width: 720px; padding: 22px 0; color: var(--gray-light); font-family: var(--font-sans); }
      .sb-search-empty strong { color: var(--gold); }
      .sb-search-empty-hint { margin-top: 6px; font-size: .82rem; color: var(--gray); }
      .sb-search-results { max-width: 720px; margin-top: 16px; display: flex; flex-direction: column; gap: 18px; }
      .sb-search-section-title { font-family: ui-monospace, monospace; font-size: .62rem; letter-spacing: .25em; text-transform: uppercase; color: var(--gold); margin: 0 0 10px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; }
      .sb-search-section-title span { padding: 1px 8px; background: rgba(255,46,126,.14); border-radius: 100px; font-size: .9em; color: var(--white); }
      .sb-search-product-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
      .sb-search-product { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: rgba(255,255,255,.03); border: 1px solid var(--dark-4); border-radius: 8px; transition: background .2s, border-color .2s, transform .2s; }
      .sb-search-product:hover { background: rgba(255,46,126,.1); border-color: var(--gold); transform: translateX(2px); }
      .sb-search-product img { width: 48px; height: 48px; object-fit: cover; background: #141416; border-radius: 6px; flex-shrink: 0; }
      .sb-search-product-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
      .sb-search-product-info .brand { font-family: ui-monospace, monospace; font-size: .56rem; letter-spacing: .2em; text-transform: uppercase; color: var(--gray); font-weight: 700; }
      .sb-search-product-info .name { font-family: var(--font-sans); font-weight: 700; font-size: .92rem; color: var(--white); line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sb-search-product-info .price { font-size: .76rem; color: var(--gold); font-weight: 700; }
      .sb-search-viewall { display: inline-flex; align-items: center; gap: 8px; margin-top: 10px; padding: 6px 12px; font-family: ui-monospace, monospace; font-size: .68rem; letter-spacing: .18em; text-transform: uppercase; color: var(--gold); background: rgba(255,46,126,.12); border: 1px solid var(--gold); border-radius: 100px; font-weight: 700; transition: all .2s; }
      .sb-search-viewall:hover { background: var(--gold); color: #0B0B0C; gap: 12px; }
      .sb-search-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .sb-search-chip { display: inline-flex; align-items: center; gap: 7px; padding: 7px 13px; background: rgba(255,255,255,.04); border: 1px solid var(--dark-4); border-radius: 100px; font-family: var(--font-sans); font-size: .78rem; font-weight: 600; color: var(--gray-light); transition: all .2s; }
      .sb-search-chip:hover { background: rgba(255,46,126,.16); border-color: var(--gold); color: var(--white); transform: translateY(-1px); }
      .sb-search-chip-dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 0 1.5px rgba(255,255,255,.2); }
      .sb-search-page-list { display: flex; flex-direction: column; gap: 4px; }
      .sb-search-page { display: flex; align-items: center; gap: 13px; padding: 10px 12px; background: rgba(255,255,255,.03); border: 1px solid var(--dark-4); border-radius: 8px; transition: background .2s, border-color .2s, transform .2s; }
      .sb-search-page:hover { background: rgba(255,46,126,.1); border-color: var(--gold); transform: translateX(2px); }
      .sb-search-page-icon { width: 34px; height: 34px; border-radius: 50%; background: rgba(255,46,126,.14); border: 1px solid var(--gold); display: inline-flex; align-items: center; justify-content: center; color: var(--gold); flex-shrink: 0; }
      .sb-search-page .title { display: block; font-family: var(--font-sans); font-size: .9rem; color: var(--white); font-weight: 700; }
      .sb-search-page .desc { display: block; font-size: .72rem; color: var(--gray); }
      @media (max-width: 768px) { .sb-search-product-list { grid-template-columns: 1fr; } .sb-search-bar { padding: 14px 20px 18px; } }

      /* Drawer móvil */
      .sb-drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 98; backdrop-filter: blur(3px); animation: sb-fade-in .25s ease; }
      @keyframes sb-fade-in { from { opacity: 0; } to { opacity: 1; } }
      .sb-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: min(340px, 90vw); background: #0D0D0F; border-right: 1px solid var(--dark-4); z-index: 99; display: flex; flex-direction: column; animation: sb-drawer-in .3s cubic-bezier(.22,.61,.36,1); box-shadow: 8px 0 40px rgba(0,0,0,.6); }
      @keyframes sb-drawer-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      .sb-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 16px; border-bottom: 1px solid var(--dark-4); flex-shrink: 0; }
      .sb-drawer-logo img { display: block; }
      .sb-drawer-close { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--dark-4); background: none; color: var(--gray-light); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s, color .2s; flex-shrink: 0; }
      .sb-drawer-close:hover { background: rgba(255,46,126,.12); color: var(--gold); }
      .sb-drawer-body { flex: 1; overflow-y: auto; padding: 16px 0 24px; scrollbar-width: none; }
      .sb-drawer-body::-webkit-scrollbar { display: none; }
      .sb-drawer-cta { display: flex; align-items: center; justify-content: space-between; margin: 0 16px 16px; padding: 14px 18px; background: var(--gold); border-radius: 10px; font-family: var(--font-sans); font-size: .85rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: #0B0B0C; transition: background .2s; }
      .sb-drawer-cta:hover { background: var(--gold-light); }
      .sb-drawer-section-title { font-size: .6rem; letter-spacing: .3em; text-transform: uppercase; color: var(--gray); font-weight: 800; padding: 4px 20px 8px; }
      .sb-drawer-main-nav { padding: 0 8px; }
      .sb-drawer-main-link { display: flex; align-items: center; justify-content: space-between; padding: 0 12px; height: 52px; font-family: var(--font-sans); font-weight: 700; text-transform: uppercase; letter-spacing: .04em; font-size: .95rem; color: var(--gray-light); border-radius: 8px; transition: background .18s, color .18s; }
      .sb-drawer-main-link svg { color: var(--gray); }
      .sb-drawer-main-link:hover, .sb-drawer-main-link:active { background: rgba(255,46,126,.1); color: var(--gold); }
      .sb-drawer-main-link:hover svg { color: var(--gold); }
      .sb-drawer-footer { padding: 16px 20px; border-top: 1px solid var(--dark-4); flex-shrink: 0; }
      .sb-drawer-social { display: flex; gap: 10px; margin-bottom: 12px; }
      .sb-drawer-social-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--dark-4); display: flex; align-items: center; justify-content: center; color: var(--gray-light); transition: background .2s, color .2s; }
      .sb-drawer-social-btn:hover { background: rgba(255,46,126,.15); color: var(--gold); }
      .sb-drawer-footer-copy { font-size: .68rem; color: var(--gray); letter-spacing: .08em; }

      /* Responsive */
      @media (max-width: 980px) {
        .sb-nav-cats { display: none; }
        .sb-mobile-toggle-left { display: inline-flex; }
        .sb-nav-bar { padding: 10px 0; justify-content: space-between; }
      }
      @media (max-width: 1200px) { .sb-nav-cats { gap: 16px; } .sb-nav-link { font-size: .7rem; letter-spacing: .06em; } }
    `}</style>
  );
}
