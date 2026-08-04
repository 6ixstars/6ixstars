import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { getAllProducts } from '@/lib/products';
import { collections } from '@/lib/products-constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

// COP formatter — sin decimales, separadores de miles con punto.
const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

async function fetchStats() {
  // Productos: leemos del cache de products-db, no de Supabase directo,
  // así nos beneficiamos del unstable_cache cuando el admin no edita.
  const products = await getAllProducts();
  const totalProducts = products.length;
  // Cuenta por categoría de prenda (un producto puede tener varias categorías).
  const byCategory = products.reduce((acc, p) => {
    const cats = p.categories?.length ? p.categories : (p.category ? [p.category] : []);
    for (const c of cats) acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const brands = new Set(products.map(p => p.brand).filter(Boolean));

  // Órdenes: query directa para tener stats frescas.
  let totalOrders = 0;
  let approvedOrders = 0;
  let pendingOrders = 0;
  let totalRevenue = 0;
  let recentOrders = [];

  if (supabaseAdmin) {
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('reference, customer_name, customer_email, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (Array.isArray(orders)) {
      totalOrders = orders.length;
      for (const o of orders) {
        const status = (o.status || '').toLowerCase();
        if (status === 'approved' || status === 'aprobada') {
          approvedOrders++;
          totalRevenue += Number(o.total) || 0;
        } else if (status === 'pending' || status === 'pendiente') {
          pendingOrders++;
        }
      }
      recentOrders = orders.slice(0, 5);
    }
  }

  return {
    totalProducts,
    byCategory,
    totalBrands: brands.size,
    totalOrders,
    approvedOrders,
    pendingOrders,
    totalRevenue,
    recentOrders,
  };
}

export default async function AdminDashboardPage() {
  const stats = await fetchStats();

  return (
    <div className="dash">
      <header className="dash-head">
        <div>
          <p className="dash-eyebrow">Panel admin</p>
          <h1 className="dash-title">Dashboard</h1>
        </div>
        <p className="dash-date">
          {new Date().toLocaleDateString('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </header>

      <section className="dash-grid">
        <StatCard
          eyebrow="Catálogo"
          label="Productos"
          value={stats.totalProducts}
          sub={`${stats.totalBrands} marcas`}
          accent="ink"
          href="/admin/products"
        />
        <StatCard
          eyebrow="Ventas"
          label="Órdenes totales"
          value={stats.totalOrders}
          sub={`${stats.approvedOrders} aprobadas · ${stats.pendingOrders} pendientes`}
          accent="ink"
          href="/admin/orders"
        />
        <StatCard
          eyebrow="Ingresos"
          label="Aprobadas"
          value={cop.format(stats.totalRevenue)}
          sub="acumulado histórico"
          accent="gold"
        />
        <StatCard
          eyebrow="Pendiente"
          label="Por revisar"
          value={stats.pendingOrders}
          sub={stats.pendingOrders > 0 ? 'Requieren confirmación de pago' : 'Todo al día'}
          accent={stats.pendingOrders > 0 ? 'warn' : 'ink'}
          href={stats.pendingOrders > 0 ? '/admin/orders' : undefined}
        />
      </section>

      <section className="dash-row">
        <article className="dash-card">
          <header className="dash-card-head">
            <h2 className="dash-card-title">Catálogo por categoría</h2>
          </header>
          {stats.totalProducts === 0 ? (
            <p className="dash-empty">Todavía no hay productos cargados.</p>
          ) : (
            <ul className="type-list">
              {collections.map(c => (
                <TypeRow
                  key={c.id}
                  label={c.name}
                  value={stats.byCategory[c.id] || 0}
                  total={stats.totalProducts}
                  color={c.color}
                />
              ))}
            </ul>
          )}
        </article>

        <article className="dash-card">
          <header className="dash-card-head">
            <h2 className="dash-card-title">Últimas órdenes</h2>
            <Link href="/admin/orders" className="dash-card-link">Ver todas →</Link>
          </header>
          {stats.recentOrders.length === 0 ? (
            <p className="dash-empty">Sin órdenes todavía.</p>
          ) : (
            <ul className="orders-list">
              {stats.recentOrders.map((o) => (
                <li key={o.reference} className="order-row">
                  <div className="order-ref">
                    <code>{o.reference}</code>
                    <span className="order-customer">{o.customer_name || o.customer_email || '—'}</span>
                  </div>
                  <div className="order-meta">
                    <span className="order-total">{cop.format(Number(o.total) || 0)}</span>
                    <StatusPill status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <DashboardStyles />
    </div>
  );
}

function StatCard({ eyebrow, label, value, sub, accent = 'ink', href }) {
  const inner = (
    <article className={`stat stat--${accent}`}>
      <p className="stat-eyebrow">{eyebrow}</p>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </article>
  );
  return href ? <Link href={href} className="stat-link">{inner}</Link> : inner;
}

function TypeRow({ label, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <li className="type-row">
      <div className="type-row-head">
        <span className="type-row-label">{label}</span>
        <span className="type-row-value">{value}<span className="type-row-pct"> · {pct}%</span></span>
      </div>
      <div className="type-bar" aria-hidden>
        <div className="type-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </li>
  );
}

function StatusPill({ status }) {
  const s = (status || '').toLowerCase();
  let tone = 'neutral', label = status || '—';
  if (s === 'approved' || s === 'aprobada') { tone = 'ok'; label = 'Aprobada'; }
  else if (s === 'pending' || s === 'pendiente') { tone = 'warn'; label = 'Pendiente'; }
  else if (s === 'declined' || s === 'rechazada' || s === 'error') { tone = 'err'; label = 'Rechazada'; }
  return <span className={`pill pill--${tone}`}>{label}</span>;
}

function DashboardStyles() {
  return (
    <style>{`
      .dash {
        padding: 2.5rem 2.25rem 3rem;
        max-width: 1280px;
        margin: 0 auto;
        font-family: var(--font-montserrat), ui-sans-serif, system-ui, sans-serif;
        color: var(--white);
      }
      .dash-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .dash-eyebrow {
        margin: 0 0 0.25rem;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--gold);
      }
      .dash-title {
        margin: 0;
        font-size: 1.85rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: var(--white);
      }
      .dash-date {
        margin: 0;
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--gray-light);
        letter-spacing: 0.03em;
        font-variant: small-caps;
      }

      .dash-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
      @media (max-width: 1024px) {
        .dash-grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 560px) {
        .dash-grid { grid-template-columns: 1fr; }
      }

      .stat-link {
        text-decoration: none;
        color: inherit;
      }
      .stat {
        position: relative;
        padding: 1.25rem 1.25rem 1.1rem;
        background: var(--dark-2);
        border: 1px solid var(--dark-4);
        border-radius: 14px;
        transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
      }
      .stat-link:hover .stat {
        transform: translateY(-2px);
        border-color: var(--gold);
        box-shadow: 0 12px 28px -16px rgba(0, 0, 0, 0.5);
      }
      .stat-eyebrow {
        margin: 0 0 0.5rem;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--gray);
      }
      .stat-label {
        margin: 0 0 0.4rem;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--gray-light);
      }
      .stat-value {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        line-height: 1;
        color: var(--white);
      }
      .stat-sub {
        margin: 0.6rem 0 0;
        font-size: 0.72rem;
        font-weight: 500;
        color: var(--gray);
        letter-spacing: 0.02em;
      }
      .stat--gold .stat-value {
        color: var(--gold);
      }
      .stat--warn .stat-value {
        color: #F5A623;
      }

      .dash-row {
        display: grid;
        grid-template-columns: 1fr 1.4fr;
        gap: 1rem;
      }
      @media (max-width: 900px) {
        .dash-row { grid-template-columns: 1fr; }
      }

      .dash-card {
        background: var(--dark-2);
        border: 1px solid var(--dark-4);
        border-radius: 14px;
        padding: 1.4rem 1.4rem 1.5rem;
      }
      .dash-card-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 1.1rem;
      }
      .dash-card-title {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: var(--white);
      }
      .dash-card-link {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--gold);
        text-decoration: none;
        letter-spacing: 0.04em;
      }
      .dash-card-link:hover { color: var(--gold-dark); }

      .dash-empty {
        margin: 0;
        font-size: 0.85rem;
        color: var(--gray);
      }

      .type-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }
      .type-row-head {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 0.35rem;
      }
      .type-row-label { color: var(--white); letter-spacing: 0.02em; }
      .type-row-value { color: var(--gray-light); }
      .type-row-pct { color: var(--gray); }
      .type-bar {
        height: 5px;
        background: var(--dark-4);
        border-radius: 3px;
        overflow: hidden;
      }
      .type-bar-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.4s ease;
      }

      .orders-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
      }
      .order-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 0.65rem 0.75rem;
        background: var(--dark);
        border: 1px solid transparent;
        border-radius: 9px;
        transition: background 0.15s, border-color 0.15s;
      }
      .order-row:hover {
        background: rgba(238, 177, 195, 0.08);
        border-color: rgba(238, 177, 195, 0.25);
      }
      .order-ref {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        min-width: 0;
      }
      .order-ref code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.74rem;
        font-weight: 600;
        color: var(--white);
      }
      .order-customer {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--gray-light);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .order-meta {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-shrink: 0;
      }
      .order-total {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--white);
      }

      .pill {
        display: inline-flex;
        align-items: center;
        padding: 0.18rem 0.6rem;
        border-radius: 99px;
        font-size: 0.68rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        font-weight: 700;
      }
      .pill--ok   { background: rgba(74, 222, 128, 0.15);  color: var(--success); }
      .pill--warn { background: rgba(245, 166, 35, 0.15);  color: #F5A623; }
      .pill--err  { background: rgba(255, 77, 106, 0.15);  color: var(--error); }
      .pill--neutral { background: var(--dark-4); color: var(--gray-light); }
    `}</style>
  );
}
