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

const HOME_BUCKET = 'product-images'; // mismo bucket que ya usa el uploader de productos
const IMAGE_TYPES = /^image\/(jpeg|jpg|png|webp|avif)$/i;
const VIDEO_TYPES = /^video\/(mp4|webm|quicktime)$/i;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO_BYTES = 60 * 1024 * 1024;  // 60MB

/**
 * Emite una signed upload URL para subir UN archivo directo del navegador a
 * Supabase Storage. Vercel impone un límite duro de ~4.5MB en el body de
 * cualquier Serverless/Server Action — no configurable desde next.config —
 * así que un video no puede pasar *por* nuestro servidor: el cliente sube
 * directo a Supabase con este token firmado y nosotros solo lo emitimos.
 */
export async function createHomeUploadTicket(mime, size) {
  if (!supabaseAdmin) return { ok: false, error: 'Supabase no configurado en el servidor' };

  const isImage = IMAGE_TYPES.test(mime || '');
  const isVideo = VIDEO_TYPES.test(mime || '');
  if (!isImage && !isVideo) {
    return { ok: false, error: `Tipo no soportado (${mime}). Usa JPG, PNG, WebP, AVIF o MP4/WebM.` };
  }
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (size > maxBytes) {
    return { ok: false, error: `El archivo pesa más de ${Math.round(maxBytes / 1024 / 1024)}MB. Comprímelo antes de subir.` };
  }

  const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg').replace('quicktime', 'mov');
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  const path = `home-${stamp}-${rand}.${ext}`;

  let { data, error: signErr } = await supabaseAdmin.storage.from(HOME_BUCKET).createSignedUploadUrl(path);

  // Self-healing: si el bucket todavía no existe, lo creamos (público, con la
  // service role key) y reintentamos UNA vez — así nadie tiene que entrar al
  // dashboard de Supabase a crearlo a mano la primera vez que se usa. Supabase
  // no siempre dice "not found"/"bucket" en el mensaje (a veces es "The
  // related resource does not exist"), así que reintentamos ante CUALQUIER
  // error de firma — createBucket ya es un no-op seguro si ya existiera.
  if (signErr) {
    const { error: createErr } = await supabaseAdmin.storage.createBucket(HOME_BUCKET, {
      public: true,
      fileSizeLimit: MAX_VIDEO_BYTES,
    });
    if (createErr && !/already exists/i.test(createErr.message || '')) {
      return { ok: false, error: `No se pudo crear el bucket: ${createErr.message} | ${JSON.stringify(createErr)}` };
    }
    // Pequeño margen por si el bucket recién creado tarda en propagarse.
    for (let attempt = 0; attempt < 3 && signErr; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 800));
      ({ data, error: signErr } = await supabaseAdmin.storage.from(HOME_BUCKET).createSignedUploadUrl(path));
    }
  }

  if (signErr) {
    return { ok: false, error: `No se pudo preparar la subida: ${signErr.message} | ${JSON.stringify(signErr)}` };
  }

  const { data: pub } = supabaseAdmin.storage.from(HOME_BUCKET).getPublicUrl(path);
  return {
    ok: true,
    bucket: HOME_BUCKET,
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: pub?.publicUrl,
    isVideo,
  };
}
