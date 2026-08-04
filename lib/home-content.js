// Data access layer: contenido editable de la home, leído desde Supabase
// con fallback a los defaults hardcodeados (lib/home-content-defaults.js)
// sección por sección — si Supabase no está configurado, la tabla no existe
// todavía, o falta alguna sección puntual, el sitio se ve exactamente igual
// que antes de que esto existiera.

import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from './supabase.js';
import { HOME_DEFAULTS } from './home-content-defaults.js';

export const HOME_CONTENT_CACHE_TAG = 'home-content';

async function _getHomeContent() {
  if (!supabaseAdmin) return HOME_DEFAULTS;

  const { data, error } = await supabaseAdmin.from('home_content').select('section, data');
  if (error || !data?.length) return HOME_DEFAULTS;

  const bySection = new Map(data.map(r => [r.section, r.data]));
  const merged = {};
  for (const key of Object.keys(HOME_DEFAULTS)) {
    const override = bySection.get(key);
    merged[key] = override && typeof override === 'object'
      ? { ...HOME_DEFAULTS[key], ...override }
      : HOME_DEFAULTS[key];
  }
  return merged;
}

export const getHomeContent = unstable_cache(
  _getHomeContent,
  ['home-content'],
  { tags: [HOME_CONTENT_CACHE_TAG], revalidate: 300 }
);
