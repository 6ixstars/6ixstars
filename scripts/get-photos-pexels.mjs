// Descarga fotos reales de streetwear desde Pexels (gratis, licencia comercial).
// Key gratis (SIN tarjeta) en: https://www.pexels.com/api/new/
// Uso: PEXELS_KEY=xxxx node scripts/get-photos-pexels.mjs  (o en .env.local)
// Salida: public/img/gen/*.webp

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

let KEY = process.env.PEXELS_KEY;
if (!KEY) { try { KEY = (fs.readFileSync('.env.local', 'utf8').match(/^PEXELS_KEY\s*=\s*(.+)$/m) || [])[1]?.trim(); } catch {} }
if (!KEY) { console.error('✖ Falta PEXELS_KEY. Gratis (sin tarjeta) en https://www.pexels.com/api/new/'); process.exit(1); }

const OUT = 'public/img/gen';
fs.mkdirSync(OUT, { recursive: true });

// name, query, orientation, pick (índice dentro de los resultados para variar)
const JOBS = [
  ['hero-model',    'streetwear fashion man hoodie portrait', 'portrait', 0],
  ['look-01',       'puffer jacket man fashion', 'portrait', 1],
  ['look-02',       'denim jeans street fashion man', 'portrait', 1],
  ['look-03',       'man cap streetwear portrait', 'portrait', 2],
  ['cat-bermudas',  'man shorts summer street style', 'portrait', 1],
  ['cat-conjuntos', 'man tracksuit streetwear', 'portrait', 0],
  ['cat-camisas',   'man shirt street style', 'portrait', 1],
  ['cat-buzos',     'man hoodie street fashion', 'portrait', 2],
  ['cat-jeans',     'baggy jeans street fashion', 'portrait', 2],
  ['cat-gorras',    'snapback cap hat fashion', 'portrait', 0],
  ['spotlight',     'streetwear hoodie model studio', 'portrait', 0],
  ['campaign',      'group friends streetwear urban', 'landscape', 0],
];

async function search(query, orientation) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=10`;
  const res = await fetch(url, { headers: { Authorization: KEY } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 120)}`);
  return (await res.json()).photos || [];
}

let ok = 0;
for (const [name, query, orientation, pick] of JOBS) {
  process.stdout.write(`→ ${name} … `);
  try {
    const photos = await search(query, orientation);
    if (!photos.length) { console.log('sin resultados'); continue; }
    const photo = photos[Math.min(pick, photos.length - 1)];
    const src = photo.src.large2x || photo.src.original || photo.src.large;
    const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
    await sharp(buf).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(OUT, `${name}.webp`));
    ok++; console.log(`ok  (© ${photo.photographer})`);
  } catch (e) { console.log('FALLÓ →', e.message); }
}
console.log(`\n✔ Descargadas ${ok}/${JOBS.length} fotos en ${OUT}/`);
