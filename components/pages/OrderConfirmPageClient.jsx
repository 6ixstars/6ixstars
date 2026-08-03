'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Mail, ArrowRight, AlertCircle, Loader2, MessageCircle } from 'lucide-react';
import { PageTransition } from '@/components/ui/ScrollAnimations';
import { useCartStore } from '@/lib/store/cartStore';
import { formatCOP } from '@/lib/format';

const PHONE_WHATSAPP = '573143776839';

// payment_status real de Bold: APPROVED, PROCESSING, PENDING (solo PSE), REJECTED, FAILED,
// VOIDED, NO_TRANSACTION_FOUND (Bold puede tardar hasta ~10min en indexar la transacción).
const STATUS_CONFIG = {
  APPROVED:            { color: 'var(--success)', bg: 'rgba(124,158,135,.15)', label: 'Aprobado',  icon: CheckCircle, title: '¡Pago Aprobado!',     msg: 'Hemos recibido tu pago y estamos preparando tu pedido.' },
  PENDING:             { color: '#F5A623',        bg: 'rgba(245,166,35,.15)',  label: 'Pendiente', icon: Loader2,     title: 'Pago en Verificación', msg: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.' },
  PROCESSING:          { color: '#F5A623',        bg: 'rgba(245,166,35,.15)',  label: 'Pendiente', icon: Loader2,     title: 'Pago en Verificación', msg: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.' },
  NO_TRANSACTION_FOUND:{ color: 'var(--gold)',    bg: 'rgba(175,31,58,.10)',   label: 'Verificando', icon: Loader2,   title: 'Verificando Pago...', msg: 'Bold puede tardar unos minutos en confirmar tu transacción. Te avisaremos por email en cuanto se apruebe.' },
  REJECTED:            { color: 'var(--error)',   bg: 'rgba(192,74,92,.15)',   label: 'Rechazado', icon: AlertCircle, title: 'Pago Rechazado',       msg: 'Tu banco rechazó la transacción. Intenta con otro método de pago.' },
  FAILED:              { color: 'var(--error)',   bg: 'rgba(192,74,92,.15)',   label: 'Rechazado', icon: AlertCircle, title: 'Pago Rechazado',       msg: 'Ocurrió un error procesando tu pago. Intenta de nuevo.' },
  VOIDED:              { color: 'var(--error)',   bg: 'rgba(192,74,92,.15)',   label: 'Anulado',   icon: AlertCircle, title: 'Pago Anulado',         msg: 'La transacción fue anulada. No se realizó ningún cargo.' },
  ERROR:               { color: 'var(--error)',   bg: 'rgba(192,74,92,.15)',   label: 'Error',     icon: AlertCircle, title: 'Error en el Pago',     msg: 'Ocurrió un error consultando tu pago. Contáctanos si el cobro sí se realizó.' },
  DEMO:                { color: 'var(--success)', bg: 'rgba(124,158,135,.15)', label: 'Confirmado', icon: CheckCircle, title: '¡Pedido Confirmado!', msg: 'Hemos recibido tu pedido y lo estamos preparando con cuidado.' },
  COD:                 { color: '#F5A623',        bg: 'rgba(245,166,35,.15)',  label: 'Por Pagar',  icon: Package,    title: '¡Pedido Recibido!',    msg: 'Pagas al recibir el producto. Te contactaremos para confirmar la entrega.' },
  LOADING:             { color: 'var(--gold)',    bg: 'rgba(175,31,58,.10)', label: 'Verificando', icon: Loader2,   title: 'Verificando Pago...', msg: 'Estamos confirmando el estado de tu transacción con Bold.' },
};

// Reintentos mientras el estado siga "en proceso" (Bold puede tardar en indexar la transacción)
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 4000;
const PENDING_STATUSES = new Set(['LOADING', 'PENDING', 'PROCESSING', 'NO_TRANSACTION_FOUND']);

export default function OrderConfirmPageClient() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();

  // Nosotros generamos `redirectUrl` al crear el link de pago (ver app/api/bold/checkout),
  // así que la referencia siempre viaja de vuelta en la URL — no dependemos de qué
  // parámetros exactos agregue Bold.
  const boldReference = searchParams.get('reference');

  // Path simulado / COD
  const orderId = searchParams.get('orderId');
  const totalParam = parseFloat(searchParams.get('total') || '0');
  const method = searchParams.get('method'); // cod, simulated, etc.
  const isSimulated = searchParams.get('simulated') === '1';

  const [tx, setTx] = useState(null);
  const [statusKey, setStatusKey] = useState(boldReference ? 'LOADING' : (method === 'cod' ? 'COD' : 'DEMO'));
  const [error, setError] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Si viene de Bold, consultar el estado del pago por referencia
  useEffect(() => {
    if (!boldReference) {
      if (method === 'cod' || isSimulated) clearCart();
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/bold/transaction?reference=${encodeURIComponent(boldReference)}`, { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || 'Error consultando el pago');
        setTx(data);
        setStatusKey(data.payment_status || 'NO_TRANSACTION_FOUND');
        if (data.payment_status === 'APPROVED') clearCart();
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
        setStatusKey('ERROR');
      }
    };
    fetchStatus();
    const interval = setInterval(() => {
      if (cancelled || attempts++ >= MAX_POLL_ATTEMPTS) { clearInterval(interval); return; }
      setStatusKey(current => {
        if (PENDING_STATUSES.has(current)) fetchStatus();
        return current;
      });
    }, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [boldReference, method, isSimulated, clearCart]);

  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.LOADING;
  const Icon = status.icon;
  const finalOrderId = tx?.reference_id || boldReference || orderId || 'SB-DEMO';
  const finalTotal = tx?.total != null ? tx.total : totalParam;
  const isLoading = PENDING_STATUSES.has(statusKey);
  const isSuccess = statusKey === 'APPROVED' || statusKey === 'DEMO' || statusKey === 'COD';
  const isFailed = statusKey === 'REJECTED' || statusKey === 'FAILED' || statusKey === 'VOIDED' || statusKey === 'ERROR';

  return (
    <PageTransition>
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 32px' }}>
          <div style={{ position: 'absolute', inset: 0, background: status.bg, borderRadius: '50%', animation: isLoading ? 'pulse 2s infinite' : 'pulse 2s 1' }} />
          <div style={{ position: 'absolute', inset: 8, background: status.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={48} style={{ color: status.color, animation: isLoading ? 'spin 1.5s linear infinite' : 'none' }} />
          </div>
        </div>

        <div className="eyebrow" style={{ marginBottom: '12px', color: status.color }}>{status.label}</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, color: 'var(--white)', marginBottom: '16px', fontSize: 'clamp(2rem,4vw,3rem)' }}>
          {status.title}
        </h1>
        <p style={{ color: 'var(--gray)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '40px' }}>
          {status.msg}
        </p>

        {error && (
          <div style={{ background: 'rgba(192,74,92,.10)', border: '1px solid rgba(192,74,92,.30)', borderRadius: '12px', padding: '14px', marginBottom: '24px', textAlign: 'left' }}>
            <p style={{ fontSize: '.85rem', color: 'var(--error)', fontWeight: 600 }}>Error: {error}</p>
          </div>
        )}

        {(isSuccess || isLoading) && (
          <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(175,31,58,.2)', borderRadius: '16px', padding: '28px', marginBottom: '32px', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '.75rem', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>Número de Pedido</p>
                <p style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '.95rem', fontFamily: 'monospace' }}>{finalOrderId}</p>
              </div>
              <div>
                <p style={{ fontSize: '.75rem', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>{method === 'cod' ? 'Total a Pagar' : 'Total'}</p>
                <p style={{ fontWeight: 700, color: 'var(--white)', fontSize: '1.05rem' }}>{formatCOP(finalTotal) || '$0'}</p>
              </div>
              <div>
                <p style={{ fontSize: '.75rem', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>Tiempo de Entrega</p>
                <p style={{ fontWeight: 600, color: 'var(--white)', fontSize: '.95rem' }}>Envío gratis a toda Colombia</p>
              </div>
              <div>
                <p style={{ fontSize: '.75rem', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>Estado</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: status.bg, color: status.color, padding: '4px 12px', borderRadius: '99px', fontSize: '.82rem', fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: status.color }} /> {status.label}
                </span>
              </div>
            </div>
            {tx?.payment_method && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--dark-4)' }}>
                <p style={{ fontSize: '.75rem', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>Método de Pago</p>
                <p style={{ fontWeight: 600, color: 'var(--white)', fontSize: '.95rem' }}>{tx.payment_method}</p>
              </div>
            )}
          </div>
        )}

        {isSuccess && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
            {[
              { icon: Mail, title: 'Email de Confirmación', desc: 'Te enviamos los detalles del pedido' },
              { icon: Package, title: 'Rastreo de Envío', desc: 'Número de rastreo por email' },
            ].map(({ icon: I, title, desc }) => (
              <div key={title} style={{ padding: '20px', background: 'var(--dark-2)', borderRadius: '12px', border: '1px solid var(--dark-4)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <I size={20} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: 600, color: 'var(--white)', fontSize: '.9rem', marginBottom: '4px' }}>{title}</p>
                  <p style={{ color: 'var(--gray)', fontSize: '.8rem' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {isFailed && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
            <Link href="/checkout" className="btn btn-primary">Intentar de nuevo</Link>
            <a href={`https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent('Hola, tuve problemas con mi pago en 6ixstars. Mi referencia es ' + finalOrderId)}`}
              target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
              <MessageCircle size={16} /> Contactar Soporte
            </a>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/tienda" id="confirm-continue-shopping" className="btn btn-primary btn-lg">
            Seguir Comprando <ArrowRight size={18} />
          </Link>
          <Link href="/" className="btn btn-outline">Ir al Inicio</Link>
        </div>

        {isSimulated && (
          <p style={{ marginTop: '32px', fontSize: '.78rem', color: 'var(--gray)', fontStyle: 'italic' }}>
            ⚠️ Modo simulación: Bold no está configurado. Define las claves en <code style={{ color: 'var(--gold)' }}>.env.local</code> para procesar pagos reales.
          </p>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
    </PageTransition>
  );
}
