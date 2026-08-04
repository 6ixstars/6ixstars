import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Package } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { formatCOP } from '@/lib/format';
import { SyncOrderButton } from '../SyncButtons';
import { OrderActions } from './OrderActions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = { robots: { index: false, follow: false } };

const STATUS_STYLES = {
  approved:  { bg: 'rgba(74, 222, 128, 0.15)', color: '#4ADE80', label: 'Aprobada' },
  pending:   { bg: 'rgba(245, 166, 35, 0.15)', color: '#F5A623', label: 'Pendiente' },
  declined:  { bg: 'rgba(255, 77, 106, 0.15)', color: '#FF4D6A', label: 'Rechazada' },
  voided:    { bg: 'rgba(140, 140, 147, 0.2)',  color: '#C7C7CD', label: 'Anulada' },
  error:     { bg: 'rgba(255, 77, 106, 0.15)', color: '#FF4D6A', label: 'Error' },
  shipped:   { bg: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA', label: 'Enviada' },
  delivered: { bg: 'rgba(74, 222, 128, 0.15)', color: '#4ADE80', label: 'Entregada' },
};

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  if (!supabaseAdmin) return <main style={{ padding: 40, background: 'var(--black)', color: 'var(--white)', minHeight: '100vh' }}>Supabase no configurado.</main>;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();

  if (error || !order) notFound();

  const status = STATUS_STYLES[order.status] || { bg: 'var(--dark-4)', color: 'var(--gray-light)', label: order.status };

  const Field = ({ label, value, mono }) => (
    <div>
      <p style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: '.92rem', fontWeight: 600, color: 'var(--white)', margin: 0, fontFamily: mono ? 'ui-monospace, monospace' : 'inherit', wordBreak: 'break-word' }}>
        {value || '—'}
      </p>
    </div>
  );

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto', fontFamily: 'var(--font-montserrat), ui-sans-serif, system-ui, sans-serif', color: 'var(--white)', background: 'var(--black)', minHeight: '100vh' }}>
      <Link href="/admin/orders" style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--gold)', textDecoration: 'none', display: 'inline-block', marginBottom: 14 }}>← Volver a órdenes</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, fontFamily: 'ui-monospace, monospace', color: 'var(--white)' }}>{order.reference}</h1>
          <p style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--gray-light)', marginTop: 4 }}>
            {new Date(order.created_at).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
        <span style={{
          background: status.bg, color: status.color,
          padding: '6px 14px', borderRadius: 99,
          fontSize: '.78rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '.06em',
        }}>{status.label}</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <SyncOrderButton orderId={order.id} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }} className="od-grid-2">
        <div style={{ background: 'var(--dark-2)', border: '1px solid var(--dark-4)', borderRadius: 8, padding: 18 }}>
          <h2 style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray)', letterSpacing: '.08em', marginBottom: 14, marginTop: 0 }}>Cliente</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <Field label="Nombre" value={order.customer_name} />
            <Field label="Email"  value={order.customer_email} />
            <Field label="Teléfono" value={order.customer_phone} />
          </div>
        </div>
        <div style={{ background: 'var(--dark-2)', border: '1px solid var(--dark-4)', borderRadius: 8, padding: 18 }}>
          <h2 style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray)', letterSpacing: '.08em', marginBottom: 14, marginTop: 0 }}>Envío</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <Field label="Dirección" value={order.shipping_address} />
            <Field label="Ciudad"    value={order.shipping_city} />
            <Field label="Departamento" value={order.shipping_department} />
          </div>
        </div>
      </div>

      {/* Tracking visible si existe */}
      {(order.tracking_carrier || order.tracking_number) && (
        <div style={{ background: 'rgba(96,165,250,.12)', border: '1px solid rgba(96,165,250,.3)', borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Package size={24} color="#60A5FA" />
          <div>
            <p style={{ margin: 0, fontSize: '.78rem', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700 }}>En tránsito</p>
            <p style={{ margin: '4px 0 0', fontSize: '.95rem', fontWeight: 500, color: 'var(--white)' }}>
              <strong>{order.tracking_carrier || 'Operador'}</strong>
              {order.tracking_number && <span style={{ marginLeft: 10, fontFamily: 'ui-monospace, monospace' }}>· {order.tracking_number}</span>}
            </p>
          </div>
        </div>
      )}

      {/* Items */}
      <div style={{ background: 'var(--dark-2)', border: '1px solid var(--dark-4)', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--dark-4)', background: 'var(--dark)' }}>
          <h2 style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray)', letterSpacing: '.08em', margin: 0 }}>Productos ({order.order_items?.length || 0})</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
            <tbody>
              {(order.order_items || []).map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--dark-4)' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--white)' }}>{item.product_name}</div>
                    {item.selected_size && <div style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--gray-light)' }}>{item.selected_size}</div>}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'center', color: 'var(--gray-light)', fontWeight: 500, fontSize: '.85rem', whiteSpace: 'nowrap' }}>×{item.quantity}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', color: 'var(--gray-light)', fontWeight: 500, whiteSpace: 'nowrap' }}>{formatCOP(Number(item.unit_price)) || '$0'}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: 'var(--white)', whiteSpace: 'nowrap' }}>{formatCOP(Number(item.total_price)) || '$0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totales */}
      <div style={{ background: 'var(--dark-2)', border: '1px solid var(--dark-4)', borderRadius: 8, padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'grid', gap: 8, maxWidth: 320, marginLeft: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', fontWeight: 500 }}>
            <span style={{ color: 'var(--gray-light)' }}>Subtotal</span>
            <span style={{ color: 'var(--white)' }}>{formatCOP(Number(order.subtotal)) || '$0'}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', fontWeight: 600, color: '#4ADE80' }}>
              <span>Descuento</span>
              <span>−{formatCOP(Number(order.discount))}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', fontWeight: 500 }}>
            <span style={{ color: 'var(--gray-light)' }}>Envío</span>
            <span style={{ color: 'var(--white)' }}>{Number(order.shipping_cost) > 0 ? formatCOP(Number(order.shipping_cost)) : 'Gratis'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, color: 'var(--white)', paddingTop: 8, borderTop: '1px solid var(--dark-4)' }}>
            <span>Total</span>
            <span>{formatCOP(Number(order.total)) || '$0'}</span>
          </div>
        </div>
      </div>

      {/* Acciones admin (cambiar estado, tracking, notas, eliminar) */}
      <h2 style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--white)', margin: '24px 0 12px' }}>Gestión de la orden</h2>
      <OrderActions order={order} />

      {/* Meta técnica */}
      <div style={{ marginTop: 24, padding: '16px 18px', background: 'var(--dark)', border: '1px solid var(--dark-4)', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, fontSize: '.78rem' }} className="od-meta">
        <Field label="Método de pago" value={order.payment_method} />
        <Field label="Bold TX ID" value={order.bold_tx_id} mono />
        <Field label="Última actualización" value={new Date(order.updated_at).toLocaleString('es-CO')} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .od-grid-2 { grid-template-columns: 1fr !important; }
          .od-meta { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
