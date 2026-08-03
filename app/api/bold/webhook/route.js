import { NextResponse } from 'next/server';
import { validateWebhookSignature, mapBoldStatus } from '@/lib/bold';
import { supabaseAdmin } from '@/lib/supabase';
import { notifyAdminNewOrder } from '@/lib/notifications';
import { sendOrderPush } from '@/lib/push';

export async function POST(req) {
  try {
    // La firma se calcula sobre el body CRUDO (ver lib/bold.js) — hay que leerlo como texto
    // antes de parsearlo, si no la firma nunca va a coincidir.
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-bold-signature');

    if (!validateWebhookSignature(rawBody, signatureHeader)) {
      console.warn('[Bold webhook] Firma inválida');
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { type, data } = payload;
    const status = mapBoldStatus(type); // SALE_APPROVED/SALE_REJECTED/VOID_APPROVED → approved/declined/voided

    // TODO(pasarela-bold): el nombre exacto del campo que trae nuestra referencia dentro de
    // `data` para transacciones de Botón/Link de pagos no está 100% confirmado en la doc
    // pública de Bold (sí lo está para la API de pagos en línea cruda: `metadata.reference`).
    // Se prueban los candidatos más probables; si Bold cambia el nombre, el cron diario y el
    // botón "Sincronizar pendientes" en /admin/orders (que consultan por referencia, no por
    // webhook) siguen cubriendo el caso como respaldo.
    const reference = data?.metadata?.reference || data?.reference_id || data?.order_id;
    const txId = data?.payment_id || data?.bold_code || null;

    if (!status || !reference) {
      console.log(`[Bold webhook] Evento ignorado: type=${type} reference=${reference}`, JSON.stringify(data));
      return NextResponse.json({ ok: true, ignored: type });
    }

    console.log(`[Bold] ${reference} → ${status} (txId: ${txId})`);

    if (!supabaseAdmin) {
      console.error('[Bold webhook] supabaseAdmin no disponible — saltando persistencia');
      return NextResponse.json({ ok: true, persisted: false });
    }

    // Actualizar orden
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({
        status,
        bold_tx_id: txId,
        updated_at: new Date().toISOString(),
      })
      .eq('reference', reference)
      .select('id, status')
      .single();

    if (updateErr || !updated) {
      console.warn(`[Bold webhook] No se encontró orden con reference=${reference}`, updateErr?.message);
      return NextResponse.json({ ok: true, found: false });
    }

    // Si la transacción quedó aprobada: notificar admin/cliente + decrementar inventario.
    //
    // IMPORTANTE: usamos `await` (NO fire-and-forget). En Vercel Functions, apenas
    // retornamos la respuesta al webhook, el container muere y las promesas en
    // background se cancelan a mitad — antes incluso de que se haga la llamada
    // HTTP a Resend. Por eso los emails automáticos no llegaban. Bold tolera
    // webhooks lentos (hasta 30s), así que esperar 1-2s extra es aceptable.
    //
    // Las 3 tareas corren en paralelo (Promise.allSettled) para que el fallo de
    // una no aborte las otras — los emails de cliente, admin, y la decrementación
    // de inventario son independientes.
    if (status === 'approved') {
      const { data: fullOrder } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', updated.id)
        .single();

      if (fullOrder) {
        const items = fullOrder.order_items || [];
        const [notifyRes, pushRes, invRes] = await Promise.allSettled([
          notifyAdminNewOrder(fullOrder, items),
          sendOrderPush(fullOrder),
          decrementInventory(updated.id),
        ]);
        if (notifyRes.status === 'rejected') console.error('[notify]', notifyRes.reason);
        if (pushRes.status === 'rejected')   console.error('[push]',   pushRes.reason);
        if (invRes.status === 'rejected')    console.error('[inv]',    invRes.reason);
      } else {
        // fullOrder vino null — extraño pero no fatal; al menos decrementamos.
        await decrementInventory(updated.id).catch(e => console.error('[inv]', e));
      }
    }

    return NextResponse.json({ ok: true, orderId: updated.id, status });
  } catch (err) {
    console.error('[Bold webhook error]', err);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

async function decrementInventory(orderId) {
  try {
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('product_id, product_name, product_slug, quantity')
      .eq('order_id', orderId);

    if (!items?.length) return;

    for (const item of items) {
      // Lee fila actual (si no existe, la creamos en 0 — el admin tendrá que poblar el inventario inicial)
      const { data: inv } = await supabaseAdmin
        .from('inventory')
        .select('stock')
        .eq('product_id', item.product_id)
        .single();

      if (inv) {
        const newStock = Math.max(0, inv.stock - item.quantity);
        await supabaseAdmin
          .from('inventory')
          .update({ stock: newStock, updated_at: new Date().toISOString() })
          .eq('product_id', item.product_id);
        console.log(`[Inventory] ${item.product_id} ${inv.stock} → ${newStock} (-${item.quantity})`);
      } else {
        // Crear con stock 0 (negativo si vendiste sin stock registrado)
        await supabaseAdmin
          .from('inventory')
          .insert({
            product_id: item.product_id,
            product_name: item.product_name,
            product_slug: item.product_slug,
            stock: -item.quantity,
          });
        console.log(`[Inventory] ${item.product_id} creado con stock=${-item.quantity} (sin registro previo)`);
      }
    }
  } catch (err) {
    console.error('[Inventory decrement error]', err);
  }
}
