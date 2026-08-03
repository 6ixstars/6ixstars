// API route: consulta el estado de un pago Bold por referencia (payment-voucher)
// GET /api/bold/transaction?reference=SB-XXXX

import { NextResponse } from 'next/server';
import { fetchPaymentVoucher, BOLD_CONFIGURED } from '@/lib/bold';

export async function GET(req) {
  try {
    if (!BOLD_CONFIGURED) {
      return NextResponse.json({ error: 'Bold no configurado' }, { status: 503 });
    }
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');
    if (!reference) return NextResponse.json({ error: 'reference requerido' }, { status: 400 });

    const voucher = await fetchPaymentVoucher(reference);
    return NextResponse.json(voucher);
  } catch (err) {
    console.error('[Bold tx error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
