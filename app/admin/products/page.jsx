import Link from 'next/link';
import { Suspense } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { productTypeLabels, categoryLabels } from '@/lib/products-constants';
import ProductsSearchForm from './ProductsSearchForm';
import UpdatedToast from './UpdatedToast';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = {
  title: 'Productos',
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

async function fetchProducts({ page, q, type, brand }) {
  if (!supabaseAdmin) {
    return { rows: [], total: 0, error: 'Supabase no configurado' };
  }

  let query = supabaseAdmin
    .from('products')
    .select(`
      id, slug, name, brand, gender,
      featured, bestseller, stock, categories,
      product_sizes ( size, price, order_index ),
      product_images ( url, order_index )
    `, { count: 'exact' });

  if (q) {
    // ilike sobre name OR brand OR slug
    query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,slug.ilike.%${q}%`);
  }
  // El filtro "Tipo" del UI filtra por género (hombre/mujer/unisex) — no existe
  // una columna product_type separada, era de la era perfumes (nicho/diseñador/árabe).
  if (type) query = query.ilike('gender', type);
  if (brand) query = query.eq('brand', brand);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await query
    .order('name', { ascending: true })
    .range(from, to);

  if (error) return { rows: [], total: 0, error: error.message };

  // Reduce a una shape simple para la tabla
  const rows = (data || []).map((p) => {
    const sizes = (p.product_sizes || []).filter(s => s.price != null);
    sizes.sort((a, b) => Number(a.price) - Number(b.price));
    const lowest = sizes[0];
    const images = (p.product_images || []).slice().sort((a, b) => (a.order_index ?? 99) - (b.order_index ?? 99));
    const thumb = images[0]?.url || (p.slug ? `/img/${p.slug}.webp` : '/img/placeholder-perfume.webp');
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      gender: p.gender,
      featured: p.featured,
      bestseller: p.bestseller,
      stock: Number(p.stock) || 0,
      categories: Array.isArray(p.categories) ? p.categories : [],
      lowestPrice: lowest?.price,
      lowestSize: lowest?.size,
      thumb,
    };
  });

  return { rows, total: count ?? rows.length, error: null };
}

async function fetchAllBrandsList() {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin.from('products').select('brand').not('brand', 'is', null);
  const set = new Set((data || []).map(r => r.brand));
  return [...set].sort((a, b) => a.localeCompare(b));
}

export default async function AdminProductsPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp?.page || '1', 10) || 1);
  const q = (sp?.q || '').trim();
  const type = (sp?.type || '').trim();
  const brand = (sp?.brand || '').trim();

  const [{ rows, total, error }, brands] = await Promise.all([
    fetchProducts({ page, q, type, brand }),
    fetchAllBrandsList(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="prods">
      <header className="prods-head">
        <div>
          <p className="prods-eyebrow">Catálogo</p>
          <h1 className="prods-title">Productos</h1>
          <p className="prods-sub">
            {total === 0
              ? 'Sin resultados'
              : `Mostrando ${showingFrom}–${showingTo} de ${total}`}
          </p>
        </div>
        <div className="prods-head-actions">
          <Link href="/admin/products/import" className="btn btn--ghost">
            Importar CSV
          </Link>
          <Link href="/admin/products/new" className="btn btn--primary">
            + Nuevo producto
          </Link>
        </div>
      </header>

      <ProductsSearchForm
        defaultQ={q}
        defaultType={type}
        defaultBrand={brand}
        brands={brands}
      />

      {error && (
        <div className="prods-error">
          <strong>Error consultando Supabase:</strong> {error}
        </div>
      )}

      <div className="prods-tablewrap">
        <table className="prods-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}></th>
              <th>Producto</th>
              <th>Marca</th>
              <th>Tipo</th>
              <th style={{ textAlign: 'right' }}>Precio desde</th>
              <th>Estado</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="prods-empty">
                  {q || type || brand
                    ? 'No hay productos que coincidan con los filtros.'
                    : 'No hay productos en el catálogo todavía.'}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.thumb} alt="" className="prods-thumb" loading="lazy" />
                  </td>
                  <td>
                    <div className="prods-name">{r.name}</div>
                    <div className="prods-slug">/{r.slug}</div>
                  </td>
                  <td className="prods-brand">{r.brand || '—'}</td>
                  <td>
                    <span className="type-chip">
                      {productTypeLabels[(r.gender || '').toLowerCase()] || r.gender || '—'}
                    </span>
                    {r.categories?.length > 0 && (
                      <div className="cat-chips">
                        {r.categories.slice(0, 3).map((c) => (
                          <span key={c} className="cat-chip">{categoryLabels[c] || c}</span>
                        ))}
                        {r.categories.length > 3 && (
                          <span className="cat-chip cat-chip--more">+{r.categories.length - 3}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {r.lowestPrice != null
                      ? <>
                          <span className="prods-price">{cop.format(Number(r.lowestPrice))}</span>
                          {r.lowestSize && <span className="prods-ml"> · {r.lowestSize}</span>}
                        </>
                      : <span className="prods-muted">sin precio</span>}
                  </td>
                  <td>
                    <div className="prods-flags">
                      {r.bestseller && <span className="flag flag--gold">Bestseller</span>}
                      {r.featured && <span className="flag flag--ink">Destacado</span>}
                      {r.stock === 0 && <span className="flag flag--err">Agotado</span>}
                      {r.stock > 0 && r.stock < 5 && <span className="flag flag--warn">Bajo stock</span>}
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/products/${r.id}/edit`} className="row-edit">
                      Editar →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="pager" aria-label="Paginación">
          <PageLink
            page={page - 1}
            disabled={page === 1}
            q={q} type={type} brand={brand}
            label="← Anterior"
          />
          <span className="pager-info">
            Página {page} de {totalPages}
          </span>
          <PageLink
            page={page + 1}
            disabled={page >= totalPages}
            q={q} type={type} brand={brand}
            label="Siguiente →"
          />
        </nav>
      )}

      <Suspense fallback={null}>
        <UpdatedToast />
      </Suspense>

      <ProductsStyles />
    </div>
  );
}

function PageLink({ page, disabled, q, type, brand, label }) {
  if (disabled) return <span className="pager-link pager-link--off">{label}</span>;
  const sp = new URLSearchParams();
  if (page > 1) sp.set('page', String(page));
  if (q) sp.set('q', q);
  if (type) sp.set('type', type);
  if (brand) sp.set('brand', brand);
  const qs = sp.toString();
  return (
    <Link href={`/admin/products${qs ? '?' + qs : ''}`} className="pager-link">
      {label}
    </Link>
  );
}

function ProductsStyles() {
  return (
    <style>{`
      .prods {
        padding: 2.5rem 2.25rem 3rem;
        max-width: 1280px;
        margin: 0 auto;
        font-family: var(--font-montserrat), ui-sans-serif, system-ui, sans-serif;
        color: var(--white);
      }
      .prods-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 1.25rem;
        margin-bottom: 1.75rem;
      }
      .prods-eyebrow {
        margin: 0 0 0.3rem;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--gold);
      }
      .prods-title {
        margin: 0 0 0.35rem;
        font-size: 1.85rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: var(--white);
      }
      .prods-sub {
        margin: 0;
        font-size: 0.83rem;
        font-weight: 500;
        color: var(--gray-light);
      }

      .prods-head-actions {
        display: flex;
        gap: 0.6rem;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        padding: 0.62rem 1.1rem;
        border-radius: 9px;
        font-size: 0.82rem;
        letter-spacing: 0.03em;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        text-decoration: none;
        transition: background 0.18s, color 0.18s, border-color 0.18s;
        border: 1px solid transparent;
      }
      .btn--primary {
        background: var(--gold);
        color: #0B0B0C;
      }
      .btn--primary:hover {
        background: var(--gold-dark);
        color: #fff;
      }
      .btn--ghost {
        background: transparent;
        color: var(--gray-light);
        border-color: var(--dark-4);
      }
      .btn--ghost:hover:not(:disabled) {
        background: var(--dark-2);
        border-color: var(--gray);
        color: var(--white);
      }
      .btn:disabled,
      .btn[aria-disabled="true"] {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .prods-error {
        margin-bottom: 1rem;
        padding: 0.9rem 1rem;
        background: rgba(255, 77, 106, 0.1);
        border: 1px solid rgba(255, 77, 106, 0.3);
        border-radius: 10px;
        font-size: 0.85rem;
        font-weight: 500;
        color: #FF4D6A;
      }

      .prods-tablewrap {
        background: var(--dark-2);
        border: 1px solid var(--dark-4);
        border-radius: 14px;
        overflow: hidden;
        margin-bottom: 1.5rem;
      }
      .prods-table {
        width: 100%;
        border-collapse: collapse;
      }
      .prods-table thead th {
        text-align: left;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--gray);
        padding: 0.95rem 1rem;
        border-bottom: 1px solid var(--dark-4);
        background: var(--dark);
      }
      .prods-table tbody td {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid var(--dark-4);
        font-size: 0.86rem;
        vertical-align: middle;
      }
      .prods-table tbody tr:last-child td { border-bottom: none; }
      .prods-table tbody tr:hover { background: rgba(238, 177, 195, 0.045); }

      .prods-thumb {
        width: 44px;
        height: 44px;
        object-fit: cover;
        border-radius: 8px;
        background: var(--dark-4);
      }
      .prods-name {
        font-weight: 600;
        color: var(--white);
        line-height: 1.25;
      }
      .prods-slug {
        margin-top: 0.15rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.7rem;
        color: var(--gray);
      }
      .prods-brand {
        color: var(--gray-light);
        font-weight: 500;
        letter-spacing: 0.02em;
      }
      .type-chip {
        display: inline-flex;
        padding: 0.18rem 0.55rem;
        border-radius: 6px;
        font-size: 0.72rem;
        font-weight: 600;
        background: rgba(238, 177, 195, 0.14);
        color: var(--gold);
        letter-spacing: 0.04em;
      }
      .cat-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.22rem;
        margin-top: 0.35rem;
      }
      .cat-chip {
        display: inline-flex;
        padding: 0.1rem 0.42rem;
        border-radius: 5px;
        font-size: 0.66rem;
        font-weight: 500;
        background: var(--dark-4);
        color: var(--gray-light);
        letter-spacing: 0.02em;
      }
      .cat-chip--more {
        background: rgba(238, 177, 195, 0.16);
        color: var(--gold);
        font-weight: 600;
      }
      .prods-price {
        font-weight: 700;
        color: var(--white);
      }
      .prods-ml {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--gray);
      }
      .prods-muted {
        color: var(--gray);
        font-style: italic;
        font-size: 0.78rem;
      }
      .prods-flags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
      }
      .flag {
        display: inline-flex;
        padding: 0.15rem 0.5rem;
        border-radius: 5px;
        font-size: 0.65rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        font-weight: 700;
      }
      .flag--gold { background: rgba(238, 177, 195, 0.18); color: var(--gold); }
      .flag--ink  { background: var(--dark-4);  color: var(--gray-light); }
      .flag--err  { background: rgba(255, 77, 106, 0.15);  color: #FF4D6A; }
      .flag--warn { background: rgba(245, 166, 35, 0.15); color: #F5A623; }

      .row-edit {
        color: var(--gold);
        font-size: 0.82rem;
        font-weight: 600;
        text-decoration: none;
        letter-spacing: 0.02em;
        white-space: nowrap;
      }
      .row-edit:hover { color: var(--gold-dark); }

      .prods-empty {
        padding: 3rem 1rem !important;
        text-align: center;
        color: var(--gray);
        font-size: 0.9rem;
      }

      .pager {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1.5rem;
      }
      .pager-link {
        padding: 0.55rem 1rem;
        border-radius: 9px;
        background: var(--dark-2);
        color: var(--white);
        text-decoration: none;
        font-size: 0.83rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        border: 1px solid var(--dark-4);
        transition: background 0.15s, border-color 0.15s;
      }
      .pager-link:hover {
        background: rgba(238, 177, 195, 0.08);
        border-color: var(--gold);
      }
      .pager-link--off {
        opacity: 0.4;
        cursor: not-allowed;
        background: transparent;
      }
      .pager-info {
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--gray-light);
        letter-spacing: 0.04em;
      }
    `}</style>
  );
}
