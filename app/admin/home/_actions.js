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
 * Sube UNA imagen o video para el contenido de la home y devuelve la URL
 * pública. Mismo patrón que uploadProductImage — vive acá aparte porque el
 * admin de home necesita aceptar también video/mp4 (hero) y tolera archivos
 * más pesados.
 */
export async function uploadHomeAsset(formData) {
  if (!supabaseAdmin) return { ok: false, error: 'Supabase no configurado en el servidor' };

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return { ok: false, error: 'No se recibió ningún archivo' };
  }

  const mime = file.type || '';
  const isImage = IMAGE_TYPES.test(mime);
  const isVideo = VIDEO_TYPES.test(mime);
  if (!isImage && !isVideo) {
    return { ok: false, error: `Tipo no soportado (${mime}). Usa JPG, PNG, WebP, AVIF o MP4/WebM.` };
  }
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return { ok: false, error: `El archivo pesa más de ${Math.round(maxBytes / 1024 / 1024)}MB. Comprímelo antes de subir.` };
  }

  const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg').replace('quicktime', 'mov');
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  const path = `home-${stamp}-${rand}.${ext}`;

  let { error: upErr } = await supabaseAdmin.storage
    .from(HOME_BUCKET)
    .upload(path, file, {
      contentType: mime,
      cacheControl: '31536000, immutable',
      upsert: false,
    });

  // Self-healing: si el bucket todavía no existe, lo creamos (público, con la
  // service role key) y reintentamos UNA vez — así nadie tiene que entrar al
  // dashboard de Supabase a crearlo a mano la primera vez que se usa.
  if (upErr && /not found|bucket/i.test(upErr.message)) {
    const { error: createErr } = await supabaseAdmin.storage.createBucket(HOME_BUCKET, {
      public: true,
      fileSizeLimit: MAX_VIDEO_BYTES,
    });
    if (!createErr || /already exists/i.test(createErr.message || '')) {
      ({ error: upErr } = await supabaseAdmin.storage
        .from(HOME_BUCKET)
        .upload(path, file, {
          contentType: mime,
          cacheControl: '31536000, immutable',
          upsert: false,
        }));
    }
  }

  if (upErr) {
    return { ok: false, error: `Upload a Storage: ${upErr.message}` };
  }

  const { data: pub } = supabaseAdmin.storage.from(HOME_BUCKET).getPublicUrl(path);
  return { ok: true, url: pub?.publicUrl, isVideo };
}
