// Helpers de integración con Bold (pasarela de pago)
//
// TODO(pasarela-bold): esta lógica (URLs, formato de checkout, algoritmo de firma
// de integridad y de validación de webhook) todavía es la de Wompi tal cual — solo
// se renombraron variables/exports a BOLD_*. Falta reemplazarla por la real de Bold
// en cuanto tengamos su documentación/API keys. No usar en producción hasta entonces.
// Docs pendientes: (agregar aquí el link a la documentación de Bold cuando se tenga)

import crypto from 'node:crypto';

// === Variables de entorno ===
// Configurar en .env.local:
//   NEXT_PUBLIC_BOLD_PUBLIC_KEY = pub_test_xxx (o pub_prod_xxx)
//   BOLD_INTEGRITY_SECRET       = xxx (server-side only)
//   BOLD_EVENTS_SECRET          = xxx (para validar webhooks)
//   NEXT_PUBLIC_SITE_URL        = https://6ixstars.com.co (o localhost en dev)

export const BOLD_PUBLIC_KEY = process.env.NEXT_PUBLIC_BOLD_PUBLIC_KEY || '';
export const BOLD_PRIVATE_KEY = process.env.BOLD_PRIVATE_KEY || '';
export const BOLD_INTEGRITY_SECRET = process.env.BOLD_INTEGRITY_SECRET || '';
export const BOLD_EVENTS_SECRET = process.env.BOLD_EVENTS_SECRET || '';

export const BOLD_IS_TEST = BOLD_PUBLIC_KEY.startsWith('pub_test_');
export const BOLD_IS_PROD = BOLD_PUBLIC_KEY.startsWith('pub_prod_');
export const BOLD_CONFIGURED = !!BOLD_PUBLIC_KEY && !!BOLD_INTEGRITY_SECRET;

// TODO(pasarela-bold): reemplazar por los endpoints reales de la API de Bold.
export const BOLD_API_URL = BOLD_IS_PROD
  ? 'https://production.wompi.co/v1'
  : 'https://sandbox.wompi.co/v1';

// TODO(pasarela-bold): reemplazar por la URL real de checkout de Bold.
export const BOLD_CHECKOUT_URL = 'https://checkout.wompi.co/p/';

// Genera referencia única por orden
export function generateReference() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SB-${ts}-${rand}`;
}

// Firma de integridad SHA256 (server-side)
// String: reference + amount-in-cents + currency + integrity-secret
// TODO(pasarela-bold): validar que Bold use el mismo esquema de firma; si no, ajustar.
export function generateSignature({ reference, amountInCents, currency = 'COP' }) {
  if (!BOLD_INTEGRITY_SECRET) {
    throw new Error('BOLD_INTEGRITY_SECRET not configured');
  }
  const concatenated = `${reference}${amountInCents}${currency}${BOLD_INTEGRITY_SECRET}`;
  return crypto.createHash('sha256').update(concatenated).digest('hex');
}

// Convierte un monto COP a centavos. Bold requiere amount-in-cents.
// Los precios en products.js están en COP (ej: 205000 = $205.000 COP)
export function toAmountInCents(copAmount) {
  return Math.round(copAmount) * 100;
}

// formatCOP movido a lib/format.js para evitar pull-in de node:crypto en client bundles
export { formatCOP } from './format.js';

// Construye URL preservando los colones (`:`) literales en las keys.
// URLSearchParams los encodea como %3A, lo que en algunos casos hace que la pasarela
// rechace la request en CloudFront.
function buildQueryPreservingColons(entries) {
  const parts = [];
  for (const [k, v] of entries) {
    if (v == null || v === '') continue;
    // Solo escapamos el value, NO la key (porque queremos colones literales).
    parts.push(`${k}=${encodeURIComponent(String(v))}`);
  }
  return parts.join('&');
}

// TODO(pasarela-bold): validar que el formato de parámetros del checkout (nombres de
// campos como "public-key", "signature:integrity", etc.) sea el que espera Bold.
export function buildCheckoutUrl({
  reference,
  amountInCents,
  signature,
  redirectUrl,
  currency = 'COP',
  customerEmail,
  customerFullName,
  customerPhoneNumber,
  shippingLine1,
  shippingCity,
  shippingRegion,
  shippingCountry = 'CO',
}) {
  // La pasarela necesita el teléfono como prefix (+57) separado del número (10 dígitos).
  // Si no se separa, el campo no se pre-rellena y el usuario tiene que volver a tipearlo.
  const phoneDigits = (customerPhoneNumber || '').toString().replace(/\D/g, '').slice(-10);
  const hasPhone = phoneDigits.length === 10;

  const entries = [
    ['public-key', BOLD_PUBLIC_KEY],
    ['currency', currency],
    ['amount-in-cents', String(amountInCents)],
    ['reference', reference],
    ['signature:integrity', signature],
    ['redirect-url', redirectUrl],
    ['customer-data:email', customerEmail],
    ['customer-data:full-name', customerFullName],
    ['customer-data:phone-number', hasPhone ? phoneDigits : null],
    ['customer-data:phone-number-prefix', hasPhone ? '+57' : null],
    ['customer-data:legal-id', null],
    ['customer-data:legal-id-type', null],
    ['shipping-address:address-line-1', shippingLine1],
    ['shipping-address:city', shippingCity],
    ['shipping-address:region', shippingRegion],
    ['shipping-address:country', shippingLine1 ? shippingCountry : null],
    ['shipping-address:phone-number', hasPhone ? phoneDigits : null],
    ['shipping-address:phone-number-prefix', hasPhone ? '+57' : null],
  ];
  return `${BOLD_CHECKOUT_URL}?${buildQueryPreservingColons(entries)}`;
}

// Bold requiere la private key (no la public) para consultas server-side de transacciones.
const boldAuthKey = () => BOLD_PRIVATE_KEY || BOLD_PUBLIC_KEY;

// Consulta el estado de una transacción usando el ID que Bold devuelve en el callback
export async function fetchTransaction(id) {
  const res = await fetch(`${BOLD_API_URL}/transactions/${id}`, {
    cache: 'no-store',
    headers: { 'Authorization': `Bearer ${boldAuthKey()}` },
  });
  if (!res.ok) throw new Error(`Bold API error: ${res.status}`);
  const json = await res.json();
  return json.data;
}

// Consulta transacciones por reference (la que generamos al iniciar el checkout).
// Devuelve la más reciente o null si no hay ninguna.
export async function fetchTransactionByReference(reference) {
  const url = `${BOLD_API_URL}/transactions?reference=${encodeURIComponent(reference)}`;
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'Authorization': `Bearer ${boldAuthKey()}` },
  });
  if (!res.ok) throw new Error(`Bold API error: ${res.status}`);
  const json = await res.json();
  const txs = Array.isArray(json.data) ? json.data : [];
  if (txs.length === 0) return null;
  txs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return txs[0];
}

// Valida la firma de un evento webhook de Bold
// TODO(pasarela-bold): confirmar el esquema real de firma de webhooks de Bold.
export function validateWebhookSignature(payload) {
  if (!BOLD_EVENTS_SECRET) return false;
  const { signature, timestamp, data } = payload;
  if (!signature?.checksum || !signature?.properties) return false;
  // Reconstruir el string firmado
  const concatenated = signature.properties
    .map(p => p.split('.').reduce((obj, k) => obj?.[k], data))
    .join('') + timestamp + BOLD_EVENTS_SECRET;
  const expected = crypto.createHash('sha256').update(concatenated).digest('hex');
  return expected === signature.checksum;
}
