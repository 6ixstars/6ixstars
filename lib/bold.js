// Helpers de integración con Bold (pasarela de pago) — API real de Bold
// Docs: https://developers.bold.co (Pagos en línea → API Link de pagos, Consulta de transacciones, Webhook)

import crypto from 'node:crypto';

// === Variables de entorno ===
// Configurar en .env.local:
//   NEXT_PUBLIC_BOLD_PUBLIC_KEY = llave de identidad (pública) — dashboard Bold → Integraciones → Llaves
//   BOLD_SECRET_KEY             = llave secreta (server-side only, para validar webhooks)
//   NEXT_PUBLIC_SITE_URL        = https://6ixstars.com.co (o localhost en dev)
//
// Nota: en modo sandbox Bold usa la llave secreta como string vacío (según su doc de webhooks),
// así que en pruebas locales puedes dejar BOLD_SECRET_KEY="" explícito si necesitas validar
// webhooks de prueba.

export const BOLD_PUBLIC_KEY = process.env.NEXT_PUBLIC_BOLD_PUBLIC_KEY || '';
export const BOLD_SECRET_KEY = process.env.BOLD_SECRET_KEY || '';

// Solo la llave de identidad (pública) es necesaria para crear links de pago y consultar
// transacciones. La llave secreta solo se usa para validar la firma del webhook.
export const BOLD_CONFIGURED = !!BOLD_PUBLIC_KEY;

const BOLD_LINKS_API_URL = 'https://integrations.api.bold.co/online/link/v1';
const BOLD_PAYMENTS_API_URL = 'https://payments.api.bold.co';

// Genera referencia única por orden
export function generateReference() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SB-${ts}-${rand}`;
}

// formatCOP movido a lib/format.js para evitar pull-in de node:crypto en client bundles
export { formatCOP } from './format.js';

// Crea un link de pago hospedado por Bold. El cliente se redirige a la URL devuelta
// (igual que el checkout de Wompi) y Bold lo regresa a `redirectUrl` al terminar.
// A diferencia de Wompi, los montos de Bold van en pesos enteros, NO en centavos.
export async function createPaymentLink({
  reference,
  amountCop,
  currency = 'COP',
  description,
  redirectUrl,
  paymentMethods = ['CREDIT_CARD', 'PSE'],
  expirationMinutes = 30,
}) {
  const res = await fetch(BOLD_LINKS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `x-api-key ${BOLD_PUBLIC_KEY}`,
    },
    body: JSON.stringify({
      amount_type: 'CLOSE',
      amount: {
        currency,
        total_amount: Math.round(amountCop),
        tip_amount: 0,
      },
      reference,
      description: (description || 'Compra en 6ixstars').slice(0, 100),
      expiration_date: Date.now() + expirationMinutes * 60 * 1000,
      callback_url: redirectUrl,
      payment_methods: paymentMethods,
    }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.payload?.url) {
    const msg = json?.errors?.[0]?.message || json?.message || `Bold API error: ${res.status}`;
    throw new Error(msg);
  }
  return { paymentLink: json.payload.payment_link, url: json.payload.url };
}

// Consulta el estado de una transacción por referencia (payment-voucher).
// Solo funciona para transacciones de Botón de pagos / Link de pagos (no Pagos en Línea con API cruda).
export async function fetchPaymentVoucher(reference) {
  const res = await fetch(`${BOLD_PAYMENTS_API_URL}/v2/payment-voucher/${encodeURIComponent(reference)}`, {
    cache: 'no-store',
    headers: { 'Authorization': `x-api-key ${BOLD_PUBLIC_KEY}` },
  });
  if (!res.ok) throw new Error(`Bold API error: ${res.status}`);
  return res.json();
}

// Traduce el vocabulario de estados de Bold (payment_status / evento de webhook) al vocabulario
// interno que ya usa el resto de la app (heredado de Wompi): approved | pending | declined | voided.
// Devuelve null cuando Bold todavía no tiene nada que reportar (ej: NO_TRANSACTION_FOUND).
export function mapBoldStatus(boldStatus) {
  switch (boldStatus) {
    case 'APPROVED':
    case 'SALE_APPROVED':
      return 'approved';
    case 'REJECTED':
    case 'FAILED':
    case 'SALE_REJECTED':
      return 'declined';
    case 'VOIDED':
    case 'VOID_APPROVED':
      return 'voided';
    case 'PROCESSING':
    case 'PENDING':
      return 'pending';
    default:
      return null;
  }
}

// Consulta una transacción por referencia y la devuelve normalizada al vocabulario interno.
// Devuelve null si Bold aún no tiene ninguna transacción asociada a esa referencia.
export async function fetchTransactionByReference(reference) {
  const voucher = await fetchPaymentVoucher(reference);
  const status = mapBoldStatus(voucher.payment_status);
  if (!status) return null;
  return {
    status,
    id: voucher.transaction_id || null,
    reference: voucher.reference_id || reference,
    total: voucher.total ?? null,
    raw: voucher,
  };
}

// Valida la firma de un webhook de Bold.
// Esquema real de Bold: HMAC-SHA256( base64(rawBody), secretKey ) → hex, comparado contra
// el header `x-bold-signature`. Debe calcularse sobre el body CRUDO (string), no sobre el
// objeto ya parseado — por eso recibe el rawBody como string.
export function validateWebhookSignature(rawBody, signatureHeader) {
  if (!BOLD_SECRET_KEY && BOLD_SECRET_KEY !== '') return false;
  if (!signatureHeader) return false;
  const encoded = Buffer.from(rawBody, 'utf8').toString('base64');
  const expected = crypto.createHmac('sha256', BOLD_SECRET_KEY).update(encoded).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signatureHeader, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
