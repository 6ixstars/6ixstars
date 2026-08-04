import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import EditProductForm from '../[id]/edit/EditProductForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = {
  title: 'Nuevo producto',
  robots: { index: false, follow: false },
};

async function fetchAllBrands() {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from('products')
    .select('brand')
    .not('brand', 'is', null);
  return [...new Set((data || []).map((r) => r.brand))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export default async function NewProductPage() {
  const brands = await fetchAllBrands();

  return (
    <div className="newp">
      <header className="newp-head">
        <div className="newp-crumbs">
          <Link href="/admin/products">Productos</Link>
          <span aria-hidden> / </span>
          <span className="crumb-current">Nuevo</span>
        </div>
        <div className="newp-headline">
          <p className="newp-eyebrow">Crear producto</p>
          <h1 className="newp-title">Nuevo perfume en el catálogo</h1>
          <p className="newp-sub">
            Empieza por el nombre — el slug se genera automáticamente. Puedes ajustar todo después.
          </p>
        </div>
      </header>

      <EditProductForm mode="create" product={{}} brands={brands} />

      <style>{`
        .newp {
          padding: 2.25rem 2.25rem 4rem;
          max-width: 1100px;
          margin: 0 auto;
          font-family: var(--font-montserrat), ui-sans-serif, system-ui, sans-serif;
          color: var(--white);
        }
        .newp-head { margin-bottom: 2rem; }
        .newp-crumbs {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--gray-light);
          letter-spacing: 0.04em;
          margin-bottom: 1rem;
        }
        .newp-crumbs a { color: var(--gold); text-decoration: none; }
        .newp-crumbs a:hover { text-decoration: underline; }
        .crumb-current { color: var(--gray); }
        .newp-eyebrow {
          margin: 0 0 0.3rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .newp-title {
          margin: 0 0 0.35rem;
          font-size: 1.85rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--white);
        }
        .newp-sub {
          margin: 0;
          font-size: 0.86rem;
          font-weight: 500;
          color: var(--gray-light);
        }
      `}</style>
    </div>
  );
}
