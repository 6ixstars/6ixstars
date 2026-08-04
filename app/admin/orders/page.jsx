import { supabaseAdmin } from '@/lib/supabase';
import { AdminHeader, AdminOrdersTable } from './AdminClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminOrdersPage() {
  try {
    return await renderOrders();
  } catch (err) {
    console.error('[AdminOrders SSR ERROR]', err);
    return (
      <main style={{ padding: 40, fontFamily: 'monospace', color: '#1f2937', background: '#fff' }}>
        <h1 style={{ color: '#dc2626', fontSize: '1.4rem', marginBottom: 16 }}>Error al cargar órdenes</h1>
        <pre style={{ background: '#1F1A14', color: '#FAF6EE', padding: 20, borderRadius: 8, overflow: 'auto', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
{`MESSAGE: ${err?.message || 'unknown'}
NAME: ${err?.name || 'unknown'}
DIGEST: ${err?.digest || 'none'}
CODE: ${err?.code || 'none'}
STACK:
${(err?.stack || '').split('\n').slice(0, 15).join('\n')}`}
        </pre>
        <p style={{ marginTop: 20, color: '#6b7280', fontFamily: 'system-ui', fontSize: '.9rem' }}>
          Por favor mándale este mensaje al desarrollador.
        </p>
      </main>
    );
  }
}

async function renderOrders() {
  if (!supabaseAdmin) {
    return (
      <main style={{ padding: 40, fontFamily: 'system-ui', color: '#1f2937', background: '#fff' }}>
        <h1>Supabase no configurado</h1>
        <p>Falta NEXT_PUBLIC_SUPABASE_URL o claves en las env vars de Vercel.</p>
      </main>
    );
  }

  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(id)')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return (
      <main style={{ padding: 40, fontFamily: 'monospace', color: '#1f2937', background: '#fff' }}>
        <h1 style={{ color: '#dc2626' }}>Error consultando órdenes</h1>
        <pre style={{ background: '#1F1A14', color: '#FAF6EE', padding: 16, borderRadius: 8, overflow: 'auto' }}>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1400, margin: '0 auto', fontFamily: 'var(--font-montserrat), ui-sans-serif, system-ui, sans-serif', color: '#1f2937', background: '#fff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ margin: '0 0 0.25rem', fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase', color: '#8a6936' }}>Ventas</p>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 500, letterSpacing: '-.01em', margin: 0, color: '#1c1611' }}>Órdenes</h1>
          <p style={{ fontSize: '.82rem', color: 'rgba(28,22,17,.55)', margin: '.3rem 0 0' }}>
            Últimas {orders?.length || 0} órdenes
          </p>
        </div>
        <AdminHeader />
      </div>

      <AdminOrdersTable orders={orders || []} />
    </main>
  );
}
