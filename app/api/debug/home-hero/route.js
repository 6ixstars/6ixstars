import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { HOME_CONTENT_CACHE_TAG } from '@/lib/home-content';

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ error: 'no supabaseAdmin' });
  const { data, error } = await supabaseAdmin.from('home_content').select('section, updated_at, data');
  const summary = (data || []).map((r) => ({
    section: r.section,
    updated_at: r.updated_at,
    topLevelKeys: Object.keys(r.data || {}),
    hasNestedValue: !!(r.data && typeof r.data === 'object' && 'value' in r.data),
  }));
  return NextResponse.json({ summary, error });
}

// Repara la fila 'hero', corrompida por un bug ya arreglado que guardaba el
// contenido envuelto en {value:...} en vez de plano. Se llama una sola vez.
export async function POST() {
  if (!supabaseAdmin) return NextResponse.json({ error: 'no supabaseAdmin' });
  const { data: rows, error: readErr } = await supabaseAdmin.from('home_content').select('data').eq('section', 'hero');
  if (readErr || !rows?.[0]) return NextResponse.json({ error: readErr || 'no row' });

  let clean = rows[0].data;
  let depth = 0;
  // Desenvuelve niveles que son SOLO {value: X} (sin otras keys).
  while (clean && typeof clean === 'object' && 'value' in clean && Object.keys(clean).length === 1 && depth < 5) {
    clean = clean.value;
    depth++;
  }
  // El nivel real puede traer una key "value" residual junto a los campos
  // buenos (kicker, video2, etc.) — la sacamos sin tocar el resto.
  if (clean && typeof clean === 'object' && 'value' in clean) {
    const { value, ...rest } = clean;
    clean = rest;
  }
  const { error: writeErr } = await supabaseAdmin
    .from('home_content')
    .upsert({ section: 'hero', data: clean, updated_at: new Date().toISOString() }, { onConflict: 'section' });

  revalidateTag(HOME_CONTENT_CACHE_TAG);
  revalidatePath('/');
  return NextResponse.json({ ok: !writeErr, unwrapDepth: depth, clean, writeErr });
}
