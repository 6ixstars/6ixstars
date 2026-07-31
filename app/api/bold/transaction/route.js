// API route: consulta el estado de una transacción Bold por ID
// GET /api/bold/transaction?id=TRX_ID

import { NextResponse } from 'next/server';
import { fetchTransaction, BOLD_CONFIGURED } from '@/lib/bold';

export async function GET(req) {
  try {
    if (!BOLD_CONFIGURED) {
      return NextResponse.json({ error: 'Bold no configurado' }, { status: 503 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    const tx = await fetchTransaction(id);
    return NextResponse.json(tx);
  } catch (err) {
    console.error('[Bold tx error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
