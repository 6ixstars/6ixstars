'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { HOME_CONTENT_CACHE_TAG } from '@/lib/home-content';
import { HOME_SECTION_KEYS } from '@/lib/home-content-defaults';

/**
 * Guarda (upsert) el contenido de UNA sección de la home. `data` reemplaza
 * por completo lo guardado para esa sección (no hace merge parcial — el
 * form manda siempre el objeto completo de la sección).
 */
export async function saveHomeSection(section, data) {
  if (!supabaseAdmin) return { ok: false, error: 'Supabase no configurado en el servidor' };
  if (!HOME_SECTION_KEYS.includes(section)) return { ok: false, error: `Sección desconocida: ${section}` };

  const { error } = await supabaseAdmin
    .from('home_content')
    .upsert({ section, data, updated_at: new Date().toISOString() }, { onConflict: 'section' });

  if (error) return { ok: false, error: error.message };

  revalidateTag(HOME_CONTENT_CACHE_TAG);
  revalidatePath('/');
  return { ok: true };
}

/**
 * Borra el override de una sección → vuelve a mostrar el default hardcodeado.
 */
export async function resetHomeSection(section) {
  if (!supabaseAdmin) return { ok: false, error: 'Supabase no configurado en el servidor' };

  const { error } = await supabaseAdmin.from('home_content').delete().eq('section', section);
  if (error) return { ok: false, error: error.message };

  revalidateTag(HOME_CONTENT_CACHE_TAG);
  revalidatePath('/');
  return { ok: true };
}
